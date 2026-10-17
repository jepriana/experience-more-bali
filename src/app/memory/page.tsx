import type { Metadata } from 'next';
import { QrMemoryPlatform } from '@/components/phygital/QrMemoryPlatform';

export const metadata: Metadata = {
  title: 'Memory objects | Experience More Bali 2027 · KOSSI Adventure'
};

export default function Page() {
  return <QrMemoryPlatform />;
}
