import { Metadata } from 'next';
import { SearchClient } from '@/components/SearchClient';

export const metadata: Metadata = {
  title: 'தேடல் | சட்டவிளக்கு - Search',
  description: 'சட்டவிளக்கு (Sattavilakku) இதழில் பிரசுரிக்கப்பட்ட சட்டக் கட்டுரைகள், நீதிமன்ற செய்திகள் மற்றும் சமகால அரசியல் அலசல்களைத் தேடுங்கள்.',
  alternates: {
    canonical: 'https://sattavilakku.com/search',
  },
};

export default function SearchPage() {
  return <SearchClient />;
}
