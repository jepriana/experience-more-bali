import type { Metadata } from 'next';
import { AdminPage } from '@/components/admin/AdminPage';

export const metadata: Metadata = {
  title: 'Partner verification | KOSSI Adventure admin',
  robots: { index: false, follow: false }
};

export default function Page() {
  return <AdminPage />;
}
