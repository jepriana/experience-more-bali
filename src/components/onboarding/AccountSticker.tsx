'use client';

import React, { useLayoutEffect, useState } from 'react';
import { ArrowRight, Download, LogOut, PartyPopper, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { downloadSticker, type StickerContent, type StickerKind } from '@/lib/sticker';
import { partnerRegionLabel, travelerRegionLabel, useAccounts } from '@/lib/accounts';
import { StickerCanvas } from '@/components/onboarding/StickerCanvas';

/** The signed-in account's sticker content (null when not signed up). */
export function useAccountSticker(kind: StickerKind): StickerContent | null {
  const { t } = useLanguage();
  const { traveler, partner } = useAccounts();
  if (kind === 'traveler' && traveler) {
    return { kind, title: traveler.name, region: travelerRegionLabel(traveler), tagline: t.sticker.poweredBy };
  }
  if (kind === 'partner' && partner) {
    return { kind, title: partner.businessName, region: partnerRegionLabel(partner), tagline: t.sticker.strategicPartnerOf };
  }
  return null;
}

/** Shown once, right after sign-up: the sticker "pops" in with download + continue. */
export function StickerReveal({ kind, onContinue, continueLabel }: { kind: StickerKind; onContinue: () => void; continueLabel?: string }) {
  const { t } = useLanguage();
  const sticker = useAccountSticker(kind);
  if (!sticker) return null;

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className=" bg-stone-900 border border-emerald-800/50 rounded-3xl p-6 sm:p-10 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="flex justify-center sticker-pop">
          <StickerCanvas content={sticker} size={400} />
        </div>
        <div className="space-y-4 text-center md:text-left stream-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-700/60 text-amber-300 text-xs font-semibold">
            <PartyPopper className="w-3.5 h-3.5" />
            <span>{t.sticker.memoryObjectLabel}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-50 tracking-tight">
            {kind === 'traveler' ? t.sticker.readyTraveler : t.sticker.readyPartner}
          </h1>
          <p className="text-sm text-stone-300 leading-relaxed">{t.sticker.readyDesc}</p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center md:justify-start">
            <button
              onClick={onContinue}
              className="px-5 py-3 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-(--action-hover) text-white shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
            >
              <span>{continueLabel ?? (kind === 'traveler' ? t.sticker.continueTraveler : t.sticker.continuePartner)}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => void downloadSticker(sticker)}
              className="px-5 py-3 rounded-xl font-semibold text-sm bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{t.sticker.download}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Compact "who you are" bar at the top of the traveler / partner page. */
export function AccountStrip({ kind }: { kind: StickerKind }) {
  const { t } = useLanguage();
  const { clearTraveler, clearPartner } = useAccounts();
  const sticker = useAccountSticker(kind);
  const [viewing, setViewing] = useState(false);

  // Close the sticker dialog when this page is hidden by navigation (pages stay alive in the background)
  useLayoutEffect(() => () => setViewing(false), []);

  if (!sticker) return null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 bg-stone-900/80 border border-stone-800 rounded-2xl p-3 pr-4 shadow-lg stream-in">
        <button
          onClick={() => setViewing(true)}
          className="shrink-0 rounded-xl cursor-pointer"
          aria-label={t.sticker.view}
        >
          <StickerCanvas content={sticker} size={64} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="text-xs text-stone-400">{t.sticker.welcome}</div>
          <div className="text-sm sm:text-base font-bold text-stone-50 truncate">{sticker.title}</div>
          <div className="text-xs text-emerald-400 truncate">{sticker.region}</div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => void downloadSticker(sticker)}
            className="px-3 py-2 rounded-lg text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.sticker.download}</span>
          </button>
          <button
            onClick={kind === 'traveler' ? clearTraveler : clearPartner}
            className="px-3 py-2 rounded-lg text-xs font-medium text-stone-400 hover:text-stone-50 hover:bg-stone-800 flex items-center gap-1.5 cursor-pointer transition-colors"
            title={t.sticker.switchAccount} aria-label={t.sticker.switchAccount}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{t.sticker.switchAccount}</span>
          </button>
        </div>
      </div>

      {viewing && (
        <div
          className="fixed inset-0 z-[60] bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setViewing(false)}
          role="dialog"
          aria-modal="true"
          aria-label={t.sticker.memoryObjectLabel}
        >
          <div className="relative sticker-pop" onClick={(e) => e.stopPropagation()}>
            <StickerCanvas content={sticker} size={440} />
            <button
              onClick={() => setViewing(false)}
              className="absolute -top-3 -right-3 p-2 rounded-full bg-stone-800 border border-stone-600 text-stone-50 hover:bg-stone-700 cursor-pointer"
              aria-label={t.sticker.close}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
