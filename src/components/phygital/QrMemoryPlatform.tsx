'use client';

import React, { useState } from 'react';
import {
  QrCode,
  Sparkles,
  Smartphone,
  Award,
  Calendar,
  MapPin,
  CheckCircle2,
  Share2,
  Camera,
  Layers,
  Heart,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Clock,
  Compass,
  Check,
  X,
  Download,
  Copy,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

type MockupType = 'tshirt' | 'patch';

export function QrMemoryPlatform() {
  const { language, t } = useLanguage();
  const [activeMockup, setActiveMockup] = useState<MockupType>('tshirt');
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [mobileGlow, setMobileGlow] = useState(false);
  const [activeBadgeModal, setActiveBadgeModal] = useState<any | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [storyLikes, setStoryLikes] = useState<{ [key: string]: number }>({
    story1: 24,
    story2: 38,
    story3: 42
  });
  const [hasLiked, setHasLiked] = useState<{ [key: string]: boolean }>({});

  const handleScanClick = () => {
    setIsScanning(true);
    setScanMessage(
      language === 'id'
        ? 'Menghubungkan ke Server Media Kenangan...'
        : 'Connecting to Phygital Media Server...'
    );
    setTimeout(() => {
      setScanMessage(t.phygital.scannedStatus);
      setMobileGlow(true);
      setTimeout(() => {
        setIsScanning(false);
        setTimeout(() => setMobileGlow(false), 2000);
      }, 500);
    }, 700);
  };

  const toggleLike = (storyId: string) => {
    const currentlyLiked = hasLiked[storyId];
    setHasLiked({ ...hasLiked, [storyId]: !currentlyLiked });
    setStoryLikes({
      ...storyLikes,
      [storyId]: currentlyLiked ? storyLikes[storyId] - 1 : storyLikes[storyId] + 1
    });
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText('https://emb2027.org/m/dhrmwn');
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const isId = language === 'id';

  const completedTimeline = [
    {
      day: 1,
      time: '11:30 AM',
      date: 'Oct 12, 2026',
      partnerName: 'Dapur Parahyangan & Traditional Jamu Atelier',
      category: isId ? 'Kuliner' : 'Culinary',
      location: 'Nyuh Kuning, Ubud',
      missionTitle: isId
        ? 'Tumbuk kunyit segar & asam jawa di cobek batu untuk Jamu Kunyit Asam'
        : 'Pound fresh turmeric & tamarind in stone mortar for Jamu Kunyit Asam',
      verifier: isId
        ? 'Diverifikasi langsung oleh Ibu Made'
        : 'Verified on-site by Ibu Made',
      badgeEarned: isId ? 'Ahli Jamu Alkimia' : 'Master Jamu Alchemist',
      badgeIcon: '🍯',
      photo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80'
    },
    {
      day: 2,
      time: '02:15 PM',
      date: 'Oct 13, 2026',
      partnerName: 'Jatiluwih Subak Heritage Eco-Center',
      category: isId ? 'Destinasi' : 'Destination',
      location: 'Jatiluwih, Tabanan',
      missionTitle: isId
        ? 'Temukan bendungan batu Subak dan gambar sketsa pembagian air bambu 3 tingkat'
        : 'Locate stone Subak weir and sketch 3-tiered bamboo canal distribution',
      verifier: isId
        ? 'Diverifikasi langsung oleh Pekaseh Pak Wayan'
        : 'Verified on-site by Pekaseh Pak Wayan',
      badgeEarned: isId ? 'Penjaga Air Subak' : 'Subak Water Guardian',
      badgeIcon: '🌾',
      photo: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80'
    },
    {
      day: 3,
      time: '04:45 PM',
      date: 'Oct 14, 2026',
      partnerName: 'Sidemen Valley Bamboo Sanctuary & Organic Farm',
      category: isId ? 'Akomodasi' : 'Accommodation',
      location: 'Sidemen Valley, Karangasem',
      missionTitle: isId
        ? 'Petik serai segar, daun mint liar, dan bunga rosela untuk teh herbal keluarga'
        : 'Harvest wild lemongrass, mint, and roselle for chilled family herbal tea',
      verifier: isId
        ? 'Diverifikasi langsung oleh Tuan Rumah Pak Gede'
        : 'Verified on-site by Host Pak Gede',
      badgeEarned: isId ? 'Penjaga Kerajinan Bambu' : 'Bamboo Artisan Steward',
      badgeIcon: '🎋',
      photo: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80'
    }
  ];

  const unlockedBadges = [
    {
      id: 'subak',
      title: isId ? 'Penjaga Air Subak' : 'Subak Water Guardian',
      icon: '🌾',
      partner: 'Jatiluwih Subak Heritage Eco-Center',
      date: 'Oct 13, 2026',
      description: isId
        ? 'Dianugerahkan karena telah menelusuri saluran batu Subak UNESCO dan mempelajari pembagian air Tri Hita Karana secara adil bersama Pekaseh.'
        : 'Awarded for walking the UNESCO Subak stone canals and learning ancestral Tri Hita Karana equitable water sharing with Pekaseh water masters.'
    },
    {
      id: 'jamu',
      title: isId ? 'Ahli Jamu Alkimia' : 'Master Jamu Alchemist',
      icon: '🍯',
      partner: 'Dapur Parahyangan Jamu Atelier',
      date: 'Oct 12, 2026',
      description: isId
        ? 'Dianugerahkan karena telah menumbuk kunyit Bali mentah, asam jawa, dan madu hutan di cobek batu untuk meracik ramuan Usada alami.'
        : 'Awarded for pounding raw Balinese turmeric, tamarind, and forest honey in volcanic stone mortars to brew natural Usada healing elixirs.'
    },
    {
      id: 'bamboo',
      title: isId ? 'Penjaga Kerajinan Bambu' : 'Bamboo Artisan Steward',
      icon: '🎋',
      partner: 'Sidemen Valley Bamboo Sanctuary',
      date: 'Oct 14, 2026',
      description: isId
        ? 'Dianugerahkan karena telah memanen rempah organik di tepi Sungai Unda dan mempelajari arsitektur bambu petung tanpa kimia.'
        : 'Awarded for foraging organic herbs along the Unda River and learning petung bamboo zero-chemical architectural curing.'
    }
  ];

  const savedStories = [
    {
      id: 'story1',
      title: isId ? 'Rahasia Bendungan Subak 3 Tingkat' : 'The Secret of the 3-Tiered Subak Weir',
      partner: 'Jatiluwih Subak Eco-Center',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80',
      caption: isId
        ? 'Pak Wayan memperlihatkan kepada Maya dan Rama bagaimana air mengalir secara adil ke setiap petak terasering lewat gravitasi. Anak-anak kagum bahwa sistem ini berjalan tanpa listrik selama ribuan tahun!'
        : 'Pak Wayan showed Maya and Rama how water flows equally to every terrace through gravity stone weirs. The kids were amazed that no electricity or pumps have been needed for over a thousand years!',
      timestamp: isId ? 'Kemarin pukul 15:30' : 'Yesterday at 3:30 PM'
    },
    {
      id: 'story2',
      title: isId
        ? 'Jamu Kunyit Asam Pertama Kami di Cobek Batu'
        : 'Our First Mortar-Pounded Jamu Kunyit Asam',
      partner: 'Dapur Parahyangan Jamu Atelier',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
      caption: isId
        ? 'Tangan berwarna kuning keemasan karena kunyit segar! Ibu Made mengajari anak-anak bahwa obat di Bali tumbuh di pekarangan, bukan di apotek plastik. Sangat segar dan menyehatkan.'
        : 'Hands stained golden with fresh turmeric! Ibu Made taught the kids that medicine in Bali is grown in the garden, not bought in plastic blisters. Refreshing and delicious.',
      timestamp: isId ? '12 Okt pukul 13:15' : 'Oct 12 at 1:15 PM'
    },
    {
      id: 'story3',
      title: isId
        ? 'Senja di Tepi Sungai Unda & Gunung Agung'
        : 'Twilight Over the Unda River & Mt. Agung',
      partner: 'Sidemen Valley Bamboo Sanctuary',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80',
      caption: isId
        ? 'Tertidur lelap di paviliun bambu terbuka ditemani gemericik sungai. Air mata air murni, bebas plastik sekali pakai, dan 92% staf warga desa. Penginapan yang benar-benar bermakna.'
        : 'Falling asleep in open-air bamboo pavilions listening to the river. Pure mountain water, zero single-use plastics, and 92% local village staff. A stay that truly gives back.',
      timestamp: isId ? 'Hari ini pukul 07:00' : 'Today at 7:00 AM'
    }
  ];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-teal-950 via-stone-900 to-emerald-950 border border-emerald-800/40 p-8 sm:p-10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-700/60 text-emerald-300 text-xs font-semibold">
            <QrCode className="w-3.5 h-3.5" />
            <span>{t.phygital.heroTag}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {t.phygital.heroTitle}
          </h1>
          <p className="text-stone-300 text-base sm:text-lg leading-relaxed">
            {t.phygital.heroDesc}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <span className="bg-stone-900/80 border border-stone-800 px-3 py-1.5 rounded-lg text-emerald-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              {t.phygital.liveQrBadge}
            </span>
            <span className="bg-stone-900/80 border border-stone-800 px-3 py-1.5 rounded-lg text-stone-300 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              {t.phygital.simulatedMobileBadge}
            </span>
          </div>
        </div>
      </div>

      {/* Split-Screen Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================= LEFT SIDE: PHYSICAL MOCKUP ================= */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-2xl space-y-6">
            {/* Header & Mockup Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-400" />
                  {t.phygital.leftHeader}
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  {t.phygital.leftSub}
                </p>
              </div>

              {/* Mockup Tabs */}
              <div className="flex items-center bg-stone-950 p-1 rounded-xl border border-stone-800 self-start sm:self-auto">
                <button
                  onClick={() => setActiveMockup('tshirt')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeMockup === 'tshirt'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {t.phygital.tabTshirt}
                </button>
                <button
                  onClick={() => setActiveMockup('patch')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeMockup === 'patch'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {t.phygital.tabPatch}
                </button>
              </div>
            </div>

            {/* Visual Canvas of Mockup */}
            <div className="relative min-h-[440px] bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 rounded-2xl border border-stone-800 flex items-center justify-center p-6 overflow-hidden group">
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
                  backgroundSize: '16px 16px'
                }}
              />

              {/* T-SHIRT MOCKUP */}
              {activeMockup === 'tshirt' && (
                <div className="relative w-full max-w-sm flex flex-col items-center">
                  <div className="relative w-72 h-88 bg-gradient-to-b from-emerald-950 via-stone-900 to-emerald-950 rounded-t-[48px] rounded-b-3xl border-2 border-emerald-700/50 shadow-2xl p-6 flex flex-col items-center justify-between text-center overflow-hidden">
                    {/* Ribbed Collar */}
                    <div className="w-28 h-10 border-b-4 border-emerald-500/40 rounded-b-full -mt-7 bg-stone-950/70" />

                    {/* Chest Campaign Graphic */}
                    <div className="space-y-1.5 mt-2">
                      <div className="text-[10px] tracking-widest uppercase font-bold text-emerald-400">
                        {t.phygital.tshirtTitle}
                      </div>
                      <div className="text-base font-extrabold text-white tracking-wider font-mono">
                        {t.phygital.tshirtTag}
                      </div>
                      <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 font-extrabold text-xs border border-emerald-600/40">
                        {t.phygital.tshirtQuest}
                      </div>
                      <p className="text-[10px] text-stone-400 italic">
                        {t.phygital.tshirtSlogan}
                      </p>
                    </div>

                    {/* Stitched QR Code Patch (Clickable) */}
                    <div
                      onClick={handleScanClick}
                      className="cursor-pointer group/patch relative my-3 p-3 bg-stone-950 rounded-xl border-2 border-dashed border-emerald-400/80 shadow-lg hover:border-emerald-300 hover:scale-105 transition-all"
                      title="Click to scan QR code!"
                    >
                      {/* Corner Stitching Marks */}
                      <span className="absolute -top-1.5 -left-1.5 text-[10px] text-amber-400 font-mono">
                        ✖
                      </span>
                      <span className="absolute -top-1.5 -right-1.5 text-[10px] text-amber-400 font-mono">
                        ✖
                      </span>
                      <span className="absolute -bottom-1.5 -left-1.5 text-[10px] text-amber-400 font-mono">
                        ✖
                      </span>
                      <span className="absolute -bottom-1.5 -right-1.5 text-[10px] text-amber-400 font-mono">
                        ✖
                      </span>

                      {/* SVG QR Code */}
                      <div className="w-28 h-28 bg-white p-2 rounded-lg flex items-center justify-center relative">
                        <svg
                          viewBox="0 0 100 100"
                          className="w-full h-full fill-stone-900"
                          shapeRendering="crispEdges"
                        >
                          <rect x="6" y="6" width="26" height="26" fill="#064e3b" />
                          <rect x="10" y="10" width="18" height="18" fill="#ffffff" />
                          <rect x="14" y="14" width="10" height="10" fill="#064e3b" />

                          <rect x="68" y="6" width="26" height="26" fill="#064e3b" />
                          <rect x="72" y="10" width="18" height="18" fill="#ffffff" />
                          <rect x="76" y="14" width="10" height="10" fill="#064e3b" />

                          <rect x="6" y="68" width="26" height="26" fill="#064e3b" />
                          <rect x="10" y="72" width="18" height="18" fill="#ffffff" />
                          <rect x="14" y="76" width="10" height="10" fill="#064e3b" />

                          <rect x="38" y="8" width="6" height="6" />
                          <rect x="48" y="8" width="6" height="6" />
                          <rect x="58" y="8" width="6" height="6" />
                          <rect x="38" y="18" width="6" height="14" />
                          <rect x="48" y="24" width="16" height="6" />

                          <rect x="8" y="38" width="6" height="6" />
                          <rect x="8" y="50" width="6" height="12" />
                          <rect x="20" y="38" width="12" height="6" />
                          <rect x="24" y="50" width="6" height="12" />

                          <rect x="72" y="38" width="20" height="6" />
                          <rect x="86" y="48" width="6" height="14" />
                          <rect x="72" y="56" width="6" height="6" />

                          <rect x="38" y="38" width="14" height="14" fill="#059669" />
                          <rect x="56" y="38" width="6" height="6" />
                          <rect x="56" y="50" width="12" height="6" />
                          <rect x="44" y="56" width="6" height="12" />

                          <rect x="38" y="72" width="18" height="6" />
                          <rect x="44" y="86" width="6" height="6" />
                          <rect x="56" y="80" width="12" height="12" />

                          <rect x="72" y="72" width="6" height="20" />
                          <rect x="86" y="72" width="6" height="6" />
                          <rect x="86" y="86" width="6" height="6" />
                        </svg>

                        {isScanning && (
                          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-bounce top-1/2" />
                        )}
                      </div>

                      <div className="mt-1 text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                        {t.phygital.tapToScan}
                      </div>
                    </div>

                    <div className="text-[10px] text-stone-400 font-mono">
                      Family Phygital Tag: EMB-2027-DHRMWN
                    </div>
                  </div>
                </div>
              )}

              {/* PASSPORT PATCH MOCKUP */}
              {activeMockup === 'patch' && (
                <div className="relative w-full max-w-sm flex flex-col items-center">
                  <div className="relative w-72 h-80 bg-gradient-to-br from-amber-950 via-stone-900 to-stone-950 rounded-2xl border-4 border-amber-600/70 shadow-2xl p-6 flex flex-col items-center justify-between text-center overflow-hidden">
                    <div className="absolute top-2 left-2 w-3 h-3 rounded-full border border-amber-400 bg-stone-950" />
                    <div className="absolute top-2 right-2 w-3 h-3 rounded-full border border-amber-400 bg-stone-950" />
                    <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full border border-amber-400 bg-stone-950" />
                    <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full border border-amber-400 bg-stone-950" />

                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                        {t.phygital.patchTitle}
                      </div>
                      <h3 className="text-base font-extrabold text-white tracking-wider">
                        {t.phygital.patchTag}
                      </h3>
                      <div className="text-[10px] text-stone-400">
                        {t.phygital.patchSub}
                      </div>
                    </div>

                    {/* Stitched QR Code Patch */}
                    <div
                      onClick={handleScanClick}
                      className="cursor-pointer group/patch relative my-2 p-3 bg-stone-950 rounded-xl border-2 border-dashed border-amber-400 shadow-lg hover:scale-105 transition-all"
                      title="Click to scan QR code!"
                    >
                      <div className="w-28 h-28 bg-white p-2 rounded-lg flex items-center justify-center relative">
                        <svg
                          viewBox="0 0 100 100"
                          className="w-full h-full fill-stone-900"
                          shapeRendering="crispEdges"
                        >
                          <rect x="6" y="6" width="26" height="26" fill="#78350f" />
                          <rect x="10" y="10" width="18" height="18" fill="#ffffff" />
                          <rect x="14" y="14" width="10" height="10" fill="#78350f" />

                          <rect x="68" y="6" width="26" height="26" fill="#78350f" />
                          <rect x="72" y="10" width="18" height="18" fill="#ffffff" />
                          <rect x="76" y="14" width="10" height="10" fill="#78350f" />

                          <rect x="6" y="68" width="26" height="26" fill="#78350f" />
                          <rect x="10" y="72" width="18" height="18" fill="#ffffff" />
                          <rect x="14" y="76" width="10" height="10" fill="#78350f" />

                          <rect x="38" y="8" width="6" height="6" />
                          <rect x="48" y="8" width="6" height="6" />
                          <rect x="58" y="8" width="6" height="6" />
                          <rect x="38" y="18" width="6" height="14" />
                          <rect x="48" y="24" width="16" height="6" />

                          <rect x="8" y="38" width="6" height="6" />
                          <rect x="8" y="50" width="6" height="12" />
                          <rect x="20" y="38" width="12" height="6" />
                          <rect x="24" y="50" width="6" height="12" />

                          <rect x="72" y="38" width="20" height="6" />
                          <rect x="86" y="48" width="6" height="14" />
                          <rect x="72" y="56" width="6" height="6" />

                          <rect x="38" y="38" width="14" height="14" fill="#d97706" />
                          <rect x="56" y="38" width="6" height="6" />
                          <rect x="56" y="50" width="12" height="6" />
                          <rect x="44" y="56" width="6" height="12" />

                          <rect x="38" y="72" width="18" height="6" />
                          <rect x="44" y="86" width="6" height="6" />
                          <rect x="56" y="80" width="12" height="12" />

                          <rect x="72" y="72" width="6" height="20" />
                          <rect x="86" y="72" width="6" height="6" />
                          <rect x="86" y="86" width="6" height="6" />
                        </svg>

                        {isScanning && (
                          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_#f59e0b] animate-bounce top-1/2" />
                        )}
                      </div>

                      <div className="mt-1 text-[9px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                        {t.phygital.tapToScan}
                      </div>
                    </div>

                    <div className="text-[10px] text-stone-400 font-mono">
                      Stitched Bamboo Edition • No. 0428
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Scan Action Button */}
            <div className="space-y-3">
              <button
                onClick={handleScanClick}
                disabled={isScanning}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-stone-950 shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>
                  {isScanning ? t.phygital.btnScanning : t.phygital.btnScanSim}
                </span>
              </button>

              {scanMessage && (
                <div className="p-3 bg-emerald-950/50 border border-emerald-700/60 rounded-xl text-center text-xs text-emerald-300 font-medium flex items-center justify-center gap-2 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{scanMessage}</span>
                </div>
              )}
            </div>

            {/* Physical-Digital Concept Features */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-stone-950/80 border border-stone-800 rounded-xl space-y-1">
                <span className="font-bold text-emerald-400 block">{t.phygital.preTripTitle}</span>
                <p className="text-[11px] text-stone-400">
                  {t.phygital.preTripDesc}
                </p>
              </div>

              <div className="p-3 bg-stone-950/80 border border-stone-800 rounded-xl space-y-1">
                <span className="font-bold text-amber-400 block">{t.phygital.postTripTitle}</span>
                <p className="text-[11px] text-stone-400">
                  {t.phygital.postTripDesc}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDE: MOBILE DIGITAL MEMORY PAGE ================= */}
        <div className="lg:col-span-6 flex justify-center">
          {/* Realistic Mobile Frame Shell */}
          <div
            className={`relative w-full max-w-[380px] bg-stone-950 rounded-[48px] border-[6px] transition-all duration-500 shadow-2xl p-3.5 ${
              mobileGlow
                ? 'border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.35)] scale-[1.01]'
                : 'border-stone-800 shadow-stone-950'
            }`}
          >
            {/* Top Speaker & Dynamic Island */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-4 bg-stone-900 rounded-full flex items-center justify-center gap-2 z-30">
              <div className="w-2.5 h-2.5 rounded-full bg-stone-800" />
              <div className="w-2 h-2 rounded-full bg-stone-950" />
            </div>

            {/* Inner Phone Screen */}
            <div className="relative bg-stone-900 rounded-[38px] overflow-hidden text-stone-100 flex flex-col max-h-[760px] overflow-y-auto no-scrollbar border border-stone-800/80">
              {/* Phone Status Bar */}
              <div className="px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-semibold text-stone-400 select-none bg-stone-950/80 backdrop-blur z-20">
                <span>09:41</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px]">5G</span>
                  <div className="w-5 h-2.5 rounded-sm border border-stone-400 p-0.5 flex items-center">
                    <div className="w-full h-full bg-emerald-400 rounded-2" />
                  </div>
                </div>
              </div>

              {/* Browser Address Bar */}
              <div className="px-4 py-1.5 bg-stone-950 border-b border-stone-800 flex items-center gap-2 text-[10px] text-stone-400 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate flex-1 text-stone-300">
                  https://emb2027.org/m/dhrmwn
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold">
                  {t.phygital.verifiedBadge}
                </span>
              </div>

              {/* Digital Memory Page Body */}
              <div className="p-4 space-y-6">
                {/* 1. Family Profile Header */}
                <div className="relative rounded-2xl overflow-hidden border border-emerald-800/50 p-4 bg-gradient-to-br from-emerald-950 via-stone-900 to-stone-950 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-stone-950 font-black text-lg shadow-md">
                      DF
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-extrabold text-sm text-white">The Dharmawan Family</h3>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      </div>
                      <p className="text-[11px] text-emerald-300 font-medium">
                        4 Explorers: Ayu, Budi, Maya & Rama
                      </p>
                      <p className="text-[10px] text-stone-400">
                        Oct 12–14, 2026 • 3 Days Living Heritage Trail
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-emerald-900/60 flex items-center justify-between text-[11px]">
                    <span className="text-stone-300">{t.phygital.questsCompleted}</span>
                    <span className="font-bold text-emerald-400">3 of 3 (100%)</span>
                  </div>

                  {/* Share Memory Card Button */}
                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/60 cursor-pointer transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{t.phygital.btnShareCard}</span>
                  </button>
                </div>

                {/* 2. Unlocked Mission Badges */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>{t.phygital.badgesTitle}</span>
                    </h4>
                    <span className="text-[10px] text-stone-400">{t.phygital.tapToInspect}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {unlockedBadges.map((badge) => (
                      <div
                        key={badge.id}
                        onClick={() => setActiveBadgeModal(badge)}
                        className="p-2.5 bg-stone-950 rounded-xl border border-stone-800 hover:border-amber-500/60 transition-all cursor-pointer text-center space-y-1 group"
                      >
                        <div className="text-2xl group-hover:scale-110 transition-transform">
                          {badge.icon}
                        </div>
                        <div className="text-[10px] font-bold text-stone-100 leading-tight">
                          {badge.title}
                        </div>
                        <div className="text-[9px] text-emerald-400 font-mono">
                          {t.phygital.verifiedBadge}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Completed Adventure Itinerary */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-emerald-400" />
                    <span>{t.phygital.itineraryTitle}</span>
                  </h4>

                  <div className="space-y-2.5">
                    {completedTimeline.map((item) => (
                      <div
                        key={item.day}
                        className="p-3 bg-stone-950/90 rounded-xl border border-stone-800 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">
                              {item.day}
                            </span>
                            <span className="text-xs font-bold text-white truncate max-w-[170px]">
                              {item.partnerName}
                            </span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-semibold border border-emerald-800">
                            {item.category}
                          </span>
                        </div>

                        <div className="text-[11px] text-stone-300 space-y-1">
                          <p className="leading-snug">
                            <strong>{isId ? 'Misi:' : 'Quest:'}</strong> {item.missionTitle}
                          </p>
                          <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{item.verifier}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Saved Stories from Visited Partners */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-teal-400" />
                    <span>{t.phygital.storiesTitle}</span>
                  </h4>

                  <div className="space-y-3">
                    {savedStories.map((story) => (
                      <div
                        key={story.id}
                        className="rounded-xl overflow-hidden bg-stone-950 border border-stone-800 shadow-md space-y-2"
                      >
                        <div className="relative h-28 w-full overflow-hidden">
                          <img
                            src={story.image}
                            alt={story.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent" />
                          <div className="absolute bottom-2 left-2 right-2 text-xs font-bold text-white drop-shadow">
                            {story.title}
                          </div>
                        </div>

                        <div className="p-2.5 pt-0 space-y-2">
                          <p className="text-[11px] text-stone-300 leading-snug">{story.caption}</p>

                          <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 border-t border-stone-800">
                            <span>{story.partner}</span>
                            <button
                              onClick={() => toggleLike(story.id)}
                              className={`flex items-center gap-1 transition-colors cursor-pointer ${
                                hasLiked[story.id] ? 'text-red-400' : 'text-stone-400 hover:text-red-300'
                              }`}
                            >
                              <Heart
                                className={`w-3 h-3 ${hasLiked[story.id] ? 'fill-red-400' : ''}`}
                              />
                              <span>{storyLikes[story.id]}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Return Journey Re-Engagement */}
                <div className="p-3.5 bg-gradient-to-r from-emerald-950/40 to-stone-950 rounded-xl border border-emerald-800/40 text-center space-y-1.5">
                  <div className="text-xs font-bold text-emerald-300">
                    {t.phygital.returnTitle}
                  </div>
                  <p className="text-[10px] text-stone-400 leading-snug">
                    {t.phygital.returnDesc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL: SHARE MEMORY CARD ================= */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-white bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-emerald-400" />
                {t.phygital.modalShareTitle}
              </h3>
              <p className="text-xs text-stone-400">
                {t.phygital.modalShareDesc}
              </p>
            </div>

            {/* Visual Card Preview */}
            <div className="p-5 bg-gradient-to-br from-emerald-950 via-stone-950 to-stone-900 rounded-xl border-2 border-emerald-500/60 shadow-xl space-y-4 text-center">
              <div className="text-[10px] uppercase tracking-widest font-bold text-emerald-400">
                {t.phygital.shareCredentialTag}
              </div>

              <div className="space-y-1">
                <div className="text-lg font-extrabold text-white">The Dharmawan Family</div>
                <div className="text-xs text-emerald-300">
                  {t.phygital.completedSubtitle}
                </div>
              </div>

              {/* Badges Earned Display */}
              <div className="flex items-center justify-center gap-3 py-2">
                <div className="p-2 bg-stone-900/80 rounded-lg border border-stone-800 text-center">
                  <div className="text-xl">🌾</div>
                  <div className="text-[9px] font-bold text-stone-200">
                    {isId ? 'Penjaga Air' : 'Subak Guardian'}
                  </div>
                </div>
                <div className="p-2 bg-stone-900/80 rounded-lg border border-stone-800 text-center">
                  <div className="text-xl">🍯</div>
                  <div className="text-[9px] font-bold text-stone-200">
                    {isId ? 'Ahli Jamu' : 'Jamu Alchemist'}
                  </div>
                </div>
                <div className="p-2 bg-stone-900/80 rounded-lg border border-stone-800 text-center">
                  <div className="text-xl">🎋</div>
                  <div className="text-[9px] font-bold text-stone-200">
                    {isId ? 'Penjaga Bambu' : 'Bamboo Steward'}
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-stone-300 italic">
                {t.nav.brandTagline}
              </div>

              <div className="text-[10px] font-mono text-emerald-400 border-t border-emerald-900/60 pt-2">
                Verified Link: https://emb2027.org/m/dhrmwn
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleCopyShareLink}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {linkCopied ? (
                  <Check className="w-3.5 h-3.5 text-white" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{linkCopied ? t.phygital.linkCopied : t.phygital.btnCopyLink}</span>
              </button>

              <button
                onClick={() => {
                  alert(
                    isId
                      ? 'Grafik Kartu Kenangan siap diunduh (PNG)!'
                      : 'Memory Card Graphic ready for download (PNG)!'
                  );
                  setIsShareModalOpen(false);
                }}
                className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium text-xs flex items-center justify-center gap-1.5 border border-stone-700 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.phygital.btnSaveImage}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: BADGE CERTIFICATE ================= */}
      {activeBadgeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-center">
            <button
              onClick={() => setActiveBadgeModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-white bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-950/80 border-2 border-amber-500/80 flex items-center justify-center text-4xl shadow-lg">
              {activeBadgeModal.icon}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                {t.phygital.badgeModalVerified}
              </span>
              <h3 className="text-lg font-extrabold text-white">{activeBadgeModal.title}</h3>
              <p className="text-xs text-emerald-400 font-semibold">{activeBadgeModal.partner}</p>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed bg-stone-950 p-3 rounded-xl border border-stone-800">
              {activeBadgeModal.description}
            </p>

            <div className="text-[10px] text-stone-400 flex items-center justify-between border-t border-stone-800 pt-3">
              <span>{t.phygital.badgeModalDate}</span>
              <span className="font-mono text-stone-200">{activeBadgeModal.date}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
