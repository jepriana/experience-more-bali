'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  CuratedPartner,
  PartnerCategory
} from '@/data/curatedPartners';
import { usePartners } from '@/context/PartnersContext';
import { useAccounts } from '@/lib/accounts';
import { normalizePartnerType } from '@/data/partnerGroups';
import { ensurePartnerIdentity } from '@/lib/identity';
import { useSessionState } from '@/context/SessionStateContext';
import type { PartnerProfile } from '@/lib/schemas';
import type { StreamResultMeta } from '@/lib/streamProtocol';
import { useAiStream, type DeepPartial } from '@/lib/useAiStream';
import { AiSourceBadge, Skeleton, StreamErrorBanner, StreamText, revealOutput } from '@/components/ai/StreamingUi';
import { useLanguage } from '@/context/LanguageContext';
import {
  Store,
  Sparkles,
  ShieldCheck,
  Plus,
  Trash2,
  Copy,
  Check,
  Award,
  Globe,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface PartnerPlatformProps {
  initialPartnerId?: string;
  onNavigateToTraveler?: () => void;
  /** Called once the initialPartnerId has been loaded into the form, so it isn't re-applied on every remount. */
  onInitialPartnerApplied?: () => void;
}

export function PartnerPlatform({
  initialPartnerId,
  onNavigateToTraveler,
  onInitialPartnerApplied
}: PartnerPlatformProps) {
  const { partners, addPartner } = usePartners();
  const { partner: account, savePartner } = useAccounts();
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const { language, t } = useLanguage();

  // Form Inputs
  const [businessName, setBusinessName] = useSessionState('partner.businessName', '');
  const [category, setCategory] = useSessionState<PartnerCategory>('partner.category', 'Destination');
  const [location, setLocation] = useSessionState('partner.location', 'Tejakula Coastal Village, Buleleng, North Bali');
  const [priceTier, setPriceTier] = useSessionState<'$' | '$$' | '$$$' | '$$$$'>('partner.priceTier', '$$');
  const [whatsappNumber, setWhatsappNumber] = useSessionState('partner.whatsappNumber', '+6281239981240');
  const [rawFacts, setRawFacts] = useSessionState<string[]>('partner.rawFacts', [
    'Operated by 8 traditional artisanal salt-farming families using ancient coconut trunk evaporation troughs (Palung).',
    'Certified microplastic-free pure sea salt harvested solely using solar drying and volcanic black sand filtration.',
    '100% of profits are shared directly with the local village Banjar community welfare fund.',
    'Provides guided family salt-raking workshops and safe coastal spring pools for children.'
  ]);

  // UI state
  const [generatedResult, setGeneratedResult] = useSessionState<PartnerProfile | null>('partner.generatedResult', null);
  // where the last kit came from (live AI vs offline demo)
  const [resultMeta, setResultMeta] = useSessionState<StreamResultMeta | null>('partner.resultMeta', null);
  const [formError, setFormError] = useState<string | null>(null);

  // Live stream: keeps running (and visible) across tab switches
  const stream = useAiStream<PartnerProfile>('partner');
  const isLoading = stream.isStreaming;
  const resultRef = useRef<HTMLDivElement>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [publishedSuccess, setPublishedSuccess] = useSessionState('partner.publishedSuccess', false);
  const [lastPublishedPartner, setLastPublishedPartner] = useSessionState<CuratedPartner | null>('partner.lastPublishedPartner', null);

  // If initialPartnerId is passed, load that partner's data into the form
  useEffect(() => {
    if (initialPartnerId) {
      const existing = partners.find((p) => p.id === initialPartnerId);
      if (existing) {
        setBusinessName(existing.name);
        setCategory(existing.category);
        setLocation(existing.location);
        setPriceTier(existing.priceTier);
        setWhatsappNumber(existing.whatsappInquiryNumber);
        setRawFacts(existing.verifiedFacts);
        setGeneratedResult(null);
        setPublishedSuccess(false);
        // One-shot: tell the page it's applied, so returning to this tab keeps the user's edits
        onInitialPartnerApplied?.();
      }
    }
  }, [
    initialPartnerId,
    partners,
    onInitialPartnerApplied,
    setBusinessName,
    setCategory,
    setLocation,
    setPriceTier,
    setWhatsappNumber,
    setRawFacts,
    setGeneratedResult,
    setPublishedSuccess
  ]);

  const handleAddFactField = () => {
    setRawFacts([...rawFacts, '']);
  };

  const handleUpdateFact = (index: number, value: string) => {
    const updated = [...rawFacts];
    updated[index] = value;
    setRawFacts(updated);
  };

  const handleRemoveFact = (index: number) => {
    if (rawFacts.length > 1) {
      setRawFacts(rawFacts.filter((_, i) => i !== index));
    }
  };

  // Preset example loaders with language awareness
  const loadPresetExample = (type: 'salt' | 'vanilla' | 'herbal') => {
    setPublishedSuccess(false);
    const isId = language === 'id';

    if (type === 'salt') {
      setBusinessName(
        isId
          ? 'Atelier Garam Laut Tradisional & Pasir Hitam Tejakula'
          : 'Tejakula Artisanal Sea Salt & Black Sand Atelier'
      );
      setCategory('Destination');
      setLocation(
        isId
          ? 'Desa Pesisir Tejakula, Kabupaten Buleleng (Bali Utara)'
          : 'Tejakula Coastal Village, Buleleng Regency (North Bali)'
      );
      setPriceTier('$$');
      setWhatsappNumber('+6281239981240');
      setRawFacts(
        isId
          ? [
              'Dikelola oleh 8 keluarga petani garam tradisional menggunakan palung belahan batang kelapa kuno.',
              'Garam laut murni bersertifikat bebas mikroplastik yang dikeringkan dengan tenaga surya dan filtrasi pasir vulkanik hitam.',
              '100% keuntungan disalurkan langsung ke dana sosial komunitas Banjar desa setempat.',
              'Menyediakan lokakarya menyekop garam keluarga dan kolam mata air pesisir yang aman untuk anak-anak.'
            ]
          : [
              'Operated by 8 traditional artisanal salt-farming families using ancient coconut trunk evaporation troughs (Palung).',
              'Certified microplastic-free pure sea salt harvested solely using solar drying and volcanic black sand filtration.',
              '100% of profits are shared directly with the local village Banjar community welfare fund.',
              'Provides guided family salt-raking workshops and safe coastal spring pools for children.'
            ]
      );
    } else if (type === 'vanilla') {
      setBusinessName(
        isId
          ? 'Pondok Agroforestri & Vanili Hutan Awan Wanagiri'
          : 'Wanagiri Cloud Forest Vanilla & Agroforestry Haven'
      );
      setCategory('Accommodation');
      setLocation(
        isId
          ? 'Punggung Bukit Wanagiri, Danau Buyan, Buleleng'
          : 'Wanagiri Ridge, Lake Buyan Highlands, Buleleng'
      );
      setPriceTier('$$$');
      setWhatsappNumber('+6281353991208');
      setRawFacts(
        isId
          ? [
              'Sulur vanili Tahiti pusaka yang diserbuki tangan di bawah naungan kanopi pohon Albizia endemik.',
              'Bebas pupuk kimia sintetis; dipupuk secara organik hanya menggunakan kulit ceri kopi fermentasi.',
              'Bungalow kayu bertiang dibangun dari bambu lokal tebang lestari dan kayu jati daur ulang.',
              'Akses jalan setapak langsung menuju gardu pandang Danau Buyan dan suaka burung dataran tinggi.'
            ]
          : [
              'Hand-pollinated heirloom Tahitian vanilla planifolia vines grown under canopy shade of native Albizia trees.',
              'Zero chemical fertilizers or synthetic pesticides; fertilized strictly with composted coffee cherries.',
              'Timber bungalows constructed on stilts using sustainably harvested local bamboo and repurposed teak.',
              'Direct foot trails connecting to Lake Buyan panoramic viewpoints and high-altitude bird sanctuaries.'
            ]
      );
    } else {
      setBusinessName(
        isId
          ? 'Warung Base Genep & Tungku Tanah Liat Tabanan'
          : 'Warung Tabanan Base Genep & Ancestral Clay Oven'
      );
      setCategory('Culinary');
      setLocation(
        isId ? 'Desa Penebel, Kabupaten Tabanan' : 'Penebel Rural Village, Tabanan Regency'
      );
      setPriceTier('$');
      setWhatsappNumber('+6281238112399');
      setRawFacts(
        isId
          ? [
              'Memasak lambat hidangan tradisional Bali di kuali tanah liat buatan tangan di atas api kayu rambutan.',
              'Menggunakan pasta bumbu Base Genep pusaka yang ditumbuk segar setiap hari oleh para sesepuh desa di atas meja batu.',
              'Semua bebek dan beras merah organik dipasok dari radius 3 kilometer di sekitar desa Penebel.',
              'Bebas plastik sekali pakai; bungkus makanan menggunakan daun pisang segar yang diikat serat bambu.'
            ]
          : [
              'Slow-cooks ancestral Balinese festive dishes in hand-thrown clay pots over rambutan wood fires.',
              'Uses heirloom Base Genep spice paste ground fresh daily by village grandmothers on stone mortar tables.',
              'All duck and organic heritage grains are sourced within a 3-kilometer radius of Penebel village.',
              'Zero single-use plastic; takeaways packed strictly in folded banana leaves tied with bamboo fiber.'
            ]
      );
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleGenerateAssistant = () => {
    if (isLoading) return;
    // Inline validation instead of browser alert() popups
    if (!businessName.trim()) {
      setFormError(t.stream.nameRequired);
      return;
    }
    const cleanFacts = rawFacts.filter((f) => f.trim().length > 0);
    if (cleanFacts.length === 0) {
      setFormError(t.stream.factRequired);
      return;
    }
    setFormError(null);
    setPublishedSuccess(false);

    // Bring the output into view (below the form on phones, or scrolled under the header) so the stream is seen
    revealOutput(resultRef.current);

    void stream.start(
      '/api/partner-assistant',
      {
        name: businessName,
        category,
        location,
        priceTier,
        whatsappInquiryNumber: whatsappNumber,
        rawFacts: cleanFacts,
        language
      },
      (final) => {
        setGeneratedResult(final.data);
        setResultMeta({ isAiGenerated: final.isAiGenerated, model: final.model, fallbackReason: final.fallbackReason });
      }
    );
  };

  // While streaming, render the half-written kit; afterwards the validated result.
  const view: DeepPartial<PartnerProfile> | null = isLoading ? (stream.partial ?? {}) : generatedResult;
  const isActive = (path: string) => stream.activePath === path;

  // Which of the 4 output sections the model is writing now (schema order)
  const partnerSteps = [
    t.stream.partnerStepProfile,
    t.stream.partnerStepSocial,
    t.stream.partnerStepMission,
    t.stream.partnerStepAudit
  ];
  const activeSection = (() => {
    const section = stream.activePath?.split('.')[0];
    switch (section) {
      case 'socialMediaCopy':
        return 1;
      case 'gamifiedMission':
        return 2;
      case 'groundingChecklist':
      case 'suggestedFamilyTags':
        return 3;
      default:
        return 0;
    }
  })();
  const partnerStatus = !stream.activePath
    ? t.stream.partnerStatusStarting
    : [
        t.stream.partnerStatusProfile,
        t.stream.partnerStatusSocial,
        t.stream.partnerStatusMission,
        t.stream.partnerStatusAudit
      ][activeSection];

  const handlePublishToEcosystem = async () => {
    if (!generatedResult || publishing) return;

    const categoryHeroImages: Record<PartnerCategory, string> = {
      Destination:
        'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1000&q=80',
      Accommodation:
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=80',
      Culinary:
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80',
      Activity:
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80'
    };

    // Re-publishing updates the same listing (it goes back to "not yet verified" until re-checked)
    const listingId = account?.publishedPartnerId ?? `partner-${Date.now()}`;
    const newPartner: CuratedPartner = {
      id: listingId,
      name: businessName,
      category,
      group: 'Group A',
      location,
      priceTier,
      familyTags: generatedResult.suggestedFamilyTags || [
        'Local business',
        'Hands-on Quest',
        'Family Friendly'
      ],
      verifiedFacts: rawFacts.filter((f) => f.trim().length > 0),
      description: generatedResult.polishedDescription,
      defaultMission: generatedResult.gamifiedMission?.missionDescription || 'Complete on-site quest',
      whatsappInquiryNumber: whatsappNumber,
      heroImage: categoryHeroImages[category],
      shortHighlight: generatedResult.shortHighlight || generatedResult.headline,
      badgeTitle: generatedResult.gamifiedMission?.badgeTitle || 'Ecosystem Steward',
      isNewlyPublished: true,
      // place it on the map / trip planner using the region from sign-up
      ...(account ? { regionId: account.regionId, area: account.area, partnerType: normalizePartnerType(account.profile?.type) } : {})
    };

    setPublishing(true);
    setPublishError(null);
    const result = await addPartner(newPartner);
    setPublishing(false);
    if (!result.ok) {
      setPublishError(result.error ?? t.verify.publishFailed);
      return;
    }
    if (account && account.publishedPartnerId !== listingId) savePartner({ ...account, publishedPartnerId: listingId });
    void ensurePartnerIdentity(true); // the partner network now knows this listing
    setLastPublishedPartner(newPartner);
    setPublishedSuccess(true);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header Banner */}
      <div className="max-w-3xl">
                <div className="relative z-10 max-w-3xl space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-50 tracking-tight leading-tight max-w-[24ch]">
            {t.partner.heroTitle}
          </h1>
          <p className="text-stone-300 text-base sm:text-lg leading-relaxed">
            {t.partner.heroDesc}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <span className="text-stone-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              {t.partner.groundingBadge}
            </span>
            <span className="text-stone-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              {t.partner.structuredOutputBadge}
            </span>
            <span className="text-stone-400 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-amber-400" />
              {t.partner.oneClickPublishBadge}
            </span>
          </div>
        </div>
      </div>

      {/* Published Success Alert */}
      {publishedSuccess && lastPublishedPartner && (
        <div className=" bg-emerald-950 border-2 border-emerald-500/80 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-50">
                &ldquo;{lastPublishedPartner.name}&rdquo; {t.partner.publishedSuccessTitle}
              </h3>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                {t.partner.publishedSuccessDesc} ({partners.length} {t.nav.partnersActive})
              </p>
              <p className="text-xs text-stone-300 mt-1">{t.verify.publishedPending}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onNavigateToTraveler && (
              <button
                onClick={onNavigateToTraveler}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-(--action-hover) text-white font-bold text-xs flex items-center gap-2 shadow-lg cursor-pointer transition-all"
              >
                <span>{t.partner.btnViewInTraveler}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Local Business Owner Input */}
        <div className="lg:col-span-5 bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
          <div className="border-b border-stone-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-stone-50 flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-400" />
                {t.partner.formTitle}
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                {t.partner.formDesc}
              </p>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => loadPresetExample('salt')}
                className="text-xs px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-emerald-400 border border-stone-700 transition-colors cursor-pointer"
                title="Load sample Salt Atelier facts"
              >
                {t.partner.sampleSalt}
              </button>
              <button
                type="button"
                onClick={() => loadPresetExample('vanilla')}
                className="text-xs px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-indigo-300 border border-stone-700 transition-colors cursor-pointer"
                title="Load sample Vanilla Haven facts"
              >
                {t.partner.sampleStay}
              </button>
              <button
                type="button"
                onClick={() => loadPresetExample('herbal')}
                className="text-xs px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 transition-colors cursor-pointer"
                title="Load sample Ancestral Oven facts"
              >
                {t.partner.sampleCulinary}
              </button>
            </div>
          </div>

          {/* Business Name */}
          <div className="space-y-1.5">
            <label htmlFor="pp-field-1" className="text-xs font-bold text-stone-300">
              {t.partner.labelBusinessName}
            </label>
            <input id="pp-field-1"
              type="text"
              value={businessName}
              onChange={(e) => {
                setBusinessName(e.target.value);
                setFormError(null);
              }}
              placeholder={t.partner.placeholderBusinessName}
              className="w-full bg-stone-800 border border-stone-700 text-stone-100 placeholder-stone-500 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category & Price Tier */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="pp-field-2" className="text-xs font-bold text-stone-300">
                {t.partner.labelCategory}
              </label>
              <select id="pp-field-2"
                value={category}
                onChange={(e) => setCategory(e.target.value as PartnerCategory)}
                className="w-full bg-stone-800 border border-stone-700 text-stone-100 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Destination">{t.partner.categoryDest}</option>
                <option value="Accommodation">{t.partner.categoryAccom}</option>
                <option value="Culinary">{t.partner.categoryCul}</option>
                <option value="Activity">{t.partner.categoryAct}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pp-field-3" className="text-xs font-bold text-stone-300">
                {t.partner.labelPriceTier}
              </label>
              <select id="pp-field-3"
                value={priceTier}
                onChange={(e) => setPriceTier(e.target.value as '$' | '$$' | '$$$' | '$$$$')}
                className="w-full bg-stone-800 border border-stone-700 text-stone-100 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="$">{t.partner.priceTierAccessible}</option>
                <option value="$$">{t.partner.priceTierModerate}</option>
                <option value="$$$">{t.partner.priceTierPremium}</option>
                <option value="$$$$">{t.partner.priceTierExclusive}</option>
              </select>
            </div>
          </div>

          {/* Location & WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="pp-field-4" className="text-xs font-bold text-stone-300">
                {t.partner.labelLocation}
              </label>
              <input id="pp-field-4"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t.partner.placeholderLocation}
                className="w-full bg-stone-800 border border-stone-700 text-stone-100 placeholder-stone-500 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pp-field-5" className="text-xs font-bold text-stone-300">
                {t.partner.labelWhatsapp}
              </label>
              <input id="pp-field-5"
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+6281234567890"
                className="w-full bg-stone-800 border border-stone-700 text-stone-100 placeholder-stone-500 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Raw Verified Facts Input List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>{t.partner.labelRawFacts}</span>
              </label>
              <button
                type="button"
                onClick={handleAddFactField}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.partner.btnAddFact}</span>
              </button>
            </div>
            <p className="text-xs text-stone-400">
              {t.partner.rawFactsDesc}
            </p>

            <div className="space-y-2">
              {rawFacts.map((fact, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 w-4 text-right">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    value={fact}
                    aria-label={`${t.partner.labelRawFacts} ${index + 1}`}
                    onChange={(e) => handleUpdateFact(index, e.target.value)}
                    placeholder={t.partner.placeholderFact}
                    className="flex-1 bg-stone-800 border border-stone-700 text-stone-100 placeholder-stone-500 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {rawFacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFact(index)}
                      className="p-1.5 text-stone-500 hover:text-red-400 transition-colors cursor-pointer"
                      title="Remove fact"
                      aria-label="Remove fact"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Inline validation message */}
          {formError && (
            <p className="text-xs text-red-300 bg-red-950/40 border border-red-800/50 rounded-xl px-3 py-2 stream-in" role="alert">
              {formError}
            </p>
          )}

          {/* Action Button */}
          <button
            onClick={handleGenerateAssistant}
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-(--action-hover) text-white shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99] disabled:opacity-60 disabled:cursor-wait"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{t.partner.btnRunningAssistant}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>{t.partner.btnRunAssistant}</span>
              </>
            )}
          </button>
        </div>

        {/* Right Output Studio — rendered live while the kit streams in */}
        <div ref={resultRef} className="lg:col-span-7 space-y-6">
          {stream.state.phase === 'error' && stream.state.error && (
            <StreamErrorBanner
              title={t.stream.errorTitle}
              message={stream.state.error}
              retryLabel={t.stream.retry}
              dismissLabel={t.stream.dismiss}
              onRetry={handleGenerateAssistant}
              onDismiss={stream.dismissError}
            />
          )}

          {view ? (
            <div className="space-y-6">
              {/* Top bar: live progress while writing, Publish once complete */}
              <div
                className={`border rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-900 ${
                  isLoading ? 'thinking-glow' : 'border-emerald-700/60'
                }`}
              >
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/60 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                    {isLoading ? <Sparkles className="w-5 h-5 animate-pulse" /> : 'AI'}
                  </div>
                  <div className="min-w-0 flex-1">
                    {isLoading ? (
                      <>
                        <span key={partnerStatus} className="text-xs font-bold text-stone-50 block stream-in" role="status" aria-live="polite">
                          {partnerStatus}
                        </span>
                        {/* 4-step progress */}
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {partnerSteps.map((label, i) => (
                            <div key={label} className="flex items-center gap-1.5">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full border transition-colors duration-500 ${
                                  i < activeSection
                                    ? 'bg-emerald-600 border-emerald-500 text-white'
                                    : i === activeSection
                                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                                      : 'bg-stone-900 border-stone-700 text-stone-500'
                                }`}
                              >
                                {i < activeSection && <Check className="w-2.5 h-2.5 inline mr-0.5 -mt-0.5" />}
                                {label}
                              </span>
                              {i < partnerSteps.length - 1 && <span className="w-2 h-px bg-stone-700" />}
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-stone-50">{t.partner.kitReady}</span>
                          <AiSourceBadge meta={resultMeta} liveLabel={t.stream.liveAi} offlineLabel={t.stream.offlineDemo} />
                        </div>
                        <p className="text-xs text-stone-400">{t.partner.kitSubtitle}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Publish to Ecosystem Button */}
                <button
                  onClick={() => void handlePublishToEcosystem()}
                  disabled={isLoading || publishing}
                  title={isLoading ? t.stream.publishLocked : undefined}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-(--action-hover) text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer whitespace-nowrap active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-(--action-hover)"
                >
                  <Globe className="w-4 h-4" />
                  <span>{t.partner.btnPublish}</span>
                </button>
              </div>
              {publishError && (
                <p role="alert" className="text-sm text-red-400 font-semibold -mt-2">
                  {t.verify.publishFailed}: {publishError}
                </p>
              )}

              {/* 1. Polished Partner Profile & Experience Description */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl space-y-4 stream-in">
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-stone-50">{t.partner.section1Title}</h4>
                      <p className="text-xs text-stone-400">{t.partner.section1Desc}</p>
                    </div>
                  </div>
                  {!isLoading && (
                    <button
                      onClick={() => handleCopy(`${view.headline}\n\n${view.polishedDescription}`, 'profile')}
                      className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-stone-50 transition-colors cursor-pointer text-xs flex items-center gap-1"
                    >
                      {copiedKey === 'profile' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedKey === 'profile' ? t.partner.copiedBtn : t.partner.copyProfileBtn}</span>
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {view.headline ? (
                    <h3 className="text-base font-extrabold text-emerald-300">
                      &ldquo;<StreamText text={view.headline} active={isActive('headline')} />&rdquo;
                    </h3>
                  ) : (
                    <Skeleton className="h-5 w-2/3" />
                  )}
                  {view.polishedDescription ? (
                    <p className="text-xs text-stone-200 whitespace-pre-line leading-relaxed">
                      <StreamText text={view.polishedDescription} active={isActive('polishedDescription')} />
                    </p>
                  ) : (
                    isLoading && <Skeleton className="h-2.5 w-full" lines={4} />
                  )}

                  {/* Family Tags (written last by the model) */}
                  {view.suggestedFamilyTags && view.suggestedFamilyTags.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {view.suggestedFamilyTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-stone-800 text-stone-300 px-2 py-0.5 rounded-md border border-stone-700 stream-in"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Ready-to-Use Social Media Promotional Copy */}
              {(view.socialMediaCopy || isLoading) && (
                <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl space-y-4 stream-in">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-amber-950 border border-amber-800 text-amber-400 flex items-center justify-center text-xs font-bold">
                        2
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-stone-50">{t.partner.section2Title}</h4>
                        <p className="text-xs text-stone-400">{t.partner.section2Desc}</p>
                      </div>
                    </div>
                    {!isLoading && (
                      <button
                        onClick={() =>
                          handleCopy(
                            `${view.socialMediaCopy?.hook}\n\n${view.socialMediaCopy?.caption}\n\n${view.socialMediaCopy?.hashtags?.join(' ')}`,
                            'social'
                          )
                        }
                        className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-stone-50 transition-colors cursor-pointer text-xs flex items-center gap-1"
                      >
                        {copiedKey === 'social' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedKey === 'social' ? t.partner.copiedBtn : t.partner.copyPostBtn}</span>
                      </button>
                    )}
                  </div>

                  <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-2.5">
                    {view.socialMediaCopy?.hook ? (
                      <div className="text-xs font-bold text-amber-300">
                        <StreamText text={view.socialMediaCopy.hook} active={isActive('socialMediaCopy.hook')} />
                      </div>
                    ) : (
                      <Skeleton className="h-3 w-3/4" />
                    )}
                    {view.socialMediaCopy?.caption ? (
                      <p className="text-xs text-stone-200 whitespace-pre-line leading-relaxed">
                        <StreamText text={view.socialMediaCopy.caption} active={isActive('socialMediaCopy.caption')} />
                      </p>
                    ) : (
                      isLoading && <Skeleton className="h-2.5 w-full" lines={3} />
                    )}
                    {view.socialMediaCopy?.hashtags && view.socialMediaCopy.hashtags.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {view.socialMediaCopy.hashtags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-900 px-2 py-0.5 rounded stream-in"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 3. Gamified Family Mission Idea */}
              {(view.gamifiedMission || isLoading) && (
                <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl space-y-4 stream-in">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-3 gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center text-xs font-bold">
                        3
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-stone-50">{t.partner.section3Title}</h4>
                        <p className="text-xs text-stone-400">{t.partner.section3Desc}</p>
                      </div>
                    </div>
                    {view.gamifiedMission?.badgeTitle && (
                      <div className="flex items-center gap-1 text-xs text-amber-400 font-bold bg-amber-950/60 border border-amber-800/60 px-2.5 py-1 rounded-full stream-in">
                        <Award className="w-3.5 h-3.5" />
                        <span>
                          Badge:{' '}
                          <StreamText text={view.gamifiedMission.badgeTitle} active={isActive('gamifiedMission.badgeTitle')} />
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-amber-950/20 border border-amber-800/40 rounded-xl space-y-2">
                    {view.gamifiedMission?.missionTitle ? (
                      <div className="text-xs font-bold text-amber-200">
                        <StreamText text={view.gamifiedMission.missionTitle} active={isActive('gamifiedMission.missionTitle')} />
                      </div>
                    ) : (
                      <Skeleton className="h-3 w-1/2" />
                    )}
                    {view.gamifiedMission?.missionDescription ? (
                      <p className="text-xs text-stone-200 leading-relaxed">
                        <StreamText
                          text={view.gamifiedMission.missionDescription}
                          active={isActive('gamifiedMission.missionDescription')}
                        />
                      </p>
                    ) : (
                      isLoading && <Skeleton className="h-2.5 w-full" lines={2} />
                    )}
                  </div>
                </div>
              )}

              {/* 4. Grounding Verification Checklist (Audit) */}
              {(view.groundingChecklist || isLoading) && (
                <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl space-y-4 stream-in">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center text-xs font-bold">
                        4
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-stone-50 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          {t.partner.section4Title}
                        </h4>
                        <p className="text-xs text-stone-400">{t.partner.section4Desc}</p>
                      </div>
                    </div>
                    {!isLoading && (
                      <span className="text-xs text-emerald-300 font-bold bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-800 stream-in">
                        {t.partner.groundedStatus}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {(view.groundingChecklist ?? []).map((item, idx) => (
                      <div key={idx} className="p-3 bg-stone-950/80 border border-stone-800 rounded-xl space-y-1 text-xs stream-in">
                        <div className="flex items-center gap-2 text-stone-200 font-medium">
                          <CheckCircle2
                            className={`w-4 h-4 shrink-0 transition-colors ${item.howItWasUsed ? 'text-emerald-400' : 'text-stone-600'}`}
                          />
                          <span className="text-stone-300">
                            <strong>{language === 'id' ? 'Fakta Mentah:' : 'Raw Fact:'}</strong> &ldquo;
                            <StreamText text={item.rawFact} active={isActive(`groundingChecklist.${idx}.rawFact`)} />
                            &rdquo;
                          </span>
                        </div>
                        {item.howItWasUsed && (
                          <div className="pl-6 text-xs text-emerald-400/90">
                            ↳ <strong>{language === 'id' ? 'Audit Verifikasi:' : 'Grounding Trace:'}</strong>{' '}
                            <StreamText text={item.howItWasUsed} active={isActive(`groundingChecklist.${idx}.howItWasUsed`)} />
                          </div>
                        )}
                      </div>
                    ))}
                    {isLoading && !view.groundingChecklist?.length && <Skeleton className="h-10 w-full rounded-xl" lines={2} />}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[460px] bg-stone-900 border border-dashed border-stone-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shadow-inner">
                <Store className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-lg font-bold text-stone-50">{t.partner.emptyTitle}</h3>
                <p className="text-xs text-stone-400">{t.partner.emptyDesc}</p>
                <p className="text-xs text-stone-500">{t.partner.emptySubdesc}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
