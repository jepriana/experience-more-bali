'use client';

import React, { useEffect, useState } from 'react';
import { tabKeyNav } from '@/lib/a11y';
import { Check, Download, Mail, Minus, Plus, QrCode, Shirt, ShoppingBag, Info } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useSessionState } from '@/context/SessionStateContext';
import { stickerDataUrl, type StickerContent } from '@/lib/sticker';
import { downloadPrintSheet } from '@/lib/printFiles';
import { fill } from '@/i18n/stage3';
import { QrImage } from '@/components/memory/QrImage';

/**
 * Memory gear: the user's own sticker on a T-shirt, hat or drawstring bag, optionally with a
 * QR memory patch. They see a live mock-up, download the print file and send the order to the
 * digital-printing partner on WhatsApp or email — no checkout to build for the MVP.
 */

type Product = 'tshirt' | 'hat' | 'bag';
type Colour = 'white' | 'black' | 'navy' | 'olive' | 'sand';

const COLOURS: Record<Colour, string> = {
  white: '#f5f5f4',
  black: '#1c1917',
  navy: '#1e3a5f',
  olive: '#556b2f',
  sand: '#d6c7a1'
};
const SIZES: Record<Product, string[]> = {
  tshirt: ['Kids', 'S', 'M', 'L', 'XL', 'XXL'],
  hat: ['one'],
  bag: ['one']
};

/** Print partner contact — set in .env.local; without it WhatsApp asks who to send to. */
const PRINT_WHATSAPP = (process.env.NEXT_PUBLIC_PRINT_PARTNER_WHATSAPP ?? '').replace(/\D/g, '');
const PRINT_EMAIL = process.env.NEXT_PUBLIC_PRINT_PARTNER_EMAIL ?? '';

interface MerchState {
  product: Product;
  colour: Colour;
  qty: Record<string, number>;
  qrPatch: boolean;
}

