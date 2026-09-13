import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'தேடல் (Search) | சட்டவிளக்கு',
  description: 'சட்டவிளக்கு கட்டுரைகள், செய்திகள் மற்றும் மாத இதழ்களைத் தேடுங்கள்.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
