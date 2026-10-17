'use client';

import React, { Suspense } from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { PartnersProvider } from '@/context/PartnersContext';
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
          <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col selection:bg-emerald-500 selection:text-white">
            {/* usePathname inside a dynamic route (/m/[code]) must sit under Suspense */}
            <Suspense fallback={<div className="h-16 border-b border-stone-800" />}>
              <Navbar />
            </Suspense>
            <main className="flex-1 pb-16">{children}</main>
            <Footer />
          </div>
        </SessionStateProvider>
      </PartnersProvider>
    </LanguageProvider>
  );
}

function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-stone-800 bg-stone-950 text-stone-400 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <span className="font-bold text-stone-200">{t.footer.brandTitle}</span>
          <span className="hidden sm:inline text-stone-600">•</span>
          <span>{t.footer.eventTag}</span>
          <span className="hidden sm:inline text-stone-600">•</span>
          <span className="text-emerald-400 font-medium">{t.footer.tagline}</span>
        </div>

        <div className="flex items-center gap-4 text-stone-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            {t.footer.groundedEngine}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            {t.footer.poweredBy}
          </span>
        </div>
      </div>
    </footer>
  );
}
