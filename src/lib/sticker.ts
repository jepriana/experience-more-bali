'use client';

import { bodyFont, stickerScript } from '@/lib/fonts';

/**
 * Draws a KOSSI Adventure "memory sticker" on a canvas.
 *
 *   traveler:  <Name / Family / Group>  ·  <home region>  ·  Powered by KOSSI Adventure
 *   partner:   <Business name>          ·  <area · region, Bali>  ·  Strategic Partner of KOSSI Adventure
 *
 * One drawing routine serves the on-screen preview AND the high-resolution PNG download
 * (for printing on T-shirts, hats and bags later), so what you see is what gets printed.
 * Everything is drawn in a 1000×1000 design space and scaled.
 */

export type StickerKind = 'traveler' | 'partner';

export interface StickerContent {
  kind: StickerKind;
  /** big script text: family/group name or business name */
  title: string;
  /** region line */
  region: string;
  /** "Powered by" / "Strategic Partner of" — translated by the caller */
  tagline: string;
}

const LOGO_SRC = '/brand/kossi-adventure-logo.jpg';
let logoPromise: Promise<HTMLImageElement> | null = null;

function loadLogo(): Promise<HTMLImageElement> {
  if (!logoPromise) {
    logoPromise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = LOGO_SRC;
    });
  }
  return logoPromise;
}

const SCRIPT = stickerScript.style.fontFamily;
const SANS = bodyFont.style.fontFamily;

/** Wait for the logo and fonts, so the first draw already looks right. */
async function ready(): Promise<HTMLImageElement | null> {
  try {
    await Promise.all([document.fonts.load(`80px ${SCRIPT}`), document.fonts.load(`700 40px ${SANS}`)]);
  } catch {}
  try {
    return await loadLogo();
  } catch {
    return null; // still draw the sticker without the logo
  }
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const PALETTES: Record<StickerKind, { sky: [string, string, string]; sun: string; hills: [string, string, string, string] }> = {
  // sunrise for travelers
  traveler: {
    sky: ['#fff7d6', '#fed7aa', '#fb923c'],
    sun: '#fbbf24',
    hills: ['#0f766e', '#22c55e', '#16a34a', '#15803d']
  },
  // lush green for partners
  partner: {
    sky: ['#ecfdf5', '#bbf7d0', '#5eead4'],
    sun: '#facc15',
    hills: ['#115e59', '#4ade80', '#22c55e', '#166534']
  }
};

function drawScene(ctx: CanvasRenderingContext2D, kind: StickerKind) {
  const p = PALETTES[kind];

  // sky
  const sky = ctx.createLinearGradient(0, 60, 0, 620);
  sky.addColorStop(0, p.sky[0]);
  sky.addColorStop(0.55, p.sky[1]);
  sky.addColorStop(1, p.sky[2]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1000, 1000);

  // sun with glow
  const glow = ctx.createRadialGradient(700, 330, 40, 700, 330, 220);
  glow.addColorStop(0, 'rgba(253, 224, 71, 0.9)');
  glow.addColorStop(1, 'rgba(253, 224, 71, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(460, 100, 480, 480);
  ctx.fillStyle = p.sun;
  ctx.beginPath();
  ctx.arc(700, 330, 95, 0, Math.PI * 2);
  ctx.fill();

  // volcano (Agung-like) — far
  ctx.fillStyle = p.hills[0];
  ctx.beginPath();
  ctx.moveTo(300, 640);
  ctx.lineTo(560, 330);
  ctx.quadraticCurveTo(600, 300, 640, 330);
  ctx.lineTo(960, 640);
  ctx.closePath();
  ctx.fill();

  // temple (meru) silhouette, right
  ctx.fillStyle = '#064e3b';
  const tiers = [
    { w: 150, y: 560 },
    { w: 120, y: 520 },
    { w: 92, y: 484 },
    { w: 64, y: 452 }
  ];
  ctx.fillRect(838, 560, 14, 90);
  for (const t of tiers) {
    ctx.beginPath();
    ctx.moveTo(845 - t.w / 2, t.y + 14);
    ctx.lineTo(845 - t.w / 2 + 18, t.y);
    ctx.lineTo(845 + t.w / 2 - 18, t.y);
    ctx.lineTo(845 + t.w / 2, t.y + 14);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(845 - 6, t.y + 14, 12, 26);
  }
  ctx.beginPath();
  ctx.moveTo(845, 410);
  ctx.lineTo(853, 452);
  ctx.lineTo(837, 452);
  ctx.closePath();
  ctx.fill();

  // rice terraces — three waving bands
  const bands: [number, string][] = [
    [600, p.hills[1]],
    [690, p.hills[2]],
    [790, p.hills[3]]
  ];
  for (const [y, color] of bands) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, y + 30);
    ctx.bezierCurveTo(220, y - 40, 420, y + 70, 620, y + 10);
    ctx.bezierCurveTo(780, y - 35, 900, y + 40, 1000, y);
    ctx.lineTo(1000, 1000);
    ctx.lineTo(0, 1000);
    ctx.closePath();
    ctx.fill();
    // terrace highlight line
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, y + 46);
    ctx.bezierCurveTo(220, y - 24, 420, y + 86, 620, y + 26);
    ctx.bezierCurveTo(780, y - 19, 900, y + 56, 1000, y + 16);
    ctx.stroke();
  }
}

