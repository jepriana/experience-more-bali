'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Images } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAccounts, useHydrated } from '@/lib/accounts';
import { daysToIndexes, memoryUrl, tripUrl } from '@/lib/memoryLink';
import { apiFetch } from '@/lib/identity';
import { orderDayRoute } from '@/lib/tripPlanning';
import { useAccountSticker } from '@/components/onboarding/AccountSticker';
import { MerchDesigner } from '@/components/merch/MerchDesigner';
import { StepNav } from '@/components/trip/TripSteps';
import { QrImage } from '@/components/memory/QrImage';
import { NextSteps } from '@/components/nav/NextSteps';
import type { TripState } from '@/components/trip/useTrip';

/**
 * Step 5: memory gear — the family sticker on gear (no QR: the family's memory page is personal),
 * plus the trip memory page with its QR to share from the phone.
 */
export function StepGear({ trip }: { trip: TripState }) {
  const { t } = useLanguage();
  const { traveler } = useAccounts();
  const hydrated = useHydrated();
  const sticker = useAccountSticker('traveler');

  const days = useMemo(
    () =>
      Array.from({ length: trip.days }, (_, d) =>
        orderDayRoute(trip.stops.filter((s) => trip.assignment[s.id] === d)).map((s) => s.id)
      ),
    [trip.days, trip.stops, trip.assignment]
  );
  const title = trip.plan?.tripTitle || '';

  // Save the trip on the server: its short QR link (/m/t_…) opens a page with photos & videos.
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');
  const payload = useMemo(
    () => (hydrated && traveler && days.some((d) => d.length) ? JSON.stringify({ name: traveler.name, region: sticker?.region ?? '', title, days }) : null),
    [hydrated, traveler, sticker?.region, title, days]
  );
  const { serverTripId, setServerTripId } = trip;
  useEffect(() => {
    if (!payload) return;
    let alive = true;
    const timer = setTimeout(() => {
      setSaveState('saving');
      apiFetch('traveler', '/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...JSON.parse(payload), ...(serverTripId ? { id: serverTripId } : {}) })
      })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then((d) => {
          if (!alive) return;
          if (d.trip?.id && d.trip.id !== serverTripId) setServerTripId(d.trip.id);
          setSaveState('saved');
        })
        .catch(() => alive && setSaveState('failed'));
    }, 400);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
    // serverTripId is read, not a trigger: saving must not loop when the id arrives
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload]);

  // Short server link when saved; otherwise the trip packed into the link (still works offline)
  const qrUrl = useMemo(() => {
    if (!payload || !traveler) return null;
    if (serverTripId && saveState !== 'failed') return tripUrl(serverTripId);
    const indexes = daysToIndexes(days);
    if (!indexes.some((d) => d.length)) return null;
    return memoryUrl({ k: 't', n: traveler.name, r: sticker?.region ?? '', ti: title || undefined, d: indexes });
  }, [payload, traveler, serverTripId, saveState, days, sticker?.region, title]);

  if (!sticker || !traveler) return null;

  return (
    <div className="space-y-5">
      <MerchDesigner
        sticker={sticker}
        qrUrl={null}
        qrOption={false}
        storageKey="merch.traveler"
        customer={{ name: traveler.name, contact: traveler.contact }}
        title={t.merch.title}
        subtitle={t.merch.subtitle}
      />
      {/* the trip memory page: private to the family (shared from the phone, never printed on gear) */}
      <section aria-labelledby="trip-page-title" className="bg-stone-900 border border-stone-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-5">
        {qrUrl && <QrImage value={qrUrl} className="w-28 h-28 shrink-0 p-1" label={t.eco.next.tripPageTitle} />}
        <div className="flex-1 min-w-0 space-y-1">
          <h2 id="trip-page-title" className="font-bold text-stone-50">
            {t.eco.next.tripPageTitle}
          </h2>
          <p className="text-sm text-stone-400">{t.eco.next.tripPageDesc}</p>
          <p className="text-sm text-stone-300" role="status">
            {saveState === 'saving' ? t.eco.memories.saving : saveState === 'failed' ? t.eco.memories.saveFailed : t.eco.media.hint}
          </p>
        </div>
        {serverTripId && saveState !== 'failed' && (
          <Link
            href={`/m/${serverTripId}`}
            className="shrink-0 px-4 py-2.5 rounded-lg text-sm font-bold bg-emerald-600 hover:bg-(--action-hover) text-white flex items-center justify-center gap-2"
          >
            <Images className="w-4 h-4" aria-hidden="true" />
            {t.eco.media.add}
          </Link>
        )}
      </section>
      <NextSteps items={['memories', 'connect']} />
      <StepNav onBack={() => trip.setStep(3)} nextLabel="" sticky={false}>
        {t.merch.back}
      </StepNav>
    </div>
  );
}
