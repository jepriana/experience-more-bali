import type { Metadata } from 'next';
import './globals.css';
import { bodyFont, monoFont, stickerScript } from '@/lib/fonts';
import { AppShell } from '@/components/AppShell';
import { THEME_INIT_SCRIPT } from '@/lib/themeScript';

export const metadata: Metadata = {
  title: 'Experience More Bali 2027 | KOSSI Adventure',
  description:
    'JAPAC AI Builder Cup Hackathon MVP - Connecting travelers with meaningful experiences while helping local partners grow their digital presence, markets, and customer relationships.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${bodyFont.variable} ${monoFont.variable} ${stickerScript.variable} h-full antialiased`}
    >
      <head>
        {/* sets data-theme before paint (no flash of the wrong theme) */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-stone-950 text-stone-50 font-sans">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
