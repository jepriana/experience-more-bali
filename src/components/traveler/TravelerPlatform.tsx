'use client';

import React, { useRef } from 'react';
import {
  CURATED_BALI_PARTNERS,
  CuratedPartner,
  PartnerCategory,
  createWhatsAppInquiryUrl
} from '@/data/curatedPartners';
import { usePartners } from '@/context/PartnersContext';
import { useSessionState } from '@/context/SessionStateContext';
import type { ItineraryResponse } from '@/lib/schemas';
import type { StreamResultMeta } from '@/lib/streamProtocol';
import { useAiStream, type DeepPartial } from '@/lib/useAiStream';
import { AiSourceBadge, Skeleton, StreamErrorBanner, StreamText, ThinkingPanel, revealOutput } from '@/components/ai/StreamingUi';
import { useLanguage } from '@/context/LanguageContext';
import {
  Compass,
  Sparkles,
  MapPin,
  Calendar,
  CheckCircle,
  MessageCircle,
  Award,
  ChevronRight,
  Search,
  Filter,
  ShieldCheck,
  HeartHandshake,
  Check,
  ExternalLink
} from 'lucide-react';

interface TravelerPlatformProps {
  onSelectPartnerForPartnerView?: (partnerId: string) => void;
}

export function TravelerPlatform({ onSelectPartnerForPartnerView }: TravelerPlatformProps) {
  const { partners, isCustomPartner } = usePartners();
  const { language, t } = useLanguage();

  // Builder Form state
  const [travelerStyle, setTravelerStyle] = useSessionState('traveler.travelerStyle', 'Family with 2 children (ages 6 & 10)');
  const [duration, setDuration] = useSessionState('traveler.duration', '3 Days');
  const [pace, setPace] = useSessionState('traveler.pace', 'Balanced Family Explorer');
  const [selectedInterests, setSelectedInterests] = useSessionState<string[]>('traveler.selectedInterests', [
    'Subak Heritage & Canals',
    'Traditional Herbal Jamu',
    'Bamboo Eco Lodges'
  ]);
  const [customNotes, setCustomNotes] = useSessionState('traveler.customNotes', '');
  const [adventureResult, setAdventureResult] = useSessionState<ItineraryResponse | null>('traveler.adventureResult', null);
  // where the last result came from (live AI vs offline demo) + the model's reasoning summary
  const [resultMeta, setResultMeta] = useSessionState<(StreamResultMeta & { thoughts?: string }) | null>(
    'traveler.resultMeta',
    null
  );

  // Live stream: keeps running (and visible) across tab switches
  const stream = useAiStream<ItineraryResponse>('traveler');
  const isLoading = stream.isStreaming;
  const resultRef = useRef<HTMLDivElement>(null);

  // Directory filter state
  const [selectedCategory, setSelectedCategory] = useSessionState<PartnerCategory | 'All'>('traveler.selectedCategory', 'All');
  const [searchQuery, setSearchQuery] = useSessionState('traveler.searchQuery', '');
  const [savedPassportPartners, setSavedPassportPartners] = useSessionState<string[]>('traveler.savedPassportPartners', [
    'dest-jatiluwih-subak'
  ]);

  const interestOptionList = [
    { key: 'subak', label: t.traveler.themeOptions.subak, val: 'Subak Heritage & Canals' },
    { key: 'jamu', label: t.traveler.themeOptions.jamu, val: 'Traditional Herbal Jamu' },
    { key: 'bamboo', label: t.traveler.themeOptions.bamboo, val: 'Bamboo Eco Lodges' },
    { key: 'coral', label: t.traveler.themeOptions.coral, val: 'Coral Reef Conservation' },
    { key: 'coffee', label: t.traveler.themeOptions.coffee, val: 'Highland Coffee & Waterfalls' },
    { key: 'hearth', label: t.traveler.themeOptions.hearth, val: 'Wood-fired Ancestral Kitchens' },
    { key: 'fireflies', label: t.traveler.themeOptions.fireflies, val: 'Sacred Forest Fireflies' }
  ];

  const toggleInterest = (interestVal: string) => {
    if (selectedInterests.includes(interestVal)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interestVal));
    } else {
      setSelectedInterests([...selectedInterests, interestVal]);
    }
  };

  const togglePassport = (id: string) => {
    if (savedPassportPartners.includes(id)) {
      setSavedPassportPartners(savedPassportPartners.filter((p) => p !== id));
    } else {
      setSavedPassportPartners([...savedPassportPartners, id]);
    }
  };

  const handleGenerateItinerary = () => {
    if (isLoading) return;
    // Bring the output into view (below the form on phones, or scrolled under the header) so the stream is seen
    revealOutput(resultRef.current);
    void stream.start(
      '/api/traveler',
      {
        travelerStyle,
        duration,
        pace,
        interests: selectedInterests,
        customNotes,
        customPartners: partners,
        language
      },
      (final) => {
        setAdventureResult(final.data);
        setResultMeta({
          isAiGenerated: final.isAiGenerated,
          model: final.model,
          fallbackReason: final.fallbackReason,
          thoughts: final.thoughts
        });
      }
    );
  };

  // While streaming, render the half-written answer; afterwards the validated result.
  const view: DeepPartial<ItineraryResponse> | null = isLoading ? (stream.partial ?? {}) : adventureResult;
  const isActive = (path: string) => stream.activePath === path;
  const expectedDays = parseInt(duration, 10) || 3;

  // Human-readable "what the AI is doing right now", from the field being written
  const liveStatus = (() => {
    if (!stream.activePath) return null;
    const [section, index] = stream.activePath.split('.');
    switch (section) {
      case 'title':
      case 'theme':
        return t.stream.statusTitle;
      case 'whyThisFits':
        return t.stream.statusWhy;
      case 'recommendedPartnerIds':
        return t.stream.statusMatching;
      case 'days':
        return t.stream.statusDay.replace('{n}', String(Number(index ?? 0) + 1));
      case 'passportBadgeToEarn':
        return t.stream.statusBadge;
      case 'sustainabilityPledge':
        return t.stream.statusPledge;
      default:
        return null;
    }
  })();

  const filteredPartners = partners.filter((partner) => {
    const matchesCategory =
      selectedCategory === 'All' ? true : partner.category === selectedCategory;
    const matchesSearch =
      partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.familyTags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Hero Intro */}
      <div className="relative rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-stone-900 border border-emerald-800/40 p-8 sm:p-10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-700/60 text-emerald-300 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" />
            <span>{t.traveler.heroTag}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {t.traveler.heroTitle}
          </h1>
          <p className="text-stone-300 text-base sm:text-lg leading-relaxed">
            {t.traveler.heroDesc}
          </p>
          <div className="flex flex-wrap gap-4 pt-2 text-xs text-stone-300">
            <span className="flex items-center gap-1.5 bg-stone-900/70 border border-stone-800 px-3 py-1.5 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              {t.traveler.groundedBadge}
            </span>
            <span className="flex items-center gap-1.5 bg-stone-900/70 border border-stone-800 px-3 py-1.5 rounded-lg">
              <Award className="w-4 h-4 text-amber-400" />
              {t.traveler.gamifiedBadge}
            </span>
            <span className="flex items-center gap-1.5 bg-stone-900/70 border border-stone-800 px-3 py-1.5 rounded-lg">
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              {t.traveler.whatsappBadge}
            </span>
          </div>
        </div>
      </div>

      {/* AI Adventure Builder Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Preferences Form */}
        <div className="lg:col-span-5 bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
          <div className="border-b border-stone-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              {t.traveler.configTitle}
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              {t.traveler.configSubtitle}
            </p>
          </div>

          {/* Traveler Style */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-300">
              {t.traveler.labelProfile}
            </label>
            <select
              value={travelerStyle}
              onChange={(e) => setTravelerStyle(e.target.value)}
              className="w-full bg-stone-800 border border-stone-700 text-stone-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Family with 2 children (ages 6 & 10)">
                {t.traveler.profileOptions.family2kids}
              </option>
              <option value="Multi-generational family (grandparents, parents, teens)">
                {t.traveler.profileOptions.multiGen}
              </option>
              <option value="Eco-conscious couple (mindful & slow travel)">
                {t.traveler.profileOptions.couple}
              </option>
              <option value="Solo cultural & culinary seeker">
                {t.traveler.profileOptions.solo}
              </option>
            </select>
          </div>

          {/* Duration & Pace */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-300">
                {t.traveler.labelDuration}
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-stone-800 border border-stone-700 text-stone-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="3 Days">{t.traveler.durationOptions.d3}</option>
                <option value="5 Days">{t.traveler.durationOptions.d5}</option>
                <option value="7 Days">{t.traveler.durationOptions.d7}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-300">
                {t.traveler.labelPace}
              </label>
              <select
                value={pace}
                onChange={(e) => setPace(e.target.value)}
                className="w-full bg-stone-800 border border-stone-700 text-stone-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Relaxed & Mindful">{t.traveler.paceOptions.relaxed}</option>
                <option value="Balanced Family Explorer">{t.traveler.paceOptions.balanced}</option>
                <option value="Active Adventure">{t.traveler.paceOptions.active}</option>
              </select>
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-300 flex items-center justify-between">
              <span>{t.traveler.labelThemes}</span>
              <span className="text-[11px] text-stone-400 font-normal">{t.traveler.selectTagsHint}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {interestOptionList.map((item) => {
                const isSelected = selectedInterests.includes(item.val);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleInterest(item.val)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                        : 'bg-stone-800 text-stone-300 hover:bg-stone-700/80 border border-stone-700/60'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Notes */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-300">
              {t.traveler.labelNotes}
            </label>
            <textarea
              rows={2}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder={t.traveler.notesPlaceholder}
              className="w-full bg-stone-800 border border-stone-700 text-stone-100 placeholder-stone-500 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* Action Button */}
          <button
            onClick={handleGenerateItinerary}
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99] disabled:opacity-60 disabled:cursor-wait"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{t.traveler.btnAssembling}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>{t.traveler.btnAssemble}</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: AI result — rendered live while it streams in */}
        <div ref={resultRef} className="lg:col-span-7 flex flex-col justify-start space-y-4">
          {stream.state.phase === 'error' && stream.state.error && (
            <StreamErrorBanner
              title={t.stream.errorTitle}
              message={stream.state.error}
              retryLabel={t.stream.retry}
              dismissLabel={t.stream.dismiss}
              onRetry={handleGenerateItinerary}
              onDismiss={stream.dismissError}
            />
          )}

          <ThinkingPanel
            live={isLoading}
            thoughts={isLoading ? stream.state.thoughts : resultMeta?.thoughts ?? ''}
            status={liveStatus}
            idleStatuses={[t.stream.statusReading, t.stream.statusMatching, t.stream.statusPacing]}
            title={t.stream.thinkingTitle}
            doneTitle={t.stream.reasoningTitle}
          />

          {view ? (
            <div
              className={`bg-stone-900 border rounded-2xl p-6 sm:p-7 shadow-xl space-y-6 transition-colors duration-700 ${
                isLoading ? 'border-emerald-800/50' : 'border-stone-800'
              }`}
              aria-busy={isLoading}
            >
              {/* Header result */}
              <div className="border-b border-stone-800 pb-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {view.theme ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/80 stream-in">
                        <StreamText text={view.theme} active={isActive('theme')} />
                      </span>
                    ) : isLoading ? (
                      <Skeleton className="h-6 w-44 rounded-full" />
                    ) : null}
                    {!isLoading && (
                      <AiSourceBadge meta={resultMeta} liveLabel={t.stream.liveAi} offlineLabel={t.stream.offlineDemo} />
                    )}
                  </div>
                  {view.passportBadgeToEarn ? (
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold bg-amber-950/40 border border-amber-800/40 px-3 py-1 rounded-full stream-in">
                      <Award className="w-4 h-4" />
                      <StreamText text={view.passportBadgeToEarn} active={isActive('passportBadgeToEarn')} />
                    </div>
                  ) : isLoading ? (
                    <Skeleton className="h-6 w-36 rounded-full" />
                  ) : null}
                </div>

                {view.title ? (
                  <h3 className="text-2xl font-extrabold text-white mt-3 stream-in">
                    <StreamText text={view.title} active={isActive('title')} />
                  </h3>
                ) : (
                  isLoading && (
                    <div className="mt-4">
                      <Skeleton className="h-7 w-3/4" />
                    </div>
                  )
                )}

                {(view.whyThisFits || isLoading) && (
                  <div className="mt-3 p-3.5 bg-stone-800/70 border border-stone-700/60 rounded-xl text-xs text-stone-300 leading-relaxed">
                    <span className="font-semibold text-emerald-400 block mb-1">{t.traveler.whyFitsTitle}</span>
                    {view.whyThisFits ? (
                      <StreamText text={view.whyThisFits} active={isActive('whyThisFits')} />
                    ) : (
                      <Skeleton className="h-2.5 w-full" lines={2} />
                    )}
                  </div>
                )}
              </div>

              {/* Day-by-Day Missions & Partners */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-stone-400">
                  {t.traveler.journeySequence}
                </h4>
                {(view.days ?? []).map((day, idx) => {
                  const partner = day.partnerId ? partners.find((p) => p.id === day.partnerId) : undefined;
                  const field = (name: string) => isActive(`days.${idx}.${name}`);
                  return (
                    <div
                      key={idx}
                      className="stream-in bg-stone-950/70 border border-stone-800 rounded-xl p-4 sm:p-5 space-y-3 hover:border-emerald-700/50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          {day.title ? (
                            <span className="text-sm font-bold text-white">
                              <StreamText text={day.title} active={field('title')} />
                            </span>
                          ) : (
                            <div className="w-48">
                              <Skeleton className="h-3.5 w-full" />
                            </div>
                          )}
                        </div>
                        {partner && (
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-stone-800 text-stone-300 border border-stone-700 stream-in shrink-0">
                            {partner.category}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-stone-300 space-y-1.5">
                        {partner ? (
                          <div className="font-semibold text-emerald-300 flex items-start gap-1.5 stream-in">
                            <MapPin className="w-3.5 h-3.5 shrink-0 mt-px" />
                            <span>
                              {partner.name}{' '}
                              <span className="text-stone-400 font-normal">({partner.location})</span>
                            </span>
                          </div>
                        ) : (
                          isLoading && <Skeleton className="h-3 w-56" />
                        )}
                        {day.activityHighlight ? (
                          <p className="text-stone-300">
                            <StreamText text={day.activityHighlight} active={field('activityHighlight')} />
                          </p>
                        ) : (
                          isLoading && <Skeleton className="h-2.5 w-full" lines={2} />
                        )}
                      </div>

                      {/* Gamified Mission Box */}
                      {day.familyMission ? (
                        <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-lg flex items-start gap-2.5 text-xs text-amber-200 stream-in">
                          <Award className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-amber-300">{t.traveler.familyQuest} </span>
                            <StreamText text={day.familyMission} active={field('familyMission')} />
                          </div>
                        </div>
                      ) : (
                        isLoading && <Skeleton className="h-10 w-full rounded-lg" />
                      )}

                      {/* Direct WhatsApp Inquiry Button — only once the plan is final */}
                      {partner && !isLoading && (
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-stone-800/80 stream-in">
                          <span className="text-[11px] text-stone-400">{t.traveler.verifiedChannel}</span>
                          <a
                            href={createWhatsAppInquiryUrl(
                              partner,
                              `Om Swastiastu ${partner.name}! I am organizing our family trip via Experience More Bali 2027. We are following Day ${idx + 1}: "${day.title}". Could we check availability for your mission: "${day.familyMission}"?`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white transition-colors cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{t.traveler.btnInquireWa}</span>
                            <ExternalLink className="w-3 h-3 opacity-70" />
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Placeholders for the days still to come */}
                {isLoading &&
                  Array.from({ length: Math.max(0, expectedDays - (view.days?.length ?? 0)) }, (_, i) => (
                    <div
                      key={`pending-${i}`}
                      className="bg-stone-950/40 border border-dashed border-stone-800 rounded-xl p-4 sm:p-5 space-y-3"
                      aria-hidden="true"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-stone-800 text-stone-500 font-bold text-xs flex items-center justify-center">
                          {(view.days?.length ?? 0) + i + 1}
                        </span>
                        <div className="w-40">
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </div>
                      <Skeleton className="h-2.5 w-full" lines={2} />
                    </div>
                  ))}
              </div>

              {/* Sustainability Pledge */}
              {view.sustainabilityPledge && (
                <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-xl p-3.5 flex items-center gap-3 text-xs text-emerald-200 stream-in">
                  <HeartHandshake className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-white block">{t.traveler.pledgeTitle}</span>
                    <StreamText text={view.sustainabilityPledge} active={isActive('sustainabilityPledge')} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[380px] bg-stone-900 border border-dashed border-stone-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shadow-inner">
                <Compass className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-lg font-bold text-white">
                  {t.traveler.emptyTitle}
                </h3>
                <p className="text-xs text-stone-400">
                  {t.traveler.emptyDesc}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Directory of Curated Partners strictly grouped in Group A */}
      <div className="space-y-6 pt-4 border-t border-stone-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-stone-800 text-emerald-400 border border-stone-700">
              {t.traveler.dirBadge}
            </div>
            <h2 className="text-2xl font-bold text-white mt-1">
              {t.traveler.dirTitle}
            </h2>
            <p className="text-xs text-stone-400">
              {t.traveler.dirDesc}
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.traveler.searchPlaceholder}
                className="bg-stone-900 border border-stone-700 text-stone-100 placeholder-stone-500 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 w-56"
              />
            </div>

            <div className="flex items-center bg-stone-900 border border-stone-700 rounded-xl p-1 gap-1">
              {(
                [
                  { id: 'All', label: t.traveler.filterAll },
                  { id: 'Destination', label: t.traveler.filterDest },
                  { id: 'Accommodation', label: t.traveler.filterAccom },
                  { id: 'Culinary', label: t.traveler.filterCul }
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map((partner) => {
            const isSaved = savedPassportPartners.includes(partner.id);
            const categoryBadgeColor =
              partner.category === 'Destination'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                : partner.category === 'Accommodation'
                ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                : 'bg-amber-950 text-amber-300 border-amber-800';

            return (
              <div
                key={partner.id}
                className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-stone-700 transition-all group"
              >
                <div>
                  {/* Image & Header */}
                  <div className="relative h-48 w-full overflow-hidden bg-stone-800">
                    <img
                      src={partner.heroImage}
                      alt={partner.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent" />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap max-w-[75%]">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md ${categoryBadgeColor}`}
                      >
                        {partner.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-900/80 text-stone-300 border border-stone-700">
                        {partner.priceTier}
                      </span>
                      {(partner.isNewlyPublished || isCustomPartner(partner.id)) && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-stone-950 shadow-md flex items-center gap-1 animate-pulse">
                          <Sparkles className="w-3 h-3" />
                          {t.traveler.newlyPublished}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => togglePassport(partner.id)}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md border transition-all cursor-pointer ${
                        isSaved
                          ? 'bg-emerald-600 text-white border-emerald-400'
                          : 'bg-stone-900/70 text-stone-300 border-stone-700 hover:text-white'
                      }`}
                      title={isSaved ? 'In Adventure Passport' : 'Add to Passport'}
                    >
                      <Award className="w-4 h-4" />
                    </button>

                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-base font-bold text-white drop-shadow-md leading-snug">
                        {partner.name}
                      </h3>
                      <p className="text-xs text-stone-300 flex items-center gap-1 mt-0.5 drop-shadow">
                        <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">{partner.location}</span>
                      </p>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4">
                    <p className="text-xs text-stone-300 leading-relaxed">
                      {partner.description}
                    </p>

                    {/* Family Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {partner.familyTags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded-md border border-stone-700/60"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Grounded Verified Facts */}
                    <div className="bg-stone-950/80 border border-stone-800/80 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{t.traveler.verifiedFactsLabel}</span>
                      </div>
                      <ul className="text-[11px] text-stone-300 space-y-1.5 list-disc pl-4">
                        {partner.verifiedFacts.slice(0, 3).map((fact, fIdx) => (
                          <li key={fIdx} className="leading-tight">
                            {fact}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Default Mission Badge */}
                    <div className="p-3 bg-amber-950/20 border border-amber-800/30 rounded-xl space-y-1">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>
                          {t.traveler.defaultMissionLabel} ({partner.badgeTitle}):
                        </span>
                      </div>
                      <p className="text-xs text-amber-100/90 leading-snug">
                        {partner.defaultMission}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-5 pt-0 flex flex-col gap-2">
                  <a
                    href={createWhatsAppInquiryUrl(partner)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-emerald-950/40"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>
                      {t.traveler.btnInquireWa} ({partner.whatsappInquiryNumber})
                    </span>
                    <ExternalLink className="w-3 h-3 opacity-80" />
                  </a>

                  {onSelectPartnerForPartnerView && (
                    <button
                      onClick={() => onSelectPartnerForPartnerView(partner.id)}
                      className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-stone-700/60"
                    >
                      <span>{t.traveler.btnOpenInPartner}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
