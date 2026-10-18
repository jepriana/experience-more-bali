import type { Metadata } from 'next';
import { ConnectHub } from '@/components/connect/ConnectHub';

export const metadata: Metadata = {
  title: 'Connect | Experience More Bali 2027 · KOSSI Adventure'
};

/** Traveler layer 3: interest and Bali-area groups. */
export default function Page() {
  return <ConnectHub />;
}
