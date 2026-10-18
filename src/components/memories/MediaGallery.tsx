'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ImagePlus, Loader2, Play, Trash2, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { apiFetch } from '@/lib/identity';
import { fmt } from '@/i18n/ecosystem';
import type { MediaItem } from '@/lib/ecosystemTypes';

const MAX_VIDEO_MB = 50;
const MAX_PHOTO_EDGE = 2048;

export const mediaUrl = (tripId: string, item: MediaItem) => `/api/media/${tripId}/${item.file}`;

/**
 * Resize a photo in the browser before upload. Re-encoding through a canvas also drops EXIF
 * metadata, so GPS location never leaves the phone.
 */
async function preparePhoto(file: File): Promise<{ blob: Blob; width: number; height: number } | null> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, MAX_PHOTO_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.85));
    return blob ? { blob, width, height } : null;
  } catch {
    return null; // e.g. HEIC on a browser that can't decode it
  }
}

/** Photos & videos of one trip: grid, full-screen viewer, and (for the owner) upload/remove. */
export function MediaGallery({
  tripId,
  items,
  owner,
  onChange,
  compact = false
}: {
  tripId: string;
  items: MediaItem[];
  owner: boolean;
  onChange?: (items: MediaItem[]) => void;
  compact?: boolean;
}) {
  const { t } = useLanguage();
  const m = t.eco.media;
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [viewing, setViewing] = useState<number | null>(null);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = [...files];
    const problems: string[] = [];
    let current = [...items];
    for (let i = 0; i < list.length; i++) {
      const f = list[i];
      setProgress(fmt(m.adding, { n: `${i + 1}/${list.length}` }));
      const form = new FormData();
      if (f.type.startsWith('image/')) {
        const photo = await preparePhoto(f);
        if (!photo) {
          problems.push(fmt(m.badType, { name: f.name }));
          continue;
        }
        form.append('file', photo.blob, 'photo.jpg');
        form.append('width', String(photo.width));
        form.append('height', String(photo.height));
      } else if (f.type.startsWith('video/')) {
        if (f.size > MAX_VIDEO_MB * 1024 * 1024) {
          problems.push(fmt(m.tooBig, { name: f.name, max: MAX_VIDEO_MB }));
          continue;
        }
        form.append('file', f, f.name);
      } else {
        problems.push(fmt(m.badType, { name: f.name }));
        continue;
      }
      try {
        const res = await apiFetch('traveler', `/api/trips/${tripId}/media`, { method: 'POST', body: form });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          problems.push(
            data?.error === 'limit' ? m.limit : data?.error === 'too-big' ? fmt(m.tooBig, { name: f.name, max: MAX_VIDEO_MB }) : data?.error === 'bad-type' ? fmt(m.badType, { name: f.name }) : fmt(m.failed, { name: f.name })
          );
          if (data?.error === 'limit') break;
          continue;
        }
        current = [...current, data.item as MediaItem];
        onChange?.(current);
      } catch {
        problems.push(fmt(m.failed, { name: f.name }));
      }
    }
    setProgress(null);
    setErrors(problems);
    if (inputRef.current) inputRef.current.value = '';
  };

  const remove = async (item: MediaItem) => {
    const res = await apiFetch('traveler', `/api/trips/${tripId}/media?mid=${item.id}`, { method: 'DELETE' });
    if (res.ok) onChange?.(items.filter((x) => x.id !== item.id));
  };

  const shown = compact ? items.slice(0, 6) : items;

  return (
    <div className="space-y-3">
      {owner && (
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={inputRef}
            id={`upload-${tripId}`}
            type="file"
            accept="image/*,video/*"
            multiple
            className="sr-only"
            onChange={(e) => void upload(e.target.files)}
            disabled={!!progress}
          />
          <label
            htmlFor={`upload-${tripId}`}
            className={`px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 cursor-pointer bg-emerald-600 hover:bg-(--action-hover) text-white ${
              progress ? 'opacity-60 pointer-events-none' : ''
            }`}
          >
            {progress ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <ImagePlus className="w-4 h-4" aria-hidden="true" />}
            {progress ?? m.add}
          </label>
          <span className="text-xs text-stone-500">{m.hint}</span>
        </div>
      )}
      {errors.length > 0 && (
        <ul role="alert" className="text-sm text-red-400 space-y-0.5">
          {errors.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-stone-500">{owner ? m.emptyOwner : m.empty}</p>
      ) : (
        <ul className={`grid gap-2 ${compact ? 'grid-cols-3 sm:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'}`}>
          {shown.map((item, i) => (
            <li key={item.id} className="relative group aspect-square rounded-lg overflow-hidden bg-stone-800">
              <button
                type="button"
                onClick={() => setViewing(i)}
                className="w-full h-full cursor-zoom-in"
                aria-label={`${item.kind === 'video' ? 'Video' : 'Photo'} ${i + 1}`}
              >
                {item.kind === 'photo' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrl(tripId, item)} alt="" loading="lazy" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <video src={`${mediaUrl(tripId, item)}#t=0.5`} preload="metadata" muted playsInline className="w-full h-full object-cover" />
                    <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                      <span className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
                        <Play className="w-5 h-5 text-white" />
                      </span>
                    </span>
                  </>
                )}
              </button>
              {owner && !compact && (
                <button
                  type="button"
                  onClick={() => void remove(item)}
                  aria-label={`${m.remove} ${i + 1}`}
                  className="absolute top-1.5 right-1.5 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center opacity-90 hover:bg-red-600 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {viewing !== null && items[viewing] && (
        <Lightbox tripId={tripId} items={items} index={viewing} onIndex={setViewing} onClose={() => setViewing(null)} />
      )}
    </div>
  );
}

/** Full-screen viewer on a native <dialog> (focus trap, Esc to close). Arrow keys navigate. */
function Lightbox({
  tripId,
  items,
  index,
  onIndex,
  onClose
}: {
  tripId: string;
  items: MediaItem[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const m = t.eco.media;
  const ref = useRef<HTMLDialogElement>(null);
  const item = items[index];

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
    return () => d?.close();
  }, []);

  const go = (delta: number) => onIndex((index + delta + items.length) % items.length);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(1);
        if (e.key === 'ArrowLeft') go(-1);
      }}
      aria-label={m.title}
      className="m-0 p-0 w-screen h-screen max-w-none max-h-none bg-black/95 text-white backdrop:bg-black/80"
    >
      <div className="w-full h-full flex items-center justify-center p-4 sm:p-12">
        {item.kind === 'photo' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl(tripId, item)} alt="" className="max-w-full max-h-full object-contain" />
        ) : (
          <video key={item.id} src={mediaUrl(tripId, item)} controls autoPlay playsInline className="max-w-full max-h-full" />
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        autoFocus
        aria-label={m.close}
        className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
      >
        <X className="w-5 h-5" aria-hidden="true" />
      </button>
      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label={m.prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label={m.next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" aria-hidden="true" />
          </button>
        </>
      )}
      <p className="absolute bottom-4 inset-x-0 text-center text-sm text-white/80">
        {index + 1} / {items.length}
      </p>
    </dialog>
  );
}
