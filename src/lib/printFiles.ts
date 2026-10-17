'use client';

import { bodyFont } from '@/lib/fonts';
import { drawQr } from '@/lib/qr';
import { downloadCanvas, renderSticker, slugify, type StickerContent } from '@/lib/sticker';

/**
 * Print-ready files for the digital-printing partner. One PNG holds everything they need:
 * the sticker artwork at print resolution, the QR patch (when ordered) and the order details,
 * so nothing gets lost between WhatsApp messages.
 */

const SANS = bodyFont.style.fontFamily;

export interface PrintOrder {
  /** e.g. "T-shirt · Navy" */
  heading: string;
  /** e.g. ["M × 2", "Kids × 1", "QR patch: yes"] */
  lines: string[];
  /** product colour, shown as a swatch */
  colourHex: string;
}

/** 2000 px sticker, plus a band with the QR patch and the order underneath. */
export async function downloadPrintSheet(sticker: StickerContent, order: PrintOrder, qrUrl?: string) {
  const W = 2000;
  const BAND = 760;
  const art = await renderSticker(sticker, W);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = W + BAND;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, W + BAND);
  ctx.drawImage(art, 0, 0);

  // cut line between artwork and order band
  ctx.strokeStyle = '#a8a29e';
  ctx.setLineDash([24, 18]);
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(60, W + 20);
  ctx.lineTo(W - 60, W + 20);
  ctx.stroke();
  ctx.setLineDash([]);

  let textX = 100;
  if (qrUrl) {
    const side = 560;
    drawQr(ctx, qrUrl, 100, W + 110, side);
    ctx.strokeStyle = '#0c0a09';
    ctx.lineWidth = 6;
    ctx.strokeRect(100, W + 110, side, side);
    textX = 100 + side + 90;
  }

  ctx.fillStyle = '#0c0a09';
  ctx.textBaseline = 'top';
  ctx.font = `800 76px ${SANS}`;
  ctx.fillText(order.heading, textX, W + 120);

  ctx.fillStyle = order.colourHex;
  ctx.fillRect(textX, W + 230, 70, 70);
  ctx.strokeStyle = '#78716c';
  ctx.lineWidth = 3;
  ctx.strokeRect(textX, W + 230, 70, 70);

  ctx.fillStyle = '#292524';
  ctx.font = `600 54px ${SANS}`;
  order.lines.slice(0, 6).forEach((line, i) => ctx.fillText(line, textX + (i === 0 ? 100 : 0), W + 238 + i * 76));

  ctx.fillStyle = '#78716c';
  ctx.font = `500 36px ${SANS}`;
  ctx.fillText('KOSSI Adventure · Experience More Bali 2027', textX, W + BAND - 80);

  await downloadCanvas(canvas, `kossi-print-${slugify(sticker.title)}.png`);
}

/** Portrait counter card (A6 at 300 dpi): sticker, QR and a call to scan. */
export async function downloadCounterCard(sticker: StickerContent, qrUrl: string, scanText: string, offerText?: string) {
  const W = 1240;
  const H = 1748;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#ecfdf5');
  bg.addColorStop(1, '#ccfbf1');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const art = await renderSticker(sticker, 860);
  ctx.drawImage(art, (W - 860) / 2, 40);

  const side = 520;
  const qx = (W - side) / 2;
  const qy = 930;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(qx - 24, qy - 24, side + 48, side + 48);
  drawQr(ctx, qrUrl, qx, qy, side);

  ctx.fillStyle = '#064e3b';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = `800 54px ${SANS}`;
  ctx.fillText(scanText, W / 2, qy + side + 56, W - 120);
  if (offerText) {
    ctx.fillStyle = '#b45309';
    ctx.font = `800 46px ${SANS}`;
    ctx.fillText(offerText, W / 2, qy + side + 130, W - 120);
  }

  await downloadCanvas(canvas, `kossi-counter-card-${slugify(sticker.title)}.png`);
}
