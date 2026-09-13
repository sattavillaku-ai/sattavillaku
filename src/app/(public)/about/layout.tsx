import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'எங்களைப் பற்றி (About Us) | சட்டவிளக்கு',
  description: 'சட்டவிளக்கு ஆசிரியர் குழு, தலையங்க நெறிமுறைகள் மற்றும் நடுநிலையான சட்ட விழிப்புணர்வுப் பார்வை.',
  openGraph: {
    title: 'எங்களைப் பற்றி (About Us) | சட்டவிளக்கு',
    description: 'அச்சம் தவிர்! சட்டம் பேசு! சட்டவிளக்கு மாத இதழ் & நாளிதழ் பற்றிய முழு விவரம்.',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
