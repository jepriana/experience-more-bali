import type { Metadata } from 'next';
import { TravelerPage } from '@/components/pages/TravelerPage';

export const metadata: Metadata = {
  title: 'Plan your adventure | Experience More Bali 2027 · KOSSI Adventure'
};

export default function Page() {
  return <TravelerPage />;
}
