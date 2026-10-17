import { Atkinson_Hyperlegible_Mono, Atkinson_Hyperlegible_Next, Pacifico } from 'next/font/google';

/** App fonts, defined once so both the layout and the sticker canvas can use them. */

/**
 * Atkinson Hyperlegible Next — designed by the Braille Institute so letters that are easy to
 * confuse (I/l/1, O/0, b/d) stay distinct for low-vision readers. One family for the whole UI.
 */
export const bodyFont = Atkinson_Hyperlegible_Next({
  variable: '--font-body',
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '600', '700', '800'],
  // Next.js has no size-matching data for this newer font, so skip the auto fallback
  // (avoids the "Failed to find font override values" warning) and name our own.
  adjustFontFallback: false,
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif']
});

/** Same family, monospaced — only for links and codes people may need to read out. */
export const monoFont = Atkinson_Hyperlegible_Mono({
  variable: '--font-body-mono',
  subsets: ['latin'],
  weight: ['400'],
  adjustFontFallback: false,
  fallback: ['ui-monospace', 'Consolas', 'Menlo', 'monospace']
});

/** Script lettering for names on memory stickers (like the "Penarungan" sticker). */
export const stickerScript = Pacifico({
  weight: '400',
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sticker-script'
});
