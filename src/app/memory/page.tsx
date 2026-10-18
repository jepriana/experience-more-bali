import type { Metadata } from 'next';
import { MemoriesHub } from '@/components/memories/MemoriesHub';

export const metadata: Metadata = {
  title: 'My memories | Experience More Bali 2027 · KOSSI Adventure'
};

/** Traveler layer 2: trips with QR pages, photos & videos, and check-in credentials. */
export default function Page() {
  return <MemoriesHub />;
}
