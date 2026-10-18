'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, BadgeCheck, Check, Copy, Download, MapPinned, Percent, ShieldCheck, Stamp, TriangleAlert } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { usePartners } from '@/context/PartnersContext';
import { readAccounts, useAccounts, useHydrated } from '@/lib/accounts';
import { apiFetch } from '@/lib/identity';
import { decodeMemory, indexesToPartners, isTripId, memoryUrl, tripUrl, type Memory } from '@/lib/memoryLink';
import { downloadPrintSheet } from '@/lib/printFiles';
import { toStop, type Stop } from '@/lib/tripPlanning';
import type { StickerContent } from '@/lib/sticker';
import type { PublicTrip } from '@/lib/ecosystemTypes';
import type { CuratedPartner } from '@/data/curatedPartners';
import { fill } from '@/i18n/stage3';
import { getBaliRegion, type BaliRegionId } from '@/data/regions';
import { StickerCanvas } from '@/components/onboarding/StickerCanvas';
import { BaliMap } from '@/components/trip/BaliMap';
import { DAY_COLORS } from '@/components/trip/useTrip';
import { QrImage } from '@/components/memory/QrImage';
import { VerificationBadge } from '@/components/verification/VerificationBadge';
import { NextSteps } from '@/components/nav/NextSteps';
import { currentPath, signupHref } from '@/lib/nextPath';
import { MediaGallery } from '@/components/memories/MediaGallery';

/**
 * /m/<code> — what opens when someone scans a memory QR (T-shirt, hat, bag, counter card).
 *   /m/t_…      a trip saved on the server: days, map, photos & videos
 *   /m/<long>   a memory packed into the link itself (older QRs, partner pages)
 *   ?ci=…       the partner counter card: travelers can check in for credentials
 */
export function MemoryView({ code }: { code: string }) {
  if (isTripId(code)) return <SavedTrip id={code} />;
  return <PackedMemory code={code} />;
}

function Invalid() {
  const { t } = useLanguage();
  const mp = t.memoryPage;
  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
      <TriangleAlert className="w-10 h-10 text-amber-400 mx-auto" aria-hidden="true" />
      <h1 className="text-2xl font-extrabold text-stone-50">{mp.invalidTitle}</h1>
      <p className="text-sm text-stone-400">{mp.invalidDesc}</p>
      <Link href="/" className="inline-flex px-5 py-3 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-(--action-hover) text-white">
        {mp.goHome}
      </Link>
      <div className="pt-6 text-left">
        <NextSteps items={['plan', 'memories']} />
      </div>
    </div>
  );
}

function Hero({ sticker, tag, title, subtitle, children }: { sticker: StickerContent; tag: string; title: string; subtitle: string; children?: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
      <div className="md:col-span-5 flex justify-center sticker-pop">
        <StickerCanvas content={sticker} size={360} />
      </div>
      <div className="md:col-span-7 space-y-4 stream-in">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
          {tag}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-50 tracking-tight">{title}</h1>
        <p className="text-stone-300 flex items-center gap-2">
          <MapPinned className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          {subtitle}
        </p>
        {children}
      </div>
    </div>
  );
}

// ───────── trip saved on the server ─────────

function SavedTrip({ id }: { id: string }) {
  const { t } = useLanguage();
  const mp = t.memoryPage;
  const { partners } = usePartners();
  const [trip, setTrip] = useState<PublicTrip | null | 'missing'>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/trips/${id}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && setTrip(d?.trip ?? 'missing'))
      .catch(() => alive && setTrip('missing'));
    return () => {
      alive = false;
    };
  }, [id]);

  if (trip === 'missing') return <Invalid />;
  if (!trip) return <div className="max-w-6xl mx-auto px-4 py-16 text-stone-400" aria-busy="true">{t.eco.memories.loading}</div>;

  const owner = readAccounts().traveler?.serverId === trip.ownerId;
  const byId = new Map(partners.map((p) => [p.id, p]));
  const byDay = trip.days.map((ids) => ids.map((pid) => byId.get(pid)).filter((p): p is CuratedPartner => !!p));
  const sticker: StickerContent = { kind: 'traveler', title: trip.name, region: trip.region, tagline: t.sticker.poweredBy };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Hero sticker={sticker} tag={mp.travelerTag} title={trip.title || trip.name} subtitle={trip.title ? `${trip.name} · ${trip.region}` : trip.region}>
        <Link
          href={owner ? '/memory' : '/traveler'}
          className="inline-flex px-5 py-3 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-(--action-hover) text-white items-center gap-2"
        >
          {owner ? t.eco.next.backToMemories : mp.ctaTraveler}
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </Hero>

      <TripDays byDay={byDay} />

      <section aria-labelledby="media-title" className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-3">
        <h2 id="media-title" className="text-lg font-bold text-stone-50">
          {t.eco.media.title}
        </h2>
        <MediaGallery tripId={trip.id} items={trip.media} owner={owner} onChange={(media) => setTrip({ ...trip, media })} />
        {owner && <p className="text-xs text-stone-500">{t.eco.memories.privacy}</p>}
      </section>

      {/* only the family shares its own trip page (from the phone; no print file) */}
      {owner && <ShareCard url={tripUrl(trip.id)} sticker={sticker} heading={trip.name} lines={[trip.region]} printable={false} />}
      <NextSteps items={owner ? ['connect', 'plan'] : ['plan', 'connect']} />
    </div>
  );
}

