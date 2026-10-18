'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Download, Store } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAccounts, useHydrated } from '@/lib/accounts';
import { usePartners } from '@/context/PartnersContext';
import { memoryUrl } from '@/lib/memoryLink';
import { ensurePartnerIdentity } from '@/lib/identity';
import { downloadCounterCard } from '@/lib/printFiles';
import { fill } from '@/i18n/stage3';
import { useAccountSticker } from '@/components/onboarding/AccountSticker';
import { MerchDesigner } from '@/components/merch/MerchDesigner';
import { QrImage } from '@/components/memory/QrImage';

/** Partner "Memory gear" tab: staff gear with the partner sticker, and a QR card for the counter. */
export function PartnerGear() {
  const { t } = useLanguage();
  const m = t.merch;
  const { partner } = useAccounts();
  const hydrated = useHydrated();
  const sticker = useAccountSticker('partner');
  const { isVerified } = usePartners();
  const [busy, setBusy] = useState(false);

  const qrUrl = useMemo(() => {
    if (!hydrated || !partner || !sticker) return null;
    const p = partner.profile;
    return memoryUrl({
      k: 'p',
      n: partner.businessName,
      r: sticker.region,
      ty: p?.type,
      dc: p?.discount || undefined,
      pi: partner.publishedPartnerId,
      pr: p?.products.length ? p.products.slice(0, 6) : undefined
    });
  }, [hydrated, partner, sticker]);

  // The counter card's QR also carries a check-in code, so travelers who scan it at the
  // counter can collect this place on their adventure credentials.
  useEffect(() => {
    void ensurePartnerIdentity();
  }, []);
  const counterUrl =
    qrUrl && partner?.memberId && partner.checkinToken ? `${qrUrl}?ci=${partner.memberId}.${partner.checkinToken}` : qrUrl;

  if (!partner || !sticker) return null;
  const discount = partner.profile?.discount;
  const offer = discount ? fill(t.memoryPage.discount, discount) : undefined;

  const downloadCard = async () => {
    if (!counterUrl) return;
    setBusy(true);
    try {
      const verifiedLine = partner.publishedPartnerId && isVerified(partner.publishedPartnerId) ? `✓ ${t.verify.verified}` : undefined;
      await downloadCounterCard(sticker, counterUrl, m.scanToSee, [verifiedLine, offer].filter(Boolean).join('  ·  ') || undefined);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <MerchDesigner
        sticker={sticker}
        qrUrl={qrUrl}
        storageKey="merch.partner"
        customer={{ name: `${partner.businessName} (${partner.picName})`, contact: partner.contact }}
        title={m.partnerTitle}
        subtitle={m.partnerSubtitle}
        qrDesc={m.qrPatchPartnerDesc}
      />

      <section className=" bg-stone-900 border border-emerald-900/60 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5">
        {counterUrl && <QrImage value={counterUrl} className="w-32 h-32 shrink-0 p-1" label={m.scanToSee} />}
        <div className="flex-1 space-y-2 text-center sm:text-left">
          <h3 className="font-bold text-stone-50 flex items-center gap-2 justify-center sm:justify-start">
            <Store className="w-4 h-4 text-emerald-400" />
            {m.counterCardTitle}
          </h3>
          <p className="text-sm text-stone-400">{m.counterCardDesc}</p>
          {offer && <p className="text-sm font-bold text-amber-400">{offer}</p>}
          {counterUrl && (
            <a href={counterUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-semibold text-emerald-400 underline underline-offset-4">
              {t.eco.checkin.preview}
            </a>
          )}
        </div>
        <button
          onClick={() => void downloadCard()}
          disabled={busy || !qrUrl}
          className="shrink-0 px-5 py-3 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-(--action-hover) text-white flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {m.downloadCard}
        </button>
      </section>
    </div>
  );
}
