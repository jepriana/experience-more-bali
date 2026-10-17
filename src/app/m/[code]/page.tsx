import { Suspense } from 'react';
import type { Metadata } from 'next';
import { MemoryView } from '@/components/memory/MemoryView';
import { PageLoading } from '@/components/pages/PageLoading';

export const metadata: Metadata = {
  title: 'Memory | Experience More Bali 2027 · KOSSI Adventure',
  description: 'A KOSSI Adventure memory — scanned from a QR on memory gear.'
};

/**
 * /m/<code> — opened by scanning a QR memory patch or counter card.
 * The code carries the memory itself (see lib/memoryLink), so no database lookup is needed.
 * The dynamic param is read inside <Suspense> (required with Cache Components).
 */
export default function Page({ params }: { params: Promise<{ code: string }> }) {
  return <Suspense fallback={<PageLoading />}>{params.then(({ code }) => <MemoryView code={code} />)}</Suspense>;
}
