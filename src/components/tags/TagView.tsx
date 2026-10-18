'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, BadgeCheck, Loader2, MapPin, Mountain, Ticket, TriangleAlert } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAccounts, useHydrated } from '@/lib/accounts';
import { apiFetch } from '@/lib/identity';
import { fmt } from '@/i18n/ecosystem';
import { parseTagCode } from '@/lib/memoryLink';
import { currentPath, signupHref } from '@/lib/nextPath';
import { getBaliRegion } from '@/data/regions';
import type { PublicTag } from '@/lib/ecosystemTypes';
import { PageLoading } from '@/components/pages/PageLoading';
import { NextSteps } from '@/components/nav/NextSteps';

/** Location for "only at this spot" tags: asked once, sent once, never stored. */
function getPosition(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  });
}

/** /tag/<id>.<token> — a traveler scanned a destination QR tag. */
export function TagView({ code }: { code: string }) {
  const { t } = useLanguage();
  const g = t.eco.tags;
  const parsed = parseTagCode(code);
  const hydrated = useHydrated();
  const { traveler } = useAccounts();
  const [tag, setTag] = useState<PublicTag | null | 'invalid'>(null);
  const [busy, setBusy] = useState<'collect' | 'claim' | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const signedIn = hydrated && !!traveler;
  const fetchTag = useCallback(
    (scan: boolean) =>
      apiFetch('traveler', `/api/tags/${parsed?.id}?t=${encodeURIComponent(parsed?.token ?? '')}${scan ? '&scan=1' : ''}`)
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d) => d.tag as PublicTag),
    [parsed?.id, parsed?.token]
  );

  useEffect(() => {
    if (!hydrated) return;
    if (!parsed) return;
    let alive = true;
    fetchTag(true)
      .then((x) => alive && setTag(x))
      .catch(() => alive && setTag('invalid'));
    return () => {
      alive = false;
    };
    // count the scan once per page load (and again after signing in, which reloads the page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, signedIn]);

  if (!parsed || tag === 'invalid') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 space-y-6">
        <div className="text-center space-y-3">
          <TriangleAlert className="w-10 h-10 text-amber-400 mx-auto" aria-hidden="true" />
          <h1 className="text-2xl font-extrabold text-stone-50">{g.pageTag}</h1>
          <p className="text-stone-400">{g.invalid}</p>
        </div>
        <NextSteps items={['plan', 'memories']} />
      </div>
    );
  }
  if (!tag) return <PageLoading />;

  const act = async (action: 'collect' | 'claim') => {
    setBusy(action);
    setMessage(null);
    let pos: { lat: number; lng: number } | null = null;
    if (tag.atSpot) {
      setMessage({ ok: true, text: g.locating });
      pos = await getPosition();
      if (!pos) {
        setBusy(null);
        return setMessage({ ok: false, text: g.noLocation });
      }
    }
    try {
      const res = await apiFetch('traveler', `/api/tags/${tag.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ t: parsed.token, action, ...(pos ?? {}) })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const text =
          data?.error === 'too-far'
            ? fmt(g.tooFar, { km: data.km })
            : data?.error === 'need-location'
              ? g.noLocation
              : data?.error === 'paused'
                ? g.pausedMsg
                : data?.error === 'invalid'
                  ? g.invalid
                  : g.error;
        setMessage({ ok: false, text });
      } else if (action === 'collect') {
        setMessage({ ok: true, text: data.already ? g.alreadyCollected : g.collected });
        setTag({ ...tag, collected: true });
      } else {
        setMessage(null);
        setTag({ ...tag, claim: data.claim });
      }
    } catch {
      setMessage({ ok: false, text: g.error });
    }
    setBusy(null);
  };

  const place = [tag.area, getBaliRegion(tag.regionId)?.name].filter(Boolean).join(', ');

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="space-y-3">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs font-semibold">
          <Mountain className="w-3.5 h-3.5" aria-hidden="true" />
          {g.pageTag}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-50 tracking-tight break-words">{tag.name}</h1>
        <p className="text-stone-300">{fmt(g.by, { owner: tag.ownerName })}</p>
        <div className="flex flex-wrap gap-2 text-sm">
          {place && (
            <span className="flex items-center gap-1.5 text-stone-400">
              <MapPin className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              {place}
            </span>
          )}
          <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 font-semibold">{t.eco.memories.tracks[tag.track]}</span>
        </div>
      </div>

      {!tag.active ? (
        <p className="bg-stone-900 border border-stone-800 rounded-2xl p-5 text-stone-300">{g.pausedMsg}</p>
      ) : !traveler ? (
        <div className="bg-emerald-950/40 border border-emerald-800 rounded-2xl p-5 space-y-3">
          <p className="text-stone-200">{g.needAccount}</p>
          <Link
            href={signupHref('/traveler', currentPath())}
            className="inline-flex px-5 py-3 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-(--action-hover) text-white"
          >
            {g.signUp}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {tag.atSpot && !tag.collected && !tag.claim && <p className="text-sm text-stone-400">{g.needLocation}</p>}

          {tag.achievement && (
            <section aria-labelledby="ach-title" className="bg-stone-900 border border-stone-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <Award className={`w-8 h-8 shrink-0 ${tag.collected ? 'text-amber-400' : 'text-stone-500'}`} aria-hidden="true" />
              <div className="flex-1">
                <h2 id="ach-title" className="font-bold text-stone-50">
                  {tag.collected ? g.collected : g.collect}
                </h2>
                <p className="text-sm text-stone-400">{t.eco.memories.tracks[tag.track]}</p>
              </div>
              {tag.collected ? (
                <Link href="/memory" className="px-5 py-3 rounded-xl font-bold text-sm border border-emerald-600 text-emerald-300 flex items-center justify-center gap-2">
                  <BadgeCheck className="w-4 h-4" aria-hidden="true" />
                  {g.viewCredentials}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => void act('collect')}
                  disabled={!!busy}
                  className="px-5 py-3 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-(--action-hover) text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {busy === 'collect' && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                  {g.collect}
                </button>
              )}
            </section>
          )}

          {tag.discount && (
            <section aria-labelledby="disc-title" className="bg-stone-900 border border-amber-800/60 rounded-2xl p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Ticket className="w-8 h-8 text-amber-400 shrink-0" aria-hidden="true" />
                <div className="flex-1">
                  <h2 id="disc-title" className="font-bold text-stone-50">
                    {fmt(g.printDiscount, { n: tag.discount.percent })}
                  </h2>
                  {tag.discount.terms && <p className="text-sm text-stone-400">{tag.discount.terms}</p>}
                </div>
                {!tag.claim && (
                  <button
                    type="button"
                    onClick={() => void act('claim')}
                    disabled={!!busy}
                    className="px-5 py-3 rounded-xl font-bold text-sm bg-amber-400 hover:bg-amber-300 text-black flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {busy === 'claim' && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                    {g.claim}
                  </button>
                )}
              </div>
              {tag.claim && (
                <div className="text-center bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-1" role="status">
                  <p className="text-sm text-stone-400">{tag.claim.used ? g.claimUsed : g.claimCode}</p>
                  <p className={`font-mono text-4xl font-extrabold tracking-widest ${tag.claim.used ? 'text-stone-500 line-through' : 'text-amber-300'}`}>
                    {tag.claim.code}
                  </p>
                </div>
              )}
            </section>
          )}

          {message && (
            <p role={message.ok ? 'status' : 'alert'} className={`text-sm font-semibold ${message.ok ? 'text-emerald-300' : 'text-red-400'}`}>
              {message.text}
            </p>
          )}
        </div>
      )}

      <NextSteps items={['memories', 'connect']} />
    </div>
  );
}
