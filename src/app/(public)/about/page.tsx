import { Metadata } from 'next';
import { Scale, Mail, Phone } from 'lucide-react';
import { ContactForm } from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'எங்களைப் பற்றி | சட்டவிளக்கு - About Sattavilakku',
  description: 'சட்டவிளக்கு (Sattavilakku) இதழின் நோக்கம், ஆசிரியர் குழு மற்றும் எங்களைத் தொடர்பு கொள்வதற்கான விவரங்கள். சட்டமும் சமூகமும் சார்ந்த நீதிக்கான தமிழ் குரல்.',
  alternates: {
    canonical: 'https://sattavilakku.com/about',
  },
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <section className="text-center mb-16">
        <Scale className="h-16 w-16 text-primary mx-auto mb-6" />
        <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">எங்களைப் பற்றி (About Us)</h1>
        <p className="text-xl text-muted-foreground font-serif italic">சட்டமும் சமூகமும் — நீதிக்கான ஒரு தமிழ் குரல்</p>
      </section>

      <div className="prose prose-lg dark:prose-invert max-w-none space-y-8 font-serif">
        <p className="leading-relaxed">
          <strong>சட்டவிளக்கு</strong> (Sattavilakku) என்பது தமிழ்ச் சூழலில் சட்டம், அரசியல் மற்றும் சமூக நீதி குறித்த ஆழமான புரிதலை ஏற்படுத்தும் நோக்கில் தொடங்கப்பட்ட ஒரு இணைய இதழ். சாமானிய மக்களும் சட்டத்தின் நுணுக்கங்களை எளிதாகப் புரிந்து கொள்ள வேண்டும் என்பதே எங்களின் முதன்மை நோக்கம்.
        </p>

        {/* Owner Section */}
        <div className="my-12 not-prose bg-muted/40 border border-border/60 rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Owner Photo */}
            <div className="md:col-span-4 flex justify-center">
              <div className="relative aspect-[3/4.2] w-full max-w-[200px] group">
                <div className="absolute inset-2 bg-primary/10 rounded-2xl blur-xl group-hover:bg-primary/20 transition-all duration-700" />
                <div className="relative h-full w-full rounded-2xl overflow-hidden border-4 border-background shadow-md">
                  <img
                    src="/images/photo.jpeg"
                    alt="K. இளையராஜா, M.Sc., LL.B. — உரிமையாளர் & ஆசிரியர்"
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            </div>

            {/* Owner Info */}
            <div className="md:col-span-8 space-y-3">
              <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                நிறுவனர் & முதன்மை ஆசிரியர்
              </span>
              
              <h2 className="text-2xl md:text-3xl font-serif font-black text-foreground">
                K. இளையராஜா, <span className="text-sm md:text-base font-sans font-semibold text-muted-foreground">M.Sc., LL.B.</span>
              </h2>
              
              <blockquote className="text-base text-foreground/90 font-serif leading-relaxed italic border-l-2 border-primary pl-4 my-3">
                &quot;சட்டத்தின் வெளிச்சம் ஒவ்வொரு சாமானியனுக்கும் சென்றடைய வேண்டும் என்பதே எங்களின் நோக்கம். சட்டம் என்பது வெறும் புத்தகங்களில் இருக்கும் வார்த்தைகள் அல்ல, அது நமது உரிமைகளின் கவசம். சட்டவிளக்கு இதழ் மூலம் நீதியையும் சமூக விழிப்புணர்வையும் தொடர்ந்து பரப்புவோம்.&quot;
              </blockquote>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold font-serif border-b pb-2">எங்களின் பணிகள்</h2>
        <ul className="list-disc pl-6 space-y-4">
          <li>உயர் நீதிமன்ற மற்றும் உச்ச நீதிமன்ற முக்கியத் தீர்ப்புகளைத் தமிழில் விளக்குதல்.</li>
          <li>சமகால அரசியல் நிகழ்வுகளின் சட்டப்பூர்வமான பின்னணிகளை ஆய்வு செய்தல்.</li>
          <li>அரசு கொண்டு வரும் புதிய சட்டங்கள் மற்றும் மசோதாக்கள் குறித்த விழிப்புணர்வு.</li>
          <li>சமூக நீதி மற்றும் மனித உரிமைகள் சார்ந்த ஆழமான கட்டுரைகள்.</li>
        </ul>

        <h2 className="text-2xl font-bold font-serif border-b pb-2">ஆசிரியர் குழு</h2>
        <p>
          சட்ட வல்லுநர்கள், மூத்த ஊடகவியலாளர்கள் மற்றும் சமூக ஆர்வலர்களைக் கொண்ட ஒரு சிறிய ஆனால் அர்ப்பணிப்புள்ள குழுவால் இந்த இதழ் நடத்தப்படுகிறது.
        </p>
      </div>

      <section className="mt-20 p-8 bg-card border rounded-2xl shadow-sm">
        <h2 className="text-2xl font-bold font-serif mb-8 text-center">தொடர்பு கொள்ள (Contact)</h2>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full text-primary">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">மின்னஞ்சல்</p>
                <p className="font-bold font-sans">sattavilakku@gmail.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full text-primary">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">தொலைபேசி</p>
                <p className="font-bold font-sans">+91 79042 67437</p>
              </div>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>
    </div>
  );
}
