import type { Metadata } from 'next';
import { NotFoundView } from '@/components/nav/NotFoundView';

export const metadata: Metadata = {
  title: 'Page not found | Experience More Bali 2027 · KOSSI Adventure'
};

export default function NotFound() {
  return <NotFoundView />;
}