export function MerchDesigner({
  sticker,
  qrUrl,
  storageKey,
  customer,
  title,
  subtitle,
  qrDesc = '',
  qrOption = true
}: {
  sticker: StickerContent;
  /** where the QR patch points; null = no patch possible yet (e.g. no trip planned) */
  qrUrl: string | null;
  storageKey: string;
  customer: { name: string; contact: string };
  title: string;
  subtitle: string;
  qrDesc?: string;
  /** false = no QR patch at all (travelers' family QR is never printed on gear) */
  qrOption?: boolean;
}) {
  const { t } = useLanguage();
  const m = t.merch;
  const [state, setState] = useSessionState<MerchState>(storageKey, {
    product: 'tshirt',
    colour: 'white',
    qty: { M: 1 },
    qrPatch: true
  });
  const [img, setImg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Mock-ups use a PNG of the real sticker, so the preview matches the print
  // (keyed by content: callers build a new sticker object on every render)
  const stickerKey = JSON.stringify(sticker);
  useEffect(() => {
    let alive = true;
    stickerDataUrl(JSON.parse(stickerKey) as StickerContent, 500).then((url) => alive && setImg(url));
    return () => {
      alive = false;
    };
  }, [stickerKey]);

  const sizes = SIZES[state.product];
  const qty = Object.fromEntries(sizes.map((s) => [s, state.qty[s] ?? 0]));
  const total = Object.values(qty).reduce((a, b) => a + b, 0);
  const withQr = qrOption && state.qrPatch && !!qrUrl;
  const sizeLabel = (s: string) => (s === 'one' ? m.oneSize : s);

  const set = (patch: Partial<MerchState>) => setState((s) => ({ ...s, ...patch }));
  const chooseProduct = (product: Product) =>
    set({ product, qty: product === 'tshirt' ? { M: Math.max(1, state.qty.M ?? 0) } : { one: Math.max(1, state.qty.one ?? 0) } });
  const changeQty = (size: string, delta: number) =>
    set({ qty: { ...qty, [size]: Math.max(0, Math.min(99, (qty[size] ?? 0) + delta)) } });

  const heading = `${m.products[state.product]} · ${m.colours[state.colour]}`;
  const qtyLines = sizes.filter((s) => qty[s] > 0).map((s) => `${sizeLabel(s)} × ${qty[s]}`);
  const orderLines = qrOption ? [...qtyLines, `${m.qrPatch}: ${withQr ? m.yes : m.no}`] : qtyLines;

  const message = [
    m.orderGreeting,
    `• ${heading}`,
    ...orderLines.map((l) => `• ${l}`),
    '',
    `${m.orderName}: ${customer.name}`,
    `${m.orderContact}: ${customer.contact}`,
    ...(qrOption && qrUrl ? [`${m.orderPrintFile}: ${qrUrl}`] : []),
    '',
    m.orderThanks
  ].join('\n');
  const waHref = `https://wa.me/${PRINT_WHATSAPP}?text=${encodeURIComponent(message)}`;
  const mailHref = `mailto:${PRINT_EMAIL}?subject=${encodeURIComponent(`KOSSI memory gear — ${customer.name}`)}&body=${encodeURIComponent(message)}`;

  const downloadPrint = async () => {
    setBusy(true);
    try {
      await downloadPrintSheet(sticker, { heading, lines: orderLines, colourHex: COLOURS[state.colour] }, withQr ? qrUrl! : undefined);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* Mock-up */}
      <div className="lg:col-span-6 bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4 lg:sticky lg:top-24">
        <div className="aspect-square w-full max-w-md mx-auto">
          <Mockup product={state.product} colour={COLOURS[state.colour]} img={img} qrUrl={withQr ? qrUrl : null} />
        </div>
        <div className="grid grid-cols-3 gap-2" role="tablist">
          {(['tshirt', 'hat', 'bag'] as Product[]).map((p) => {
            const on = state.product === p;
            const Icon = p === 'bag' ? ShoppingBag : p === 'hat' ? HatIcon : Shirt;
            return (
              <button
                key={p}
                role="tab"
                aria-selected={on}
                tabIndex={(on) ? 0 : -1}
                onKeyDown={tabKeyNav}
                onClick={() => chooseProduct(p)}
                className={`py-2.5 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  on ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200' : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {m.products[p]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Options */}
      <div className="lg:col-span-6 space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-50 tracking-tight">{title}</h2>
          <p className="text-sm text-stone-400 mt-1">{subtitle}</p>
        </div>

        <Panel label={m.colour}>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(COLOURS) as Colour[]).map((c) => {
              const on = state.colour === c;
              return (
                <button
                  key={c}
                  onClick={() => set({ colour: c })}
                  aria-pressed={on}
                  aria-label={m.colours[c]}
                  title={m.colours[c]}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                    on ? 'border-emerald-400 scale-110 shadow-lg' : 'border-stone-700 hover:border-stone-500'
                  }`}
                  style={{ background: COLOURS[c] }}
                >
                  {on && <Check className={`w-4 h-4 ${c === 'white' || c === 'sand' ? 'text-black' : 'text-white'}`} />}
                </button>
              );
            })}
            <span className="self-center text-sm text-stone-300 font-medium">{m.colours[state.colour]}</span>
          </div>
        </Panel>

        <Panel label={m.sizes}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {sizes.map((s) => (
              <div key={s} className="flex items-center justify-between bg-stone-950 border border-stone-800 rounded-xl px-2.5 py-1.5">
                <span className="text-sm font-semibold text-stone-200">{sizeLabel(s)}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => changeQty(s, -1)}
                    disabled={qty[s] === 0}
                    aria-label={`- ${sizeLabel(s)}`}
                    className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className={`w-6 text-center text-sm font-bold ${qty[s] ? 'text-stone-50' : 'text-stone-600'}`}>{qty[s]}</span>
                  <button
                    onClick={() => changeQty(s, 1)}
                    aria-label={`+ ${sizeLabel(s)}`}
                    className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {qrOption && (
        <button
          onClick={() => qrUrl && set({ qrPatch: !state.qrPatch })}
          disabled={!qrUrl}
          aria-pressed={withQr}
          className={`w-full text-left p-4 rounded-2xl border flex items-start gap-3 transition-all ${
            withQr ? 'bg-emerald-950/50 border-emerald-600' : 'bg-stone-900 border-stone-800 hover:border-stone-600'
          } ${qrUrl ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
        >
          <span
            className={`w-5 h-5 mt-0.5 shrink-0 rounded-md border flex items-center justify-center ${withQr ? 'bg-emerald-500 border-emerald-400' : 'border-stone-600'}`}
          >
            {withQr && <Check className="w-3.5 h-3.5 text-white" />}
          </span>
          <span className="flex-1">
            <span className="font-semibold text-stone-50 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-emerald-400" />
              {m.qrPatch}
            </span>
            <span className="block text-xs text-stone-400 mt-1">{qrUrl ? qrDesc : m.noTripYet}</span>
          </span>
          {withQr && qrUrl && <QrImage value={qrUrl} className="w-16 h-16 shrink-0" />}
        </button>
        )}

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-300 font-semibold">{heading}</span>
            <span className={total ? 'text-stone-50 font-bold' : 'text-amber-400 text-xs'}>{total ? fill(m.total, total) : m.pickQty}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <a
              href={total ? waHref : undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!total}
              className={`px-4 py-3 rounded-xl font-bold text-sm bg-emerald-500 text-white shadow-lg flex items-center justify-center gap-2 transition-all ${
                total ? 'hover:bg-(--action-hover) active:scale-[0.99]' : 'opacity-40 pointer-events-none'
              }`}
            >
              <WhatsAppIcon />
              {m.orderWhatsApp}
            </a>
            <a
              href={total ? mailHref : undefined}
              aria-disabled={!total}
              className={`px-4 py-3 rounded-xl font-semibold text-sm bg-stone-800 border border-stone-700 text-stone-100 flex items-center justify-center gap-2 transition-colors ${
                total ? 'hover:bg-stone-700' : 'opacity-40 pointer-events-none'
              }`}
            >
              <Mail className="w-4 h-4" />
              {m.orderEmail}
            </a>
          </div>
          <button
            onClick={() => void downloadPrint()}
            disabled={busy}
            className="w-full px-4 py-2.5 rounded-xl font-semibold text-sm text-stone-200 border border-stone-700 hover:bg-stone-800 flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-wait"
          >
            <Download className="w-4 h-4" />
            {m.downloadPrint}
          </button>
          <p className="text-xs text-stone-500 flex gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0 mt-px" />
            <span>
              {m.priceNote}
              {!PRINT_WHATSAPP && ` ${m.demoPartnerNote}`}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

function Panel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3">
      <div className="text-xs text-stone-500 font-bold">{label}</div>
      {children}
    </div>
  );
}

/** Flat product mock-ups in a 400×400 space; the sticker sits on the print area. */
function Mockup({ product, colour, img, qrUrl }: { product: Product; colour: string; img: string | null; qrUrl: string | null }) {
  const dark = colour === COLOURS.black || colour === COLOURS.navy || colour === COLOURS.olive;
  const seam = dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.14)';
  const shade = dark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.08)';

  let art = { x: 140, y: 120, s: 120 };
  let patch = { x: 300, y: 112, s: 34 };
  let body: React.ReactNode;

  if (product === 'tshirt') {
    body = (
      <>
        <path
          d="M140 40 Q200 70 260 40 L340 75 L375 150 L320 172 L305 140 L305 360 Q200 372 95 360 L95 140 L80 172 L25 150 L60 75 Z"
          fill={colour}
          stroke={seam}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M140 40 Q200 88 260 40" fill="none" stroke={seam} strokeWidth="5" />
        <path d="M95 140 L95 360 Q120 364 140 365 L140 150 Z" fill={shade} />
      </>
    );
    patch = { x: 318, y: 110, s: 32 };
  } else if (product === 'hat') {
    body = (
      <>
        <path d="M70 250 Q75 95 200 92 Q325 95 330 250 Z" fill={colour} stroke={seam} strokeWidth="2" />
        <path d="M200 92 L200 250" stroke={seam} strokeWidth="2" />
        <path d="M130 105 Q150 180 145 250 M270 105 Q250 180 255 250" fill="none" stroke={seam} strokeWidth="2" />
        <circle cx="200" cy="93" r="7" fill={colour} stroke={seam} strokeWidth="2" />
        <path d="M60 248 Q200 232 340 248 Q365 300 330 312 Q200 286 70 312 Q35 300 60 248 Z" fill={colour} stroke={seam} strokeWidth="2" />
        <path d="M60 248 Q200 232 340 248 Q345 262 340 268 Q200 252 60 268 Q55 262 60 248 Z" fill={shade} />
      </>
    );
    art = { x: 152, y: 128, s: 96 };
    patch = { x: 270, y: 190, s: 30 };
  } else {
    body = (
      <>
        <path d="M120 70 Q200 40 280 70" fill="none" stroke={dark ? '#e7e5e4' : '#57534e'} strokeWidth="5" />
        <path d="M120 70 L95 370 M280 70 L305 370" stroke={dark ? '#e7e5e4' : '#57534e'} strokeWidth="5" strokeLinecap="round" />
        <path d="M95 80 Q200 92 305 80 L320 370 Q200 382 80 370 Z" fill={colour} stroke={seam} strokeWidth="2" strokeLinejoin="round" />
        <path d="M95 80 Q200 92 305 80 L306 100 Q200 112 94 100 Z" fill={shade} />
      </>
    );
    art = { x: 125, y: 140, s: 150 };
    patch = { x: 262, y: 318, s: 36 };
  }

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl" role="img" aria-label="Product preview">
      {body}
      {img ? (
        <image href={img} x={art.x} y={art.y} width={art.s} height={art.s} />
      ) : (
        <rect x={art.x} y={art.y} width={art.s} height={art.s} rx="20" className="shimmer" fill="rgba(120,113,108,0.3)" />
      )}
      {qrUrl && (
        <foreignObject x={patch.x - 3} y={patch.y - 3} width={patch.s + 6} height={patch.s + 6}>
          <div style={{ width: '100%', height: '100%', background: '#fff', borderRadius: 4, padding: 2, boxShadow: '0 1px 3px rgba(0,0,0,.4)' }}>
            <QrImage value={qrUrl} className="w-full h-full" />
          </div>
        </foreignObject>
      )}
    </svg>
  );
}

function HatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 15a8 8 0 0 1 16 0" />
      <path d="M2 15h20c0 2-2 3-4 3H6c-2 0-4-1-4-3z" />
      <path d="M12 7V5" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" />
    </svg>
  );
}
