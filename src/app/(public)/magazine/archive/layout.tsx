import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'இதழ் காப்பகம் (Magazine Archive) | சட்டவிளக்கு',
  description: 'ஆண்டுகள் மற்றும் மாதங்கள் வாரியாக சட்டவிளக்கு முந்தைய இதழ்களின் வரலாற்றுத் தொகுப்பு.',
  openGraph: {
    title: 'இதழ் காப்பகம் (Magazine Archive) | சட்டவிளக்கு',
    description: 'ஆண்டுகள் மற்றும் மாதங்கள் வாரியாக சட்டவிளக்கு முந்தைய இதழ்களின் வரலாற்றுத் தொகுப்பு.',
  },
};

export default function MagazineArchiveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