// ───────── memory packed into the link ─────────

function PackedMemory({ code }: { code: string }) {
  const { t } = useLanguage();
  const mp = t.memoryPage;
  const memory = useMemo(() => decodeMemory(code), [code]);
  const byDay = useMemo(() => (memory?.k === 't' ? indexesToPartners(memory.d) : []), [memory]);

  if (!memory) return <Invalid />;

  const sticker: StickerContent = {
    kind: memory.k === 't' ? 'traveler' : 'partner',
    title: memory.n,
    region: memory.r,
    tagline: memory.k === 't' ? t.sticker.poweredBy : t.sticker.strategicPartnerOf
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Hero
        sticker={sticker}
        tag={memory.k === 't' ? mp.travelerTag : mp.partnerTag}
        title={memory.k === 't' && memory.ti ? memory.ti : memory.n}
        subtitle={memory.k === 't' && memory.ti ? `${memory.n} · ${memory.r}` : memory.r}
      >
        {memory.k === 'p' && <PartnerDetails memory={memory} />}
        <Link
          href="/traveler"
          className="inline-flex px-5 py-3 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-(--action-hover) text-white items-center gap-2"
        >
          {memory.k === 't' ? mp.ctaTraveler : mp.ctaPartner}
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </Hero>

      {memory.k === 'p' && <CheckinPanel />}
      {memory.k === 't' && <TripDays byDay={byDay} />}

      <ShareCard url={memoryUrl(memory)} sticker={sticker} heading={memory.n} lines={[memory.r]} printable={memory.k === 'p'} />
      <NextSteps items={['plan', 'connect']} />
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
          <Percent className="w-4 h-4" aria-hidden="true" />
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

/** Shown on a partner page opened from the counter card (?ci=…): check in for credentials. */
function CheckinPanel() {
  const { t } = useLanguage();
  const c = t.eco.checkin;
  const params = useSearchParams();
  const code = params.get('ci');
  const hydrated = useHydrated();
  const { traveler } = useAccounts();
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'already' | 'invalid'>('idle');

  if (!code || !hydrated) return null;

  const checkIn = async () => {
    setState('busy');
    try {
      const res = await apiFetch('traveler', '/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json().catch(() => null);
      setState(!res.ok ? 'invalid' : data?.already ? 'already' : 'done');
    } catch {
      setState('invalid');
    }
  };

  return (
    <section aria-labelledby="checkin-title" className="bg-emerald-950/40 border border-emerald-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <Stamp className="w-8 h-8 text-emerald-400 shrink-0" aria-hidden="true" />
      <div className="flex-1 space-y-1">
        <h2 id="checkin-title" className="font-bold text-stone-50">
          {c.title}
        </h2>
        <p className="text-sm text-stone-300" role="status">
          {!traveler
            ? c.needAccount
            : state === 'done'
              ? c.done
              : state === 'already'
                ? c.already
                : state === 'invalid'
                  ? c.invalid
                  : c.desc}
        </p>
      </div>
      {!traveler ? (
        <Link href={signupHref('/traveler', currentPath())} className="px-5 py-3 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-(--action-hover) text-white text-center">
          {c.signUp}
        </Link>
      ) : state === 'done' || state === 'already' ? (
        <Link href="/memory" className="px-5 py-3 rounded-xl font-bold text-sm border border-emerald-600 text-emerald-300 text-center flex items-center gap-2 justify-center">
          <BadgeCheck className="w-4 h-4" aria-hidden="true" />
          {c.view}
        </Link>
      ) : (
        <button
          onClick={() => void checkIn()}
          disabled={state === 'busy'}
          className="px-5 py-3 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-(--action-hover) text-white cursor-pointer disabled:opacity-50"
        >
          {c.button}
        </button>
      )}
    </section>
  );
}

// ───────── shared pieces ─────────

function TripDays({ byDay }: { byDay: CuratedPartner[][] }) {
  const { t } = useLanguage();
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
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: DAY_COLORS[d % DAY_COLORS.length] }} aria-hidden="true" />
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

function ShareCard({ url, sticker, heading, lines, printable = true }: { url: string; sticker: StickerContent; heading: string; lines: string[]; printable?: boolean }) {
  const { t } = useLanguage();
  const hydrated = useHydrated();
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!hydrated) return null; // the link needs the browser's address

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
      await downloadPrintSheet(sticker, { heading, lines, colourHex: '#ffffff' }, url);
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
            {copied ? <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
            {copied ? t.memoryPage.copied : t.memoryPage.copyLink}
          </button>
          {printable && (
          <button
            onClick={() => void download()}
            disabled={busy}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-100 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            {t.memoryPage.downloadPrint}
          </button>
          )}
        </div>
      </div>
    </div>
  );
}
