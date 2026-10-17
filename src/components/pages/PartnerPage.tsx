'use client';

import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccounts, useHydrated, partnerRegionLabel, type PartnerAccount } from '@/lib/accounts';
import { useSessionState } from '@/context/SessionStateContext';
import { PartnerSignup } from '@/components/onboarding/PartnerSignup';
import { AccountStrip, StickerReveal } from '@/components/onboarding/AccountSticker';
import { PartnerPlatform } from '@/components/partner/PartnerPlatform';
import { PageLoading } from '@/components/pages/PageLoading';

/** /partner — sign up once (partner sticker is created), then the partner studio. */
export function PartnerPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const { partner } = useAccounts();
  const [justCreated, setJustCreated] = useState(false);

  // A curated partner opened from the traveler page ("open in partner view")
  const [focusId, setFocusId] = useSessionState<string | null>('partner.focusId', null);
  const clearFocus = useCallback(() => setFocusId(null), [setFocusId]);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <AccountStrip kind="partner" />
      </div>
      <PartnerPlatform
        initialPartnerId={focusId ?? undefined}
        onInitialPartnerApplied={clearFocus}
        onNavigateToTraveler={() => router.push('/traveler')}
      />
    </>
  );
}
