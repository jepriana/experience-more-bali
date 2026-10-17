'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { PartnersProvider, usePartners } from '@/context/PartnersContext';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import { SessionStateProvider } from '@/context/SessionStateContext';

/**
 * Shared frame for every page: providers, top bar and footer.
 * Lives in the root layout, so it (and the session state) survives page navigation.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <PartnersProvider>
        <SessionStateProvider>
          <div className="min-h-screen bg-stone-950 text-stone-50 flex flex-col">
            <SkipLink />
            {/* usePathname inside a dynamic route (/m/[code]) must sit under Suspense */}
            <Suspense fallback={<div className="h-[61px] bg-stone-900 border-b border-stone-800" />}>
              <Navbar />
            </Suspense>
            <main id="main" tabIndex={-1} className="flex-1 pb-16 focus:outline-none">
              {children}
            </main>
            <Footer />
          </div>
        </SessionStateProvider>
      </PartnersProvider>
    </LanguageProvider>
  );
}

function SkipLink() {
  const { language } = useLanguage();
  return (
    <a href="#main" className="skip-link">
      {language === 'id' ? 'Langsung ke konten' : 'Skip to content'}
    </a>
  );
}

function Footer() {
  const { t, language } = useLanguage();
  const { partners } = usePartners();
  const [aiReady, setAiReady] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => setAiReady(!!data?.configured))
      .catch(() => setAiReady(false));
  }, []);

  const aiLabel =
    aiReady === null
      ? ''
      : aiReady
        ? language === 'id'
          ? 'AI terhubung (Gemini)'
          : 'AI connected (Gemini)'
        : language === 'id'
          ? 'AI offline — jawaban contoh'
          : 'AI offline — showing sample answers';

  return (
    <footer className="border-t border-stone-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm text-stone-500">
        <p>
          <span className="font-semibold text-stone-200">{t.footer.brandTitle}</span>
          <span className="mx-2" aria-hidden="true">/</span>
          {t.footer.eventTag}
          <span className="mx-2" aria-hidden="true">/</span>
          <Link href="/admin" className="underline underline-offset-4 decoration-stone-700 hover:text-stone-200">
            {t.verify.adminFooterLink}
          </Link>
        </p>
        <p className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <span>
            {partners.length} {language === 'id' ? 'mitra' : 'partners'}
          </span>
          {aiLabel && (
            <span className="inline-flex items-center gap-2" role="status">
              <span className={`w-2 h-2 rounded-full ${aiReady ? 'bg-emerald-400' : 'bg-amber-400'}`} aria-hidden="true" />
              {aiLabel}
            </span>
          )}
        </p>
      </div>
    </footer>
  );
}
