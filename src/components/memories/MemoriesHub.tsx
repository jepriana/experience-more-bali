'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Award, Bike, BedDouble, Landmark, Mountain, Shirt, UtensilsCrossed, type LucideIcon } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAccounts, useHydrated } from '@/lib/accounts';
import { apiFetch } from '@/lib/identity';
import { tripUrl } from '@/lib/memoryLink';
import { TRACKS, levelFor } from '@/lib/credentials';
import { fmt } from '@/i18n/ecosystem';
import type { CheckinRecord, CredentialTrack, TripRecord } from '@/lib/ecosystemTypes';
import { PageLoading } from '@/components/pages/PageLoading';
import { AccountStrip } from '@/components/onboarding/AccountSticker';
import { QrImage } from '@/components/memory/QrImage';
import { MediaGallery } from '@/components/memories/MediaGallery';
import { NextSteps } from '@/components/nav/NextSteps';
import { signupHref } from '@/lib/nextPath';
import { formatVerifiedDate } from '@/components/verification/VerificationBadge';

const TRACK_ICON: Record<CredentialTrack, LucideIcon> = {
  nature: Mountain,
  adventure: Bike,
  culture: Landmark,
  culinary: UtensilsCrossed,
  stay: BedDouble
};

/**
 * /memory — the traveler's second layer: memories (trips with QR pages, photos & videos)
 * and credentials (earned by checking in at partners' counter QR cards).
 */
export function MemoriesHub() {
  const { t, language } = useLanguage();
  const e = t.eco.memories;
  const hydrated = useHydrated();
  const { traveler } = useAccounts();
  const [trips, setTrips] = useState<TripRecord[] | null>(null);
  const [checkins, setCheckins] = useState<CheckinRecord[] | null>(null);

  const signedIn = hydrated && !!traveler;
  useEffect(() => {
    if (!signedIn) return;
    let alive = true;
    apiFetch('traveler', '/api/trips')
      .then((r) => (r.ok ? r.json() : { trips: [] }))
      .then((d) => alive && setTrips(d.trips ?? []))
      .catch(() => alive && setTrips([]));
    apiFetch('traveler', '/api/checkins')
      .then((r) => (r.ok ? r.json() : { checkins: [] }))
      .then((d) => alive && setCheckins(d.checkins ?? []))
      .catch(() => alive && setCheckins([]));
    return () => {
      alive = false;
    };
  }, [signedIn]);

  if (!hydrated) return <PageLoading />;

  if (!traveler) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 space-y-4">
        <h1 className="text-3xl font-extrabold text-stone-50">{e.title}</h1>
        <h2 className="text-lg font-bold text-stone-200">{e.signupTitle}</h2>
        <p className="text-stone-400">{e.signupDesc}</p>
        <Link href={signupHref('/traveler', '/memory')} className="inline-flex px-5 py-3 rounded-lg font-bold text-sm bg-emerald-600 hover:bg-(--action-hover) text-white items-center gap-2">
          {e.signupCta}
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  const byTrack = TRACKS.map((track) => ({ track, items: (checkins ?? []).filter((c) => c.track === track) }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <AccountStrip kind="traveler" />
      <div>
        <h1 className="text-3xl font-extrabold text-stone-50 tracking-tight">{e.title}</h1>
        <p className="text-stone-400 mt-1">{e.subtitle}</p>
      </div>

      {/* Trips */}
      <section aria-labelledby="trips-title" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="trips-title" className="text-xl font-bold text-stone-50">
            {e.tripsTitle}
          </h2>
          <Link href="/traveler" className="text-sm font-semibold text-emerald-400 underline underline-offset-4">
            {e.planTrip}
          </Link>
        </div>
        {trips === null ? (
          <p className="text-stone-500" aria-busy="true">
            {e.loading}
          </p>
        ) : trips.length === 0 ? (
          <p className="text-stone-400 bg-stone-900 border border-stone-800 rounded-2xl p-5">{e.tripsEmpty}</p>
        ) : (
          <ul className="space-y-4">
            {trips.map((trip) => (
              <li key={trip.id} className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <QrImage value={tripUrl(trip.id)} className="w-24 h-24 shrink-0 p-1" label={trip.title || trip.name} />
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="text-lg font-bold text-stone-50">{trip.title || trip.name}</h3>
                    <p className="text-sm text-stone-400">
                      {formatVerifiedDate(trip.updatedAt, language)} · {fmt(e.places, { n: trip.days.flat().length })} ·{' '}
                      {fmt(e.items, { n: trip.media.length })}
                    </p>
                    <Link
                      href={`/m/${trip.id}`}
                      className="inline-flex mt-2 px-4 py-2 rounded-lg text-sm font-bold border border-emerald-600 text-emerald-300 hover:bg-emerald-950 items-center gap-2"
                    >
                      {e.openPage}
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
                <MediaGallery
                  tripId={trip.id}
                  items={trip.media}
                  owner
                  compact
                  onChange={(media) => setTrips((ts) => (ts ?? []).map((x) => (x.id === trip.id ? { ...x, media } : x)))}
                />
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-stone-500">{e.privacy}</p>
      </section>

      {/* Credentials */}
      <section aria-labelledby="cred-title" className="space-y-3">
        <div>
          <h2 id="cred-title" className="text-xl font-bold text-stone-50">
            {e.credentialsTitle}
          </h2>
          <p className="text-sm text-stone-400">{e.credentialsDesc}</p>
        </div>
        {checkins !== null && checkins.length === 0 && (
          <p className="text-stone-400 bg-stone-900 border border-stone-800 rounded-2xl p-5">{e.credentialsEmpty}</p>
        )}
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {byTrack.map(({ track, items }) => {
            const Icon = TRACK_ICON[track];
            const level = levelFor(items.length);
            return (
              <li
                key={track}
                className={`rounded-2xl border p-4 space-y-2 ${level ? 'bg-emerald-950/40 border-emerald-800' : 'bg-stone-900 border-stone-800'}`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${level ? 'text-emerald-400' : 'text-stone-500'}`} aria-hidden="true" />
                  <span className="font-bold text-stone-50">{e.tracks[track]}</span>
                </div>
                <p className={`text-sm font-semibold ${level ? 'text-emerald-300' : 'text-stone-500'}`}>
                  {level ? fmt(e.level, { n: level }) : '—'}
                </p>
                {items.length > 0 && (
                  <ul className="text-xs text-stone-300 space-y-1">
                    {items.slice(0, 4).map((c) => (
                      <li key={c.id} className="flex gap-1.5">
                        <Award className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-px" aria-hidden="true" />
                        <span>
                          {c.placeName} <span className="text-stone-500">· {formatVerifiedDate(c.at, language)}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Gear */}
      <section aria-labelledby="gear-title" className="bg-stone-900 border border-stone-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <Shirt className="w-8 h-8 text-emerald-400 shrink-0" aria-hidden="true" />
        <div className="flex-1">
          <h2 id="gear-title" className="font-bold text-stone-50">
            {e.gearTitle}
          </h2>
          <p className="text-sm text-stone-400">{e.gearDesc}</p>
        </div>
        <Link href="/traveler" className="px-5 py-2.5 rounded-lg text-sm font-bold bg-emerald-600 hover:bg-(--action-hover) text-white text-center">
          {e.gearCta}
        </Link>
      </section>

      <NextSteps items={['connect', 'plan']} />
    </div>
  );
}
