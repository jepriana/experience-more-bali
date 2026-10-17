'use client';

import React from 'react';
import { BadgeCheck, Clock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { usePartners } from '@/context/PartnersContext';

export function formatVerifiedDate(iso: string | undefined, language: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Trust badge for a partner.
 *  - verified → "✓ KOSSI Verified" (with the date on hover / for screen readers)
 *  - otherwise → a quiet "Not yet verified" / "In review" label, unless `hideUnverified`
 * `compact` shows only the check icon (for tight lists like the day grid).
 */
export function VerificationBadge({
  partnerId,
  compact = false,
  hideUnverified = false,
  className = ''
}: {
  partnerId: string;
  compact?: boolean;
  hideUnverified?: boolean;
  className?: string;
}) {
  const { t, language } = useLanguage();
  const { statusOf } = usePartners();
  const { status, verifiedAt } = statusOf(partnerId);

  if (status === 'verified') {
    const when = t.verify.verifiedOn.replace('{date}', formatVerifiedDate(verifiedAt, language));
    if (compact) {
      return (
        <span role="img" aria-label={`${t.verify.verified}. ${when}`} title={`${t.verify.verified} — ${when}`} className={`inline-flex shrink-0 ${className}`}>
          <BadgeCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 ${className}`}
        title={when}
      >
        <BadgeCheck className="w-3.5 h-3.5" aria-hidden="true" />
        {t.verify.verified}
        <span className="sr-only">. {when}</span>
      </span>
    );
  }

  if (hideUnverified || compact) return null;
  const label = status === 'in_review' ? t.verify.inReview : t.verify.notVerified;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-stone-900 text-stone-400 border border-stone-700 ${className}`}
      title={t.verify.notVerifiedTitle}
    >
      <Clock className="w-3 h-3" aria-hidden="true" />
      {label}
    </span>
  );
}
