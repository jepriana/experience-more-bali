'use client';

import React, { useMemo, useState } from 'react';
import { VerificationBadge } from '@/components/verification/VerificationBadge';
import Link from 'next/link';
import { ArrowRight, Camera, Check, Copy, Download, MapPinned, Percent, ShieldCheck, TriangleAlert } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useHydrated } from '@/lib/accounts';
import { decodeMemory, indexesToPartners, memoryUrl, type Memory } from '@/lib/memoryLink';
import { downloadPrintSheet } from '@/lib/printFiles';
import { toStop, type Stop } from '@/lib/tripPlanning';
import type { StickerContent } from '@/lib/sticker';
import { fill } from '@/i18n/stage3';
import { getBaliRegion, type BaliRegionId } from '@/data/regions';
import { StickerCanvas } from '@/components/onboarding/StickerCanvas';
import { BaliMap } from '@/components/trip/BaliMap';
import { DAY_COLORS } from '@/components/trip/useTrip';
import { QrImage } from '@/components/memory/QrImage';

/** /m/<code> — what opens when someone scans a memory QR (T-shirt, hat, bag, counter card). */
export function MemoryView({ code }: { code: string }) {
  const { t } = useLanguage();
  const mp = t.memoryPage;
  const memory = useMemo(() => decodeMemory(code), [code]);

  if (!memory) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
        <TriangleAlert className="w-10 h-10 text-amber-400 mx-auto" />
        <h1 className="text-2xl font-extrabold text-stone-50">{mp.invalidTitle}</h1>
        <p className="text-sm text-stone-400">{mp.invalidDesc}</p>
        <Link href="/" className="inline-flex px-5 py-3 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-(--action-hover) text-white">
          {mp.goHome}
        </Link>
      </div>
    );
  }

  const sticker: StickerContent = {
    kind: memory.k === 't' ? 'traveler' : 'partner',
    title: memory.n,
    region: memory.r,
    tagline: memory.k === 't' ? t.sticker.poweredBy : t.sticker.strategicPartnerOf
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-5 flex justify-center sticker-pop">
          <StickerCanvas content={sticker} size={360} />
        </div>
        <div className="md:col-span-7 space-y-4 stream-in">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            {memory.k === 't' ? mp.travelerTag : mp.partnerTag}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-50 tracking-tight">
            {memory.k === 't' && memory.ti ? memory.ti : memory.n}
          </h1>
          <p className="text-stone-300 flex items-center gap-2">
            <MapPinned className="w-4 h-4 text-emerald-400" />
            {memory.k === 't' && memory.ti ? `${memory.n} · ${memory.r}` : memory.r}
          </p>
          {memory.k === 'p' && <PartnerDetails memory={memory} />}
          <Link
            href="/traveler"
            className="inline-flex px-5 py-3 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-(--action-hover) text-white shadow-lg items-center gap-2"
          >
            {memory.k === 't' ? mp.ctaTraveler : mp.ctaPartner}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {memory.k === 't' && <TripDays days={memory.d} />}

      {memory.k === 't' && (
        <div className="border border-dashed border-stone-700 rounded-2xl p-6 text-center text-sm text-stone-400 flex items-center justify-center gap-2">
          <Camera className="w-4 h-4" />
          {mp.photosSoon}
        </div>
      )}

      <ShareCard memory={memory} sticker={sticker} />
    </div>
  );
}

function PartnerDetails({ memory }: { memory: Extract<Memory, { k: 'p' }> }) {
  const { t } = useLanguage();
  return (
    <div className="space-y-3">
      {memory.pi && <VerificationBadge partnerId={memory.pi} />}
      {!!memory.dc && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-black text-sm font-extrabold">
          <Percent className="w-4 h-4" />
          {fill(t.memoryPage.discount, memory.dc)}
        </span>
      )}
      {!!memory.pr?.length && (
        <div>
          <div className="text-xs text-stone-500 font-bold mb-2">{t.memoryPage.offers}</div>
          <div className="flex flex-wrap gap-2">
            {memory.pr.map((x) => (
              <span key={x} className="px-3 py-1 rounded-full bg-stone-900 border border-stone-700 text-xs text-stone-200">
                {x}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TripDays({ days }: { days: number[][] }) {
  const { t } = useLanguage();
  const byDay = useMemo(() => indexesToPartners(days), [days]);
  const { stops, assignment, regions } = useMemo(() => {
    const stops: Stop[] = [];
    const assignment: Record<string, number> = {};
    byDay.forEach((partners, d) =>
      partners.forEach((p) => {
        const s = toStop(p);
        if (s && assignment[s.id] === undefined) {
          stops.push(s);
          assignment[s.id] = d;
        }
      })
    );
    return { stops, assignment, regions: [...new Set(stops.map((s) => s.regionId))] as BaliRegionId[] };
  }, [byDay]);

  if (!stops.length) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      <div className="lg:col-span-5 space-y-3">
        {byDay.map((partners, d) =>
          partners.length ? (
            <div key={d} className="bg-stone-900 border border-stone-800 rounded-2xl p-4 stream-in" style={{ borderLeft: `4px solid ${DAY_COLORS[d % DAY_COLORS.length]}` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-stone-50">{fill(t.memoryPage.day, d + 1)}</span>
                <span className="text-xs text-stone-500">{fill(t.memoryPage.places, partners.length)}</span>
              </div>
              <ul className="space-y-1.5">
                {partners.map((p) => (
                  <li key={p.id} className="text-sm text-stone-200 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: DAY_COLORS[d % DAY_COLORS.length] }} />
                    <span className="truncate">{p.name}</span>
                    <VerificationBadge partnerId={p.id} compact />
                    {p.regionId && <span className="text-xs text-stone-500 shrink-0">· {getBaliRegion(p.regionId)?.name}</span>}
                  </li>
                ))}
              </ul>
            </div>
          ) : null
        )}
      </div>
      <div className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-2xl p-3">
        <BaliMap selectedRegions={regions} stops={stops} assignment={assignment} days={byDay.length} />
      </div>
    </div>
  );
}

function ShareCard({ memory, sticker }: { memory: Memory; sticker: StickerContent }) {
  const { t } = useLanguage();
  const hydrated = useHydrated();
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!hydrated) return null; // the link needs the browser's address
  const url = memoryUrl(memory);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const download = async () => {
    setBusy(true);
    try {
      await downloadPrintSheet(sticker, { heading: memory.n, lines: [memory.r], colourHex: '#ffffff' }, url);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5">
      <QrImage value={url} className="w-36 h-36 shrink-0 p-1" label={t.memoryPage.scanThis} />
      <div className="w-full flex-1 min-w-0 space-y-3 text-center sm:text-left">
        <div className="font-bold text-stone-50">{t.memoryPage.scanThis}</div>
        <div className="text-xs text-stone-500 font-mono truncate">{url}</div>
        <div className="flex flex-col sm:flex-row gap-2 justify-center sm:justify-start">
          <button
            onClick={() => void copy()}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-100 flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? t.memoryPage.copied : t.memoryPage.copyLink}
          </button>
          <button
            onClick={() => void download()}
            disabled={busy}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-100 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {t.memoryPage.downloadPrint}
          </button>
        </div>
      </div>
    </div>
  );
}
