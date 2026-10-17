'use client';

import React from 'react';
import { BadgeCheck, CircleAlert, Clock, EyeOff, Megaphone } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { usePartners } from '@/context/PartnersContext';
import { useAccounts } from '@/lib/accounts';
import { formatVerifiedDate } from '@/components/verification/VerificationBadge';

/** One line on the partner page: where their listing stands with the KOSSI team. */
export function ListingStatus() {
  const { t, language } = useLanguage();
  const { partner } = useAccounts();
  const { statusOf } = usePartners();
  if (!partner) return null;
  const v = t.verify;

  const id = partner.publishedPartnerId;
  const { status, verifiedAt, note } = id ? statusOf(id) : { status: null, verifiedAt: undefined, note: undefined };

  const view =
    status === null
      ? { Icon: Megaphone, tone: 'text-stone-300 border-stone-700', text: v.listingNone }
      : status === 'verified'
        ? { Icon: BadgeCheck, tone: 'text-emerald-300 border-emerald-800 bg-emerald-950/40', text: v.listingVerified.replace('{date}', formatVerifiedDate(verifiedAt, language)) }
        : status === 'in_review'
          ? { Icon: Clock, tone: 'text-stone-300 border-stone-700', text: v.listingInReview }
          : status === 'needs_changes'
            ? { Icon: CircleAlert, tone: 'text-amber-300 border-amber-800 bg-amber-950/40', text: v.listingNeedsChanges }
            : status === 'removed'
              ? { Icon: EyeOff, tone: 'text-red-300 border-red-800 bg-red-950/40', text: v.listingRemoved }
              : { Icon: Clock, tone: 'text-stone-300 border-stone-700', text: v.listingPublished };

  return (
    <div role="status" className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${view.tone}`}>
      <view.Icon className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
      <p>
        <span className="font-bold">{v.listingTitle}: </span>
        {view.text}
        {status === 'needs_changes' && note && <span className="block mt-1 text-stone-200">“{note}”</span>}
      </p>
    </div>
  );
}
