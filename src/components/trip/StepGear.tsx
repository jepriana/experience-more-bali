'use client';

import React, { useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAccounts, useHydrated } from '@/lib/accounts';
import { daysToIndexes, memoryUrl } from '@/lib/memoryLink';
import { orderDayRoute } from '@/lib/tripPlanning';
import { useAccountSticker } from '@/components/onboarding/AccountSticker';
import { MerchDesigner } from '@/components/merch/MerchDesigner';
import { StepNav } from '@/components/trip/TripSteps';
import type { TripState } from '@/components/trip/useTrip';

/** Step 5: memory gear — the family sticker on gear, with a QR patch that opens this trip. */
export function StepGear({ trip }: { trip: TripState }) {
  const { t } = useLanguage();
  const { traveler } = useAccounts();
  const hydrated = useHydrated();
  const sticker = useAccountSticker('traveler');

  // The trip, day by day in visiting order, packed into the QR link
  const qrUrl = useMemo(() => {
    if (!hydrated || !traveler) return null;
    const days = Array.from({ length: trip.days }, (_, d) =>
      orderDayRoute(trip.stops.filter((s) => trip.assignment[s.id] === d)).map((s) => s.id)
    );
    const indexes = daysToIndexes(days);
    if (!indexes.some((d) => d.length)) return null;
    return memoryUrl({ k: 't', n: traveler.name, r: sticker?.region ?? '', ti: trip.plan?.tripTitle || undefined, d: indexes });
  }, [hydrated, traveler, sticker?.region, trip.days, trip.stops, trip.assignment, trip.plan?.tripTitle]);

  if (!sticker || !traveler) return null;

  return (
    <div className="space-y-5">
      <MerchDesigner
        sticker={sticker}
        qrUrl={qrUrl}
        storageKey="merch.traveler"
        customer={{ name: traveler.name, contact: traveler.contact }}
        title={t.merch.title}
        subtitle={t.merch.subtitle}
        qrDesc={t.merch.qrPatchDesc}
      />
      <StepNav onBack={() => trip.setStep(3)} nextLabel="" sticky={false}>
        {t.merch.back}
      </StepNav>
    </div>
  );
}
