'use client';

import React, { useCallback, useState } from 'react';
import { tabKeyNav } from '@/lib/a11y';
import { useRouter } from 'next/navigation';
import { useAccounts, useHydrated, partnerRegionLabel, type PartnerAccount } from '@/lib/accounts';
import { useSessionState } from '@/context/SessionStateContext';
import { PartnerSignup } from '@/components/onboarding/PartnerSignup';
import { AccountStrip, StickerReveal } from '@/components/onboarding/AccountSticker';
import { PartnerPlatform } from '@/components/partner/PartnerPlatform';
import { PageLoading } from '@/components/pages/PageLoading';
import { BusinessProfile } from '@/components/partner/BusinessProfile';
import { PartnerGear } from '@/components/partner/PartnerGear';
import { ListingStatus } from '@/components/verification/ListingStatus';
import { useLanguage } from '@/context/LanguageContext';
import { ClipboardList, Shirt, Wand2 } from 'lucide-react';

type PartnerTab = 'profile' | 'studio' | 'gear';

/**
 * /partner — sign up once (partner sticker is created), then three tabs:
 * business profile (tap menus A–E + AI support plan), the AI marketing studio, and memory gear.
 */
export function PartnerPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [tab, setTab] = useSessionState<PartnerTab>('partner.tab', 'profile');
  const hydrated = useHydrated();
  const { partner } = useAccounts();
  const [justCreated, setJustCreated] = useState(false);

  // A curated partner opened from the traveler page ("open in partner view")
  const [focusId, setFocusId] = useSessionState<string | null>('partner.focusId', null);
  const clearFocus = useCallback(() => {
    setFocusId(null);
    setTab('studio');
  }, [setFocusId, setTab]);
  // a partner opened from the traveler page goes straight to the studio
  const activeTab: PartnerTab = focusId ? 'studio' : tab;

  // Sign-up answers pre-fill the studio form so partners never type them twice
  const [, setBusinessName] = useSessionState('partner.businessName', '');
  const [, setLocation] = useSessionState('partner.location', '');
  const prefillStudio = (account: PartnerAccount) => {
    setBusinessName(account.businessName);
    setLocation(partnerRegionLabel(account));
  };

  if (!hydrated) return <PageLoading />;
  if (!partner) {
    return (
      <PartnerSignup
        onCreated={(account) => {
          prefillStudio(account);
          setJustCreated(true);
        }}
      />
    );
  }
  if (justCreated) return <StickerReveal kind="partner" onContinue={() => setJustCreated(false)} />;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-4">
        <h1 className="sr-only">{t.nav.tabPartner}</h1>
        <AccountStrip kind="partner" />
        <ListingStatus />
        <div className="flex gap-2 overflow-x-auto no-scrollbar" role="tablist" aria-label="Partner tools">
          {(
            [
              ['profile', t.profile.tabProfile, ClipboardList],
              ['studio', t.profile.tabStudio, Wand2],
              ['gear', t.profile.tabGear, Shirt]
            ] as const
          ).map(([id, label, Icon]) => {
            const on = activeTab === id;
            return (
              <button
                key={id}
                role="tab"
                aria-selected={on}
                tabIndex={(on) ? 0 : -1}
                onKeyDown={tabKeyNav}
                onClick={() => setTab(id)}
                className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                  on
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                    : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            );
          })}
        </div>
      </div>
      {activeTab === 'profile' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <BusinessProfile />
        </div>
      )}
      {activeTab === 'studio' && (
        <PartnerPlatform
          initialPartnerId={focusId ?? undefined}
          onInitialPartnerApplied={clearFocus}
          onNavigateToTraveler={() => router.push('/traveler')}
        />
      )}
      {activeTab === 'gear' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <PartnerGear />
        </div>
      )}
    </>
  );
}
