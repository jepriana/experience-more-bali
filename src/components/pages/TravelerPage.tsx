'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccounts, useHydrated } from '@/lib/accounts';
import { useSessionState } from '@/context/SessionStateContext';
import { TravelerSignup } from '@/components/onboarding/TravelerSignup';
import { AccountStrip, StickerReveal } from '@/components/onboarding/AccountSticker';
import { TravelerPlatform } from '@/components/traveler/TravelerPlatform';
import { PageLoading } from '@/components/pages/PageLoading';

/** /traveler — sign up once (sticker is created), then plan the trip. */
export function TravelerPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const { traveler } = useAccounts();
  const [justCreated, setJustCreated] = useState(false);
  const [, setPartnerFocus] = useSessionState<string | null>('partner.focusId', null);

  if (!hydrated) return <PageLoading />;
  if (!traveler) return <TravelerSignup onCreated={() => setJustCreated(true)} />;
  if (justCreated) return <StickerReveal kind="traveler" onContinue={() => setJustCreated(false)} />;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <AccountStrip kind="traveler" />
      </div>
      <TravelerPlatform
        onSelectPartnerForPartnerView={(partnerId) => {
          setPartnerFocus(partnerId);
          router.push('/partner');
        }}
      />
    </>
  );
}
