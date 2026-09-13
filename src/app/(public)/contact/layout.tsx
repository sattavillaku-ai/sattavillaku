import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'தொடர்புக்கு (Contact Us) | சட்டவிளக்கு',
  description: 'சட்டவிளக்கு ஆசிரியர் குழு மற்றும் நிர்வாக அலுவலக தொடர்பு முகவரி, தொலைபேசி மற்றும் மின்னஞ்சல்.',
  openGraph: {
    title: 'தொடர்புக்கு (Contact Us) | சட்டவிளக்கு',
    description: 'சட்டவிளக்கு தலைமை அலுவலகம், ஆசிரியர் குழு தொடர்பு விவரங்கள்.',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
