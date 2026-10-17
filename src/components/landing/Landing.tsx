'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Compass, QrCode, Store } from 'lucide-react';
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

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Hero */}
      <div className="relative rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-stone-900 border border-emerald-800/40 p-8 sm:p-12 shadow-2xl overflow-hidden text-center">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[36rem] h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto space-y-5 flex flex-col items-center stream-in">
          <Image
            src="/brand/kossi-adventure-logo.jpg"
            alt="KOSSI Adventure"
            width={580}
            height={208}
            priority
            unoptimized
            className="h-20 sm:h-24 w-auto rounded-2xl shadow-2xl shadow-black/40 ring-1 ring-amber-900/60"
          />
          <span className="text-xs font-semibold text-emerald-300 tracking-wide">{t.landing.heroTag}</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">{t.landing.heroTitle}</h1>
          <p className="text-lg sm:text-xl font-semibold text-amber-300">{t.landing.heroSlogan}</p>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl">{t.landing.heroDesc}</p>
        </div>
      </div>

      {/* Two doors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Door
          href="/traveler"
          icon={<Compass className="w-5 h-5" />}
          title={t.landing.travelerDoorTitle}
          desc={t.landing.travelerDoorDesc}
          cta={
            hydrated && travelerSticker
              ? t.landing.continueAs.replace('{name}', travelerSticker.title)
              : t.landing.travelerDoorCta
          }
          sticker={
            travelerSticker ?? {
              kind: 'traveler',
              title: t.landing.sampleTravelerName,
              region: 'DKI Jakarta',
              tagline: t.sticker.poweredBy
            }
          }
        />
        <Door
          href="/partner"
          icon={<Store className="w-5 h-5" />}
          title={t.landing.partnerDoorTitle}
          desc={t.landing.partnerDoorDesc}
          cta={
            hydrated && partnerSticker
              ? t.landing.continueAs.replace('{name}', partnerSticker.title)
              : t.landing.partnerDoorCta
          }
          sticker={
            partnerSticker ?? {
              kind: 'partner',
              title: t.landing.samplePartnerName,
              region: 'Badung, Bali',
              tagline: t.sticker.strategicPartnerOf
            }
          }
        />
      </div>

      <div className="text-center">
        <Link
          href="/memory"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-stone-300 hover:text-white bg-stone-900 border border-stone-800 hover:border-stone-600 transition-colors"
        >
          <QrCode className="w-4 h-4 text-emerald-400" />
          <span>{t.landing.memoryLink}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

function Door({
  href,
  icon,
  title,
  desc,
  cta,
  sticker
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  cta: string;
  sticker: React.ComponentProps<typeof StickerCanvas>['content'];
}) {
  return (
    <Link
      href={href}
      className="group bg-stone-900 border border-stone-800 hover:border-emerald-600/70 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center gap-6 transition-all hover:-translate-y-0.5 hover:shadow-emerald-950/40 stream-in"
    >
      <div className="shrink-0 group-hover:rotate-[-3deg] group-hover:scale-105 transition-transform duration-300">
        <StickerCanvas content={sticker} size={170} />
      </div>
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400">
          {icon}
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white">{title}</h2>
        <p className="text-sm text-stone-400 leading-relaxed">{desc}</p>
        <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 group-hover:from-emerald-400 group-hover:to-teal-500 text-white shadow-lg shadow-emerald-950/50 transition-all">
          {cta}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </Link>
  );
}
