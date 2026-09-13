import { Metadata } from 'next';
import { AdminLayoutClient } from '@/components/admin/admin-layout-client';

export const metadata: Metadata = {
  title: 'நிர்வாகக் கட்டுப்பாட்டகம் | சட்டவிளக்கு Admin',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
