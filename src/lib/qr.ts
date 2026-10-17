import QRCode from 'qrcode';

/**
 * QR codes drawn by us from the module matrix (via the `qrcode` library), so the same code
 * renders as crisp SVG on screen and as pixels in the print files — no async image loading.
 */

const cache = new Map<string, { size: number; dark: boolean[] }>();

function matrix(text: string) {
  let m = cache.get(text);
  if (!m) {
    // M = survives ~15% damage: good for printed fabric
    const { modules } = QRCode.create(text, { errorCorrectionLevel: 'M' });
    m = { size: modules.size, dark: Array.from(modules.data, (v) => !!v) };
    if (cache.size > 50) cache.clear();
    cache.set(text, m);
  }
  return m;
}

const QUIET = 2; // quiet-zone modules around the code

/** SVG path for the dark modules, in module units including the quiet zone. */
export function qrSvg(text: string): { viewBox: number; path: string } {
  const { size, dark } = matrix(text);
  let path = '';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (dark[r * size + c]) path += `M${c + QUIET} ${r + QUIET}h1v1h-1z`;
    }
  }
  return { viewBox: size + QUIET * 2, path };
}

/** Draws the code (with white quiet zone) into a square on a canvas. */
export function drawQr(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, side: number, fg = '#0c0a09') {
  const { size, dark } = matrix(text);
  const total = size + QUIET * 2;
  const cell = side / total;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, side, side);
  ctx.fillStyle = fg;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // +0.5px overlap avoids hairline gaps between modules
      if (dark[r * size + c]) ctx.fillRect(x + (c + QUIET) * cell, y + (r + QUIET) * cell, cell + 0.5, cell + 0.5);
    }
  }
}
