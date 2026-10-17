'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Compass,
  Store,
  QrCode,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { usePartners } from '@/context/PartnersContext';
import { useLanguage } from '@/context/LanguageContext';

export type ActiveTab = 'traveler' | 'partner' | 'phygital';

/** Each section is its own page now (separate front doors for travelers and partners). */
const TAB_ROUTES: Record<ActiveTab, string> = {
  traveler: '/traveler',
  partner: '/partner',
  phygital: '/memory'
};

export function Navbar() {
  const pathname = usePathname();
  const activeTab: ActiveTab | null = pathname.startsWith('/traveler')
    ? 'traveler'
    : pathname.startsWith('/partner')
      ? 'partner'
      : pathname.startsWith('/memory')
        ? 'phygital'
        : null;
  const { partners, totalCustomCount } = usePartners();
  const { language, setLanguage, t } = useLanguage();
  const [geminiStatus, setGeminiStatus] = useState<{
    configured: boolean;
    model: string;
    datasetCount: number;
  } | null>(null);

  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => setGeminiStatus(data))
      .catch(() =>
        setGeminiStatus({ configured: false, model: 'gemini-2.5-flash', datasetCount: 9 })
      );
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 text-stone-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand & Subtitle */}
          <Link href="/" className="flex items-center gap-3 group" aria-label="KOSSI Adventure — Experience More Bali 2027 home">
            <Image
              src="/brand/kossi-adventure-logo.jpg"
              alt="KOSSI Adventure"
              width={580}
              height={208}
              priority
              unoptimized
              className="h-11 sm:h-12 w-auto rounded-lg shadow-lg shadow-emerald-950/40 ring-1 ring-amber-900/50 group-hover:scale-[1.03] transition-transform"
            />
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">
                  Experience More Bali <span className="text-emerald-400">2027</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                  {t.nav.hackathonMvp}
                </span>
              </div>
              <p className="text-xs text-stone-400 hidden md:block">
                {t.nav.subTitle}
              </p>
            </div>
          </Link>

          {/* Slogan Pill */}
          <div className="hidden lg:flex items-center gap-2 bg-stone-800/60 border border-stone-700/60 rounded-full px-3.5 py-1 text-xs text-stone-300">
            <span className="text-emerald-400 font-medium">{t.nav.brandTagline}</span>
          </div>

          {/* Partner Count, Gemini AI Status & Language Switcher */}
          <div className="flex items-center gap-2">
            {/* Active Partners Count */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-stone-800/80 border border-stone-700 text-stone-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {partners.length} {t.nav.partnersActive}
                {totalCustomCount > 0 && (
                  <span className="text-emerald-400 ml-1">
                    (+{totalCustomCount} {t.nav.customSuffix})
                  </span>
                )}
              </span>
            </div>

            {/* Gemini SDK Status */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                geminiStatus?.configured
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60'
                  : 'bg-amber-950/60 text-amber-300 border-amber-700/60'
              }`}
              title={
                geminiStatus?.configured
                  ? 'Gemini SDK active via .env.local'
                  : 'Gemini API key not detected in .env.local; intelligent grounded fallback active'
              }
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {geminiStatus?.configured ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    {t.nav.geminiActive}
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-400" />
                    {t.nav.sdkMockReady}
                  </span>
                )}
              </span>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-stone-800/90 border border-stone-700 rounded-xl p-0.5 shadow-inner">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  language === 'en'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Switch to English"
              >
                <span>🇬🇧</span>
                <span>EN</span>
              </button>
              <button
                type="button"
                onClick={() => setLanguage('id')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  language === 'id'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Ganti ke Bahasa Indonesia"
              >
                <span>🇮🇩</span>
                <span>ID</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Views Navigation Tabs */}
        <div className="flex border-t border-stone-800/80 pt-2 pb-2 gap-2 overflow-x-auto no-scrollbar">
          <Link
            href={TAB_ROUTES.traveler}
            aria-current={activeTab === 'traveler' ? 'page' : undefined}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'traveler'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30 ring-1 ring-emerald-400/40'
                : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{t.nav.tabTraveler}</span>
            <span
              className={`text-[11px] px-1.5 py-0.5 rounded font-normal hidden sm:inline ${
                activeTab === 'traveler'
                  ? 'bg-emerald-700/80 text-emerald-100'
                  : 'bg-stone-800 text-stone-400'
              }`}
            >
              {t.nav.tabTravelerSub}
            </span>
          </Link>

          <Link
            href={TAB_ROUTES.partner}
            aria-current={activeTab === 'partner' ? 'page' : undefined}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'partner'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30 ring-1 ring-emerald-400/40'
                : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>{t.nav.tabPartner}</span>
            <span
              className={`text-[11px] px-1.5 py-0.5 rounded font-normal hidden sm:inline ${
                activeTab === 'partner'
                  ? 'bg-emerald-700/80 text-emerald-100'
                  : 'bg-stone-800 text-stone-400'
              }`}
            >
              {t.nav.tabPartnerSub}
            </span>
          </Link>

          <Link
            href={TAB_ROUTES.phygital}
            aria-current={activeTab === 'phygital' ? 'page' : undefined}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'phygital'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30 ring-1 ring-emerald-400/40'
                : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>{t.nav.tabPhygital}</span>
            <span
              className={`text-[11px] px-1.5 py-0.5 rounded font-normal hidden sm:inline ${
                activeTab === 'phygital'
                  ? 'bg-emerald-700/80 text-emerald-100'
                  : 'bg-stone-800 text-stone-400'
              }`}
            >
              {t.nav.tabPhygitalSub}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
