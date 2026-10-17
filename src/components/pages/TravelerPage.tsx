'use client';

import React, { useState } from 'react';
import { tabKeyNav } from '@/lib/a11y';
import { useRouter } from 'next/navigation';
import { useAccounts, useHydrated } from '@/lib/accounts';
import { useSessionState } from '@/context/SessionStateContext';
import { TravelerSignup } from '@/components/onboarding/TravelerSignup';
import { AccountStrip, StickerReveal } from '@/components/onboarding/AccountSticker';
import { TravelerPlatform } from '@/components/traveler/TravelerPlatform';
import { PageLoading } from '@/components/pages/PageLoading';
import { TripWizard } from '@/components/trip/TripWizard';
import { useLanguage } from '@/context/LanguageContext';
import { Map as MapIcon, Sparkles } from 'lucide-react';

/** /traveler — sign up once (sticker is created), then plan the trip. */
export function TravelerPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const { traveler } = useAccounts();
  const [justCreated, setJustCreated] = useState(false);
  const [, setPartnerFocus] = useSessionState<string | null>('partner.focusId', null);
  // "Build my trip" (step-by-step wizard) or the original one-click AI itinerary
  const [mode, setMode] = useSessionState<'wizard' | 'quick'>('traveler.mode', 'wizard');
  const { t } = useLanguage();

  if (!hydrated) return <PageLoading />;
  if (!traveler) return <TravelerSignup onCreated={() => setJustCreated(true)} />;
  if (justCreated) return <StickerReveal kind="traveler" onContinue={() => setJustCreated(false)} />;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-4">
        <h1 className="sr-only">{t.nav.tabTraveler}</h1>
        <AccountStrip kind="traveler" />
        <div className="inline-flex items-center bg-stone-900 border border-stone-800 rounded-xl p-1 gap-1" role="tablist">
          {(
            [
              ['wizard', t.trip.modeWizard, <MapIcon key="m" className="w-4 h-4" />],
              ['quick', t.trip.modeQuick, <Sparkles key="s" className="w-4 h-4" />]
            ] as const
          ).map(([id, label, icon]) => (
            <button
              key={id}
              role="tab"
              aria-selected={mode === id}
              tabIndex={(mode === id) ? 0 : -1}
              onKeyDown={tabKeyNav}
              onClick={() => setMode(id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                mode === id ? 'bg-emerald-600 text-white shadow-md' : 'text-stone-400 hover:text-stone-50'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>
      {mode === 'wizard' ? (
        <TripWizard />
      ) : (
        <TravelerPlatform
          onSelectPartnerForPartnerView={(partnerId) => {
            setPartnerFocus(partnerId);
            router.push('/partner');
          }}
        />
      )}
    </>
  );
}
