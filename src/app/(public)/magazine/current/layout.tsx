import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'தற்போதைய மாத இதழ் (Current Issue) | சட்டவிளக்கு',
  description: 'சட்டவிளக்கு தற்போதைய மாத இதழ் - சிறப்புக் கட்டுரைகள், தலையங்கம் மற்றும் முழு டிஜிட்டல் வாசிப்பு.',
  openGraph: {
    title: 'தற்போதைய மாத இதழ் (Current Issue) | சட்டவிளக்கு',
    description: 'சட்டவிளக்கு தற்போதைய மாத இதழ் - சிறப்புக் கட்டுரைகள், தலையங்கம் மற்றும் முழு டிஜிட்டல் வாசிப்பு.',
  },
};

export default function CurrentMagazineLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