/** Largest font size (≤ max) at which text fits in maxWidth. */
function fitFont(ctx: CanvasRenderingContext2D, text: string, family: string, weight: string, max: number, min: number, maxWidth: number) {
  let size = max;
  while (size > min) {
    ctx.font = `${weight} ${size}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 4;
  }
  ctx.font = `${weight} ${size}px ${family}`;
  return size;
}

/** Splits a long title into two balanced lines at a space. */
function splitTitle(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  if (ctx.measureText(text).width <= maxWidth || !text.includes(' ')) return [text];
  const words = text.split(' ');
  let best: string[] = [text];
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' ');
    const b = words.slice(i).join(' ');
    const diff = Math.abs(ctx.measureText(a).width - ctx.measureText(b).width);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = [a, b];
    }
  }
  return best;
}

function drawStickerSync(ctx: CanvasRenderingContext2D, c: StickerContent, logo: HTMLImageElement | null) {
  ctx.clearRect(0, 0, 1000, 1000);

  // die-cut white border with shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.22)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = '#ffffff';
  roundedRect(ctx, 22, 34, 956, 940, 150);
  ctx.fill();
  ctx.restore();

  // artwork clipped inside the border
  ctx.save();
  roundedRect(ctx, 44, 56, 912, 896, 132);
  ctx.clip();
  drawScene(ctx, c.kind);

  // small top label
  ctx.fillStyle = '#064e3b';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `800 28px ${SANS}`;
  if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '6px';
  ctx.fillText('EXPERIENCE MORE BALI · 2027', 500, 128);
  if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px';

  // title in script lettering: white outline + deep green fill, like a die-cut sticker
  const title = c.title.trim() || ' ';
  let size = fitFont(ctx, title, SCRIPT, '400', 132, 84, 820);
  let lines = [title];
  if (ctx.measureText(title).width > 820) {
    lines = splitTitle(ctx, title, 820);
    size = Math.min(...lines.map((l) => fitFont(ctx, l, SCRIPT, '400', 112, 48, 820)));
    ctx.font = `400 ${size}px ${SCRIPT}`;
  }
  const lineHeight = size * 1.15;
  const firstY = 300 - ((lines.length - 1) * lineHeight) / 2;
  ctx.lineJoin = 'round';
  lines.forEach((line, i) => {
    const y = firstY + i * lineHeight;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 6;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(10, size * 0.14);
    ctx.strokeText(line, 500, y);
    ctx.restore();
    ctx.fillStyle = '#14532d';
    ctx.fillText(line, 500, y);
  });

  // region ribbon
  const region = (c.region || '').toUpperCase();
  fitFont(ctx, region, SANS, '800', 34, 20, 640);
  const ribbonW = Math.min(760, ctx.measureText(region).width + 110);
  const ribbonY = 470;
  ctx.fillStyle = '#7c2d12';
  roundedRect(ctx, 500 - ribbonW / 2, ribbonY - 34, ribbonW, 68, 34);
  ctx.fill();
  ctx.strokeStyle = '#fde68a';
  ctx.lineWidth = 4;
  ctx.stroke();
  // map-pin dot
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(500 - ribbonW / 2 + 38, ribbonY, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff7ed';
  ctx.fillText(region, 500 + 14, ribbonY + 2);

  // wooden plaque: tagline + KOSSI Adventure logo
  const px = 170;
  const py = 676;
  const pw = 660;
  const ph = 236;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 8;
  const wood = ctx.createLinearGradient(0, py, 0, py + ph);
  wood.addColorStop(0, '#d97706');
  wood.addColorStop(1, '#92400e');
  ctx.fillStyle = wood;
  roundedRect(ctx, px, py, pw, ph, 28);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(69, 26, 3, 0.35)'; // plank lines
  ctx.lineWidth = 3;
  for (const y of [py + 78, py + 156]) {
    ctx.beginPath();
    ctx.moveTo(px + 14, y);
    ctx.lineTo(px + pw - 14, y);
    ctx.stroke();
  }
  ctx.fillStyle = '#451a03'; // nails
  for (const [nx, ny] of [
    [px + 24, py + 24],
    [px + pw - 24, py + 24],
    [px + 24, py + ph - 24],
    [px + pw - 24, py + ph - 24]
  ]) {
    ctx.beginPath();
    ctx.arc(nx, ny, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#fff7ed';
  fitFont(ctx, c.tagline, SANS, '800', 36, 22, pw - 120);
  ctx.fillText(c.tagline, 500, py + 44);

  if (logo) {
    const lh = 146;
    const lw = (logo.width / logo.height) * lh;
    ctx.save();
    roundedRect(ctx, 500 - lw / 2, py + 72, lw, lh, 18);
    ctx.clip();
    ctx.drawImage(logo, 500 - lw / 2, py + 72, lw, lh);
    ctx.restore();
  } else {
    ctx.font = `400 64px ${SCRIPT}`;
    ctx.fillText('KOSSI Adventure', 500, py + 150);
  }

  ctx.restore();
}

/** Draws the sticker onto a canvas at the given CSS size (crisp on high-DPI screens). */
export async function drawSticker(canvas: HTMLCanvasElement, content: StickerContent, cssSize: number) {
  const logo = await ready();
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const px = Math.round(cssSize * dpr);
  if (canvas.width !== px) {
    canvas.width = px;
    canvas.height = px;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(px / 1000, 0, 0, px / 1000, 0, 0);
  drawStickerSync(ctx, content, logo);
}

/** Renders the sticker on a new square canvas of `px` pixels. */
export async function renderSticker(content: StickerContent, px: number): Promise<HTMLCanvasElement> {
  const logo = await ready();
  const canvas = document.createElement('canvas');
  canvas.width = px;
  canvas.height = px;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.setTransform(px / 1000, 0, 0, px / 1000, 0, 0);
    drawStickerSync(ctx, content, logo);
  }
  return canvas;
}

/** PNG data URL of the sticker, for mock-ups (T-shirt, hat, bag). */
export async function stickerDataUrl(content: StickerContent, px = 600): Promise<string> {
  return (await renderSticker(content, px)).toDataURL('image/png');
}

export function slugify(text: string, fallback = 'kossi'): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || fallback;
}

/** Saves a canvas as a PNG file. */
export async function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Renders a 2000×2000 print-quality PNG and downloads it. */
export async function downloadSticker(content: StickerContent) {
  const canvas = await renderSticker(content, 2000);
  await downloadCanvas(canvas, `kossi-sticker-${slugify(content.title, 'sticker')}.png`);
}
