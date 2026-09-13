import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'தினசரி செய்திகள் (Daily Digital News) | சட்டவிளக்கு',
  description:
    'உச்ச நீதிமன்றம், சென்னை உயர் நீதிமன்றம், தமிழ்நாடு அரசு மற்றும் தேசிய அரசியல் நகர்வுகளின் உடனுக்குடனான நம்பகமான செய்திகள்.',
  openGraph: {
    title: 'தினசரி செய்திகள் (Daily News) | சட்டவிளக்கு',
    description: 'சட்டம், அரசியல், தமிழ்நாடு மற்றும் இந்திய நடப்புகள் குறித்த நடுநிலையான செய்திகள்.',
  },
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
