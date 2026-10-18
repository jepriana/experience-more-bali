'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Check, Download, LocateFixed, Loader2, MapPin, Pause, Play, Plus, RefreshCw, Ticket } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { apiFetch } from '@/lib/identity';
import { fmt } from '@/i18n/ecosystem';
import { tagUrl } from '@/lib/memoryLink';
import { TRACKS } from '@/lib/credentials';
import { getBaliRegion } from '@/data/regions';
import { downloadCounterCard } from '@/lib/printFiles';
import { slugify } from '@/lib/sticker';
import type { CredentialTrack, OwnedTag } from '@/lib/ecosystemTypes';
import { Field, inputClass } from '@/components/onboarding/SignupFields';
import { QrImage } from '@/components/memory/QrImage';

const DISCOUNTS = [0, 5, 10, 15, 20, 25, 30];
const SPOT_RADIUS_M = 300;

/**
 * Partner tab "QR tags": destination tags for summits, trailheads, dive spots… Scanning collects
 * an achievement (credentials) and/or claims a one-time discount. The partner owns the tag and
 * sees its numbers: scans, achievements, claims, discounts used and where visitors come from.
 */
export function PartnerTags() {
  const { t } = useLanguage();
  const g = t.eco.tags;
  const [tags, setTags] = useState<OwnedTag[] | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const res = await apiFetch('partner', '/api/tags');
    if (!res.ok) throw new Error();
    setTags((await res.json()).tags);
  }, []);

  useEffect(() => {
    let alive = true;
    apiFetch('partner', '/api/tags')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => alive && setTags(d.tags))
      .catch(() => alive && setError(g.error));
    return () => {
      alive = false;
    };
  }, [g.error]);

  /** POST an action, reload the list; returns the response body (or null on failure) */
  const act = useCallback(
    async (body: Record<string, unknown>): Promise<{ ok: boolean; data: Record<string, unknown> | null }> => {
      setError('');
      try {
        const res = await apiFetch('partner', '/api/tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const data = await res.json().catch(() => null);
        if (res.ok) await load().catch(() => undefined);
        return { ok: res.ok, data };
      } catch {
        return { ok: false, data: null };
      }
    },
    [load]
  );

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold text-stone-50">{g.title}</h2>
        <p className="text-stone-400 max-w-3xl">{g.subtitle}</p>
        <p className="text-sm text-emerald-300 max-w-3xl">{g.ownership}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CreateTag act={act} />
        <RedeemCode act={act} />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-400 font-semibold">
          {error}
        </p>
      )}

      <section aria-labelledby="my-tags-title" className="space-y-3">
        <h3 id="my-tags-title" className="text-xl font-bold text-stone-50">
          {g.tab}
        </h3>
        {tags === null ? (
          !error && (
            <p className="text-stone-400 flex items-center gap-2" aria-busy="true">
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              {t.eco.memories.loading}
            </p>
          )
        ) : tags.length === 0 ? (
          <p className="text-stone-400">{g.empty}</p>
        ) : (
          <ul className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {tags.map((tag) => (
              <TagCard key={tag.id} tag={tag} act={act} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

type Act = (body: Record<string, unknown>) => Promise<{ ok: boolean; data: Record<string, unknown> | null }>;

function CreateTag({ act }: { act: Act }) {
  const { t } = useLanguage();
  const g = t.eco.tags;
  const [name, setName] = useState('');
  const [track, setTrack] = useState<CredentialTrack>('nature');
  const [achievement, setAchievement] = useState(true);
  const [discount, setDiscount] = useState(0);
  const [terms, setTerms] = useState('');
  const [spot, setSpot] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const locate = () => {
    setMsg(null);
    if (!navigator.geolocation) return setMsg({ ok: false, text: g.locationFailed });
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSpot({ lat: Math.round(pos.coords.latitude * 1e6) / 1e6, lng: Math.round(pos.coords.longitude * 1e6) / 1e6 });
        setLocating(false);
      },
      () => {
        setMsg({ ok: false, text: g.locationFailed });
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  return (
    <form
      aria-labelledby="create-tag-title"
      className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!achievement && !discount) return;
        setBusy(true);
        const { ok } = await act({ action: 'create', name: name.trim(), track, achievement, discount, terms: terms.trim() || undefined, spot: spot ?? undefined });
        setBusy(false);
        setMsg({ ok, text: ok ? g.created : g.error });
        if (ok) {
          setName('');
          setTerms('');
          setSpot(null);
        }
      }}
    >
      <h3 id="create-tag-title" className="text-lg font-bold text-stone-50 flex items-center gap-2">
        <Plus className="w-5 h-5 text-emerald-400" aria-hidden="true" />
        {g.create}
      </h3>
      <Field label={g.name} htmlFor="tag-name">
        <input id="tag-name" required minLength={2} maxLength={80} className={inputClass} value={name} placeholder={g.namePlaceholder} onChange={(e) => setName(e.target.value)} />
      </Field>
      <fieldset>
        <legend className="text-sm font-semibold text-stone-200 mb-1.5">{g.track}</legend>
        <div className="flex flex-wrap gap-2">
          {TRACKS.map((tr) => (
            <label
              key={tr}
              className={`px-3 py-1.5 rounded-full text-sm border cursor-pointer has-focus-visible:outline-2 has-focus-visible:outline-(--focus) ${
                track === tr ? 'bg-emerald-600 border-emerald-500 text-white font-semibold' : 'bg-stone-950 border-stone-700 text-stone-300'
              }`}
            >
              <input type="radio" name="tag-track" value={tr} checked={track === tr} onChange={() => setTrack(tr)} className="sr-only" />
              {t.eco.memories.tracks[tr]}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex items-start gap-3 text-sm text-stone-200 cursor-pointer">
        <input type="checkbox" checked={achievement} onChange={(e) => setAchievement(e.target.checked)} className="mt-0.5 w-5 h-5 accent-emerald-500" />
        {g.achievement}
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label={g.discount} htmlFor="tag-discount">
          <select id="tag-discount" className={inputClass} value={discount} onChange={(e) => setDiscount(Number(e.target.value))}>
            {DISCOUNTS.map((d) => (
              <option key={d} value={d}>
                {d ? `${d}%` : g.discountNone}
              </option>
            ))}
          </select>
        </Field>
        {discount > 0 && (
          <Field label={g.terms} htmlFor="tag-terms">
            <input id="tag-terms" maxLength={160} className={inputClass} value={terms} placeholder={g.termsPlaceholder} onChange={(e) => setTerms(e.target.value)} />
          </Field>
        )}
      </div>
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-stone-200">{g.location}</legend>
        <p className="text-xs text-stone-400">{fmt(g.locationDesc, { m: SPOT_RADIUS_M })}</p>
        {spot ? (
          <p className="text-sm text-emerald-300 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" aria-hidden="true" />
              {fmt(g.locationSet, { lat: spot.lat.toFixed(4), lng: spot.lng.toFixed(4) })}
            </span>
            <button type="button" onClick={() => setSpot(null)} className="text-stone-400 underline underline-offset-4 cursor-pointer">
              {g.clearLocation}
            </button>
          </p>
        ) : (
          <button
            type="button"
            onClick={locate}
            disabled={locating}
            className="px-4 py-2 rounded-lg text-sm font-semibold border border-stone-600 text-stone-200 hover:border-stone-400 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {locating ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <LocateFixed className="w-4 h-4" aria-hidden="true" />}
            {g.useLocation}
          </button>
        )}
      </fieldset>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={busy || (!achievement && !discount)}
          className="px-5 py-2.5 rounded-lg text-sm font-bold bg-emerald-600 hover:bg-(--action-hover) text-white disabled:opacity-50 cursor-pointer"
        >
          {g.save}
        </button>
        {msg && (
          <span role={msg.ok ? 'status' : 'alert'} className={`text-sm ${msg.ok ? 'text-emerald-300' : 'text-red-400'}`}>
            {msg.text}
          </span>
        )}
      </div>
    </form>
  );
}

function RedeemCode({ act }: { act: Act }) {
  const { t } = useLanguage();
  const g = t.eco.tags;
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <form
      aria-labelledby="redeem-title"
      className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-3 self-start"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const { ok, data } = await act({ action: 'redeem', code });
        setBusy(false);
        const tagName = data?.tagName ? ` (${data.tagName})` : '';
        setMsg(ok ? { ok, text: g.redeemed + tagName } : { ok, text: data?.error === 'used' ? g.redeemAlready + tagName : g.redeemInvalid });
        if (ok) setCode('');
      }}
    >
      <h3 id="redeem-title" className="text-lg font-bold text-stone-50 flex items-center gap-2">
        <Ticket className="w-5 h-5 text-amber-400" aria-hidden="true" />
        {g.redeemTitle}
      </h3>
      <p className="text-sm text-stone-400">{g.redeemDesc}</p>
      <Field label={g.redeemLabel} htmlFor="redeem-code">
        <input
          id="redeem-code"
          required
          maxLength={12}
          autoComplete="off"
          className={`${inputClass} font-mono uppercase tracking-widest`}
          placeholder="K7-4QXP"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={busy || !code.trim()} className="px-5 py-2.5 rounded-lg text-sm font-bold bg-emerald-600 hover:bg-(--action-hover) text-white disabled:opacity-50 cursor-pointer">
          {g.redeem}
        </button>
        {msg && (
          <span role={msg.ok ? 'status' : 'alert'} className={`text-sm ${msg.ok ? 'text-emerald-300' : 'text-red-400'}`}>
            {msg.text}
          </span>
        )}
      </div>
    </form>
  );
}

function TagCard({ tag, act }: { tag: OwnedTag; act: Act }) {
  const { t } = useLanguage();
  const g = t.eco.tags;
  const url = tagUrl(tag.id, tag.token);
  const [confirmRenew, setConfirmRenew] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const place = [tag.area, getBaliRegion(tag.regionId)?.name].filter(Boolean).join(', ');

  const run = async (body: Record<string, unknown>, done?: string) => {
    setBusy(true);
    const { ok } = await act(body);
    setBusy(false);
    setNote(ok ? (done ? { ok, text: done } : null) : { ok, text: g.error });
  };

  const download = () =>
    downloadCounterCard(
      { kind: 'partner', title: tag.name, region: place || 'Bali', tagline: g.pageTag },
      url,
      fmt(g.printCollect, { name: tag.name }),
      tag.discount ? fmt(g.printDiscount, { n: tag.discount.percent }) : undefined,
      `kossi-tag-${slugify(tag.name)}.png`
    );

  const stats = [
    [g.stats.scans, tag.stats.scans],
    [g.stats.collected, tag.stats.collected],
    [g.stats.claimed, tag.stats.claimed],
    [g.stats.used, tag.stats.used]
  ] as const;

  return (
    <li className={`rounded-2xl border p-5 space-y-4 ${tag.active ? 'bg-stone-900 border-stone-800' : 'bg-stone-900/50 border-stone-800 opacity-80'}`}>
      <div className="flex flex-col sm:flex-row gap-4">
        <QrImage value={url} className="w-28 h-28 shrink-0 p-1" label={tag.name} />
        <div className="flex-1 min-w-0 space-y-2">
          <h4 className="text-lg font-bold text-stone-50 break-words">{tag.name}</h4>
          <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
            <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300">{t.eco.memories.tracks[tag.track]}</span>
            {tag.discount && <span className="px-2 py-0.5 rounded-md bg-amber-950 text-amber-300">−{tag.discount.percent}%</span>}
            {tag.spot && (
              <span className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 flex items-center gap-1">
                <MapPin className="w-3 h-3" aria-hidden="true" />
                {g.atSpot}
              </span>
            )}
            {!tag.active && <span className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-400">{g.paused}</span>}
          </div>
          {tag.discount?.terms && <p className="text-xs text-stone-400">{tag.discount.terms}</p>}
        </div>
      </div>

      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {stats.map(([label, value]) => (
          <div key={label} className="bg-stone-950 border border-stone-800 rounded-xl p-3">
            <dt className="text-xs text-stone-400">{label}</dt>
            <dd className="text-xl font-extrabold text-stone-50 tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-1.5">{g.fromTitle}</p>
        {tag.origins.length === 0 ? (
          <p className="text-sm text-stone-500">{g.fromNone}</p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {tag.origins.map((o) => (
              <li key={o.region} className="text-xs px-2 py-1 rounded-md bg-stone-800 text-stone-200">
                {o.region} · {o.count}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void download()}
          className="px-4 py-2 rounded-lg text-sm font-bold bg-emerald-600 hover:bg-(--action-hover) text-white flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          {g.download}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => run({ action: 'setActive', tagId: tag.id, active: !tag.active })}
          className="px-4 py-2 rounded-lg text-sm font-semibold border border-stone-600 text-stone-200 hover:border-stone-400 flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {tag.active ? <Pause className="w-4 h-4" aria-hidden="true" /> : <Play className="w-4 h-4" aria-hidden="true" />}
          {tag.active ? g.pause : g.resume}
          <span className="sr-only">: {tag.name}</span>
        </button>
        {confirmRenew ? (
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              await run({ action: 'renew', tagId: tag.id }, g.renewed);
              setConfirmRenew(false);
            }}
            className="px-4 py-2 rounded-lg text-sm font-bold border border-amber-500 text-amber-300 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            {g.renew} — {g.renewDesc}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmRenew(true)}
            className="px-4 py-2 rounded-lg text-sm font-semibold border border-stone-600 text-stone-200 hover:border-stone-400 flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            {g.renew}
            <span className="sr-only">: {tag.name}</span>
          </button>
        )}
      </div>
      {note && (
        <p role={note.ok ? 'status' : 'alert'} className={`text-sm flex items-center gap-1.5 ${note.ok ? 'text-emerald-300' : 'text-red-400'}`}>
          {note.ok && <Check className="w-4 h-4" aria-hidden="true" />}
          {note.text}
        </p>
      )}
    </li>
  );
}
