'use client';

import React from 'react';
import Link from 'next/link';
import { QrCode, Users } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { StickerCanvas } from '@/components/onboarding/StickerCanvas';
import { useAccountSticker } from '@/components/onboarding/AccountSticker';
import { useHydrated } from '@/lib/accounts';

/** Home page: one ecosystem, two front doors (travelers / partners). */
export function Landing() {
  const { t } = useLanguage();
  const hydrated = useHydrated();
  const travelerSticker = useAccountSticker('traveler');
  const partnerSticker = useAccountSticker('partner');

  const travelerContent = travelerSticker ?? {
    kind: 'traveler' as const,
    title: t.landing.sampleTravelerName,
    region: 'DKI Jakarta',
    tagline: t.sticker.poweredBy
  };
  const partnerContent = partnerSticker ?? {
    kind: 'partner' as const,
    title: t.landing.samplePartnerName,
    region: 'Badung, Bali',
    tagline: t.sticker.strategicPartnerOf
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero: the words on the left, the memory stickers (the product's souvenir) on the right */}
      <section aria-labelledby="hero-title" className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center py-12 sm:py-20">
        <div className="lg:col-span-7 space-y-6">
          <p className="text-sm font-semibold text-emerald-400">{t.landing.heroTag}</p>
          <h1 id="hero-title" className="text-4xl sm:text-6xl font-extrabold text-stone-50 tracking-tight leading-[1.05]">
            {t.landing.heroTitle}
          </h1>
          <p className="text-xl sm:text-2xl text-stone-300 leading-snug max-w-[32ch]">{t.landing.heroSlogan}</p>
          <p className="text-base text-stone-500 leading-relaxed max-w-[60ch]">{t.landing.heroDesc}</p>
        </div>
        <div className="lg:col-span-5 relative h-72 sm:h-80" aria-hidden="true">
          <div className="absolute left-[8%] top-0 -rotate-6 sticker-pop">
            <StickerCanvas content={travelerContent} size={230} />
          </div>
          <div className="absolute right-[6%] bottom-0 rotate-[5deg] sticker-pop" style={{ animationDelay: '120ms' }}>
            <StickerCanvas content={partnerContent} size={200} />
          </div>
        </div>
      </section>

      {/* Two doors */}
      <section className="grid grid-cols-1 md:grid-cols-2 border-t border-stone-700">
        <Door
          href="/traveler"
          title={t.landing.travelerDoorTitle}
          desc={t.landing.travelerDoorDesc}
          cta={hydrated && travelerSticker ? t.landing.continueAs.replace('{name}', travelerSticker.title) : t.landing.travelerDoorCta}
          primary
        />
        <Door
          href="/partner"
          title={t.landing.partnerDoorTitle}
          desc={t.landing.partnerDoorDesc}
          cta={hydrated && partnerSticker ? t.landing.continueAs.replace('{name}', partnerSticker.title) : t.landing.partnerDoorCta}
          className="md:border-l border-t md:border-t-0 border-stone-700 md:pl-10"
        />
      </section>

      <p className="py-10 border-t border-stone-800 text-sm text-stone-500 flex flex-wrap gap-x-8 gap-y-3">
        <Link href="/memory" className="inline-flex items-center gap-2 font-semibold text-emerald-400 underline underline-offset-4 decoration-emerald-800 hover:decoration-emerald-400">
          <QrCode className="w-4 h-4" aria-hidden="true" />
          {t.landing.memoryLink}
        </Link>
        <Link href="/connect" className="inline-flex items-center gap-2 font-semibold text-emerald-400 underline underline-offset-4 decoration-emerald-800 hover:decoration-emerald-400">
          <Users className="w-4 h-4" aria-hidden="true" />
          {t.eco.next.connect.title}: {t.eco.next.connect.desc}
        </Link>
      </p>
    </div>
  );
}

function Door({
  href,
  title,
  desc,
  cta,
  primary,
  className = ''
}: {
  href: string;
  title: string;
  desc: string;
  cta: string;
  primary?: boolean;
  className?: string;
}) {
  return (
    <div className={`py-10 md:pr-10 space-y-4 ${className}`}>
      <h2 className="text-2xl font-bold text-stone-50">{title}</h2>
      <p className="text-base text-stone-500 leading-relaxed max-w-[52ch]">{desc}</p>
      <Link
        href={href}
        className={`inline-flex items-center gap-2 px-5 py-3 rounded-lg font-bold text-sm transition-colors ${
          primary
            ? 'bg-emerald-600 hover:bg-(--action-hover) text-white'
            : 'border-2 border-stone-300 text-stone-50 hover:bg-stone-50 hover:text-stone-950'
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
