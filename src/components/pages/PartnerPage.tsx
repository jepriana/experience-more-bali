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
import { ArrowRight, ClipboardList, Network, QrCode, Shirt, Wand2 } from 'lucide-react';
import { PartnerTags } from '@/components/partner/PartnerTags';
import { PartnerNetwork } from '@/components/partner/PartnerNetwork';
import { readNext } from '@/lib/nextPath';

type PartnerTab = 'profile' | 'studio' | 'network' | 'gear' | 'tags';

/**
 * /partner — sign up once (partner sticker is created), then three tabs:
 * business profile (tap menus A–E + AI support plan), the AI marketing studio, the partner
 * network (clusters, collaboration requests, directory) and memory gear.
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
  if (justCreated) {
    const next = readNext();
    return (
      <StickerReveal
        kind="partner"
        continueLabel={next ? t.eco.next.continueBack : undefined}
        onContinue={() => (next ? router.push(next) : setJustCreated(false))}
      />
    );
  }

  const tabs = [
    ['profile', t.profile.tabProfile, ClipboardList],
    ['studio', t.profile.tabStudio, Wand2],
    ['network', t.eco.network.tab, Network],
    ['gear', t.profile.tabGear, Shirt],
    ['tags', t.eco.tags.tab, QrCode]
  ] as const;
  const nextTab = tabs[tabs.findIndex(([id]) => id === activeTab) + 1];
  const goTo = (id: PartnerTab) => {
    setTab(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-4">
        <h1 className="sr-only">{t.nav.tabPartner}</h1>
        <AccountStrip kind="partner" />
        <ListingStatus />
        <div className="flex gap-2 overflow-x-auto no-scrollbar" role="tablist" aria-label="Partner tools">
          {tabs.map(([id, label, Icon]) => {
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
                <Icon className="w-4 h-4" aria-hidden="true" />
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
      {activeTab === 'network' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <PartnerNetwork />
        </div>
      )}
      {activeTab === 'gear' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <PartnerGear />
        </div>
      )}
      {activeTab === 'tags' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <PartnerTags />
        </div>
      )}
      {/* every tab ends with the next one, so partners are never left at a dead end */}
      {nextTab && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 flex justify-end">
          <button
            type="button"
            onClick={() => goTo(nextTab[0])}
            className="px-5 py-3 rounded-xl text-sm font-bold border border-emerald-600 text-emerald-300 hover:bg-emerald-950 flex items-center gap-2 cursor-pointer"
          >
            {t.eco.next.partnerNext.replace('{tab}', nextTab[1])}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </>
  );
}
