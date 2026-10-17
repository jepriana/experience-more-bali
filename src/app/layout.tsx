import type { Metadata } from 'next';
import './globals.css';
import { geistSans, geistMono, stickerScript } from '@/lib/fonts';
import { AppShell } from '@/components/AppShell';

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
      className={`${geistSans.variable} ${geistMono.variable} ${stickerScript.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-stone-950 text-stone-100 font-sans">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
