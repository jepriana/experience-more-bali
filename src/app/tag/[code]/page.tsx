import { Suspense } from 'react';
import type { Metadata } from 'next';
import { TagView } from '@/components/tags/TagView';
import { PageLoading } from '@/components/pages/PageLoading';

export const metadata: Metadata = {
  title: 'Destination tag | Experience More Bali 2027 · KOSSI Adventure',
  description: 'Scanned from a KOSSI destination QR tag: collect the achievement or claim the discount.'
};

/** /tag/<id>.<token> — opened by scanning a destination QR tag (summit, trailhead, dive spot…). */
export default function Page({ params }: { params: Promise<{ code: string }> }) {
  return <Suspense fallback={<PageLoading />}>{params.then(({ code }) => <TagView code={code} />)}</Suspense>;
}
