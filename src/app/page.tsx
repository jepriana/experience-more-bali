'use client';

import React, { useCallback, useState } from 'react';
import { Navbar, ActiveTab } from '@/components/Navbar';
import { TravelerPlatform } from '@/components/traveler/TravelerPlatform';
import { PartnerPlatform } from '@/components/partner/PartnerPlatform';
import { QrMemoryPlatform } from '@/components/phygital/QrMemoryPlatform';
import { PartnersProvider } from '@/context/PartnersContext';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import { SessionStateProvider, useSessionState } from '@/context/SessionStateContext';
import { Sparkles, ShieldCheck } from 'lucide-react';

function MainApp() {
  const [activeTab, setActiveTab] = useSessionState<ActiveTab>('app.activeTab', 'traveler');
  const [partnerFocusId, setPartnerFocusId] = useState<string | undefined>(undefined);
  const { t } = useLanguage();

  const handleSelectPartnerForPartnerView = (partnerId: string) => {
    setPartnerFocusId(partnerId);
    setActiveTab('partner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // The partner jump is a one-time event: clear it once PartnerPlatform has loaded it
  const handleInitialPartnerApplied = useCallback(() => setPartnerFocusId(undefined), []);

  const handleNavigateToTraveler = () => {
    setActiveTab('traveler');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'traveler' && (
          <TravelerPlatform onSelectPartnerForPartnerView={handleSelectPartnerForPartnerView} />
        )}
        {activeTab === 'partner' && (
          <PartnerPlatform
            initialPartnerId={partnerFocusId}
            onNavigateToTraveler={handleNavigateToTraveler}
            onInitialPartnerApplied={handleInitialPartnerApplied}
          />
        )}
        {activeTab === 'phygital' && <QrMemoryPlatform />}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800 bg-stone-950 text-stone-400 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <span className="font-bold text-stone-200">
              {t.footer.brandTitle}
            </span>
            <span className="hidden sm:inline text-stone-600">•</span>
            <span>{t.footer.eventTag}</span>
            <span className="hidden sm:inline text-stone-600">•</span>
            <span className="text-emerald-400 font-medium">
              {t.footer.tagline}
            </span>
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
    </div>
  );
}

export default function Home() {
  return (
    <LanguageProvider>
      <PartnersProvider>
        <SessionStateProvider>
          <MainApp />
        </SessionStateProvider>
      </PartnersProvider>
    </LanguageProvider>
  );
}
