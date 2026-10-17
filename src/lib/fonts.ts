import { Geist, Geist_Mono, Pacifico } from 'next/font/google';

/** App fonts, defined once so both the layout and the sticker canvas can use them. */

export const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

export const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

/** Script lettering for names on memory stickers (like the "Penarungan" sticker). */
export const stickerScript = Pacifico({
  weight: '400',
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sticker-script'
});
