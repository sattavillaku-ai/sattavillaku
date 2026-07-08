import { Metadata } from 'next';
import { SubscribePlans } from '@/components/subscription/SubscribePlans';

export const metadata: Metadata = {
  title: 'சந்தா செலுத்துக | சட்டவிளக்கு - Subscribe to Sattavilakku',
  description: 'மாதம் வெறும் ₹30-க்கு சட்டவிளக்கு (Sattavilakku) இதழின் சந்தாதாரராகி சிறந்த சட்டக் கட்டுரைகள் மற்றும் அரசியல் அலசல்களைத் தடையின்றி வாசியுங்கள்.',
  alternates: {
    canonical: 'https://sattavilakku.com/subscribe',
  },
};

export default function SubscribePage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4 text-primary">சந்தா பெறுங்கள் (Subscribe)</h1>
        <p className="text-xl text-muted-foreground">சிறந்த தமிழ் படைப்புகளைத் தொடர்ந்து வாசிக்க உங்கள் திட்டத்தைத் தேர்வு செய்யவும்.</p>
      </div>

      <SubscribePlans />
    </div>
  );
}
