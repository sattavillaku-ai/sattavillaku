import React from 'react';
import Link from 'next/link';
import { Scale, ShieldCheck, Award, Users, BookOpen, CheckCircle, HeartHandshake } from 'lucide-react';
import { INITIAL_AUTHORS } from '@/lib/mock-data';
import { AuthorInfo } from '@/components/author-info';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="border-b-2 border-primary pb-4">
        <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
          <Scale className="w-4 h-4" />
          <span>சட்டவிளக்கு இதழியல் அறம்</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-tamil text-foreground">
          எங்களைப் பற்றி (About Sattavilakku)
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mt-2 font-tamil leading-relaxed">
          நீதிமன்றத் தீர்ப்புகளையும் அரசியல் சாசனக் கோட்பாடுகளையும் எளிய தமிழில் பாமர மக்களுக்கும் கொண்டு சேர்க்கும் முன்னோடி தமிழ் டிஜிட்டல் மாத இதழ்.
        </p>
      </div>

      {/* Mission & Purpose */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-7 space-y-4 font-tamil text-foreground leading-relaxed text-sm sm:text-base">
          <h2 className="text-2xl font-bold text-primary font-tamil">
            எமது நோக்கம் & இலக்கு
          </h2>
          <p>
            சட்டத்தின் ஆட்சி (Rule of Law) மற்றும் அரசியல் சாசனத்தின் விழுமியங்களை மக்களிடையே கொண்டு சேர்க்கும் உயரிய நோக்கத்துடன் <strong>சட்டவிளக்கு</strong> தொடங்கப்பட்டது.
          </p>
          <p>
            நீதிமன்ற நடைமுறைகள் மற்றும் சட்டத் திருத்தங்கள் பல நேரங்களில் சாதாரண மக்களுக்குப் புரியாத ஆங்கிலச் சொற்களிலேயே அடைபட்டு விடுகின்றன. எளிய தமிழில் துல்லியமான சட்ட விளக்கங்களை அளிப்பதுடன், நடுநிலையான இதழியல் கண்ணோட்டத்துடன் சமகால அரசியல் மற்றும் சமூகப் பிரச்னைகளை ஆய்வு செய்வதே எமது தலையாய பணியாகும்.
          </p>
          <div className="p-4 bg-primary/10 border-l-4 border-primary rounded-r-md">
            <p className="font-semibold text-primary italic">
              &ldquo;சட்டத்தின் விழிப்புணர்வே ஜனநாயகத்தின் உண்மையான பாதுகாப்பு அரண்.&rdquo;
            </p>
          </div>
        </div>

        <div className="md:col-span-5 bg-card border border-border rounded-lg p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold font-tamil text-foreground border-b border-border pb-2 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span>பதிவு & வெளியீட்டு விவரங்கள்</span>
          </h3>
          <ul className="space-y-3 text-xs sm:text-sm font-tamil text-muted-foreground">
            <li className="flex justify-between border-b border-border/60 pb-1.5">
              <span>இதழின் பெயர்:</span>
              <strong className="text-foreground">சட்டவிளக்கு (Sattavilakku)</strong>
            </li>
            <li className="flex justify-between border-b border-border/60 pb-1.5">
              <span>வகை:</span>
              <strong className="text-foreground">மாத இதழ் & தினசரி இணையச் செய்தி</strong>
            </li>
            <li className="flex justify-between border-b border-border/60 pb-1.5">
              <span>RNI பதிவு எண்:</span>
              <strong className="text-foreground font-sans">TN-TAM/2022/84920</strong>
            </li>
            <li className="flex justify-between border-b border-border/60 pb-1.5">
              <span>முதன்மை ஆசிரியர்:</span>
              <strong className="text-foreground">வழக்கறிஞர் கே. எஸ். இளங்கோவன்</strong>
            </li>
            <li className="flex justify-between pb-1.5">
              <span>பதிப்பகம்:</span>
              <strong className="text-foreground">சட்டவிளக்கு பப்ளிகேஷன்ஸ், சென்னை</strong>
            </li>
          </ul>
        </div>
      </section>

      {/* Core Values */}
      <section className="space-y-6 pt-6 border-t border-border">
        <h2 className="text-2xl sm:text-3xl font-bold font-tamil text-foreground text-center">
          எமது அடிப்படைக் கொள்கைகள் (Core Editorial Values)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg bg-card border border-border space-y-2.5">
            <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-tamil text-foreground">நடுநிலைமை (Non-Partisanship)</h3>
            <p className="text-xs sm:text-sm text-muted-foreground font-tamil leading-relaxed">
              எந்தவொரு அரசியல் கட்சியையோ அல்லது தனிநபரையோ சாராமல், உண்மைகளின் அடிப்படையில் நடுநிலையான சட்டப் பார்வையை மட்டுமே முன்வைக்கிறோம்.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-card border border-border space-y-2.5">
            <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-tamil text-foreground">ஆதாரப்பூர்வ தகவல் (Verified Facts)</h3>
            <p className="text-xs sm:text-sm text-muted-foreground font-tamil leading-relaxed">
              நீதிமன்றத்தின் அதிகாரப்பூர்வ தீர்ப்பு நகல்கள் மற்றும் அரசு அரசாணைகளை முழுமையாக ஆய்வு செய்த பின்னரே கட்டுரைகளும் செய்திகளும் பிரசுரிக்கப்படுகின்றன.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-card border border-border space-y-2.5">
            <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-tamil text-foreground">மக்களுக்கான அர்ப்பணிப்பு (Public Trust)</h3>
            <p className="text-xs sm:text-sm text-muted-foreground font-tamil leading-relaxed">
              எளிய மக்களுக்கு தங்களது அடிப்படை உரிமைகள், சட்டப் பாதுகாப்புகள் மற்றும் சமூக நீதி குறித்த விழிப்புணர்வை ஏற்படுத்துவதே எமது முதன்மை நோக்கம்.
            </p>
          </div>
        </div>
      </section>

      {/* Editorial Board */}
      <section className="space-y-6 pt-6 border-t border-border">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold font-tamil text-foreground">
            ஆசிரியர் குழு (Editorial Board)
          </h2>
          <p className="text-sm text-muted-foreground font-tamil">
            நீண்ட கால சட்டப் பயிற்சி மற்றும் இதழியல் அனுபவம் வாய்ந்த மூத்த வழக்கறிஞர்களும் பேராசிரியர்களும்
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {INITIAL_AUTHORS.map((author) => (
            <AuthorInfo key={author.id} author={author} layout="card" />
          ))}
        </div>
      </section>
    </div>
  );
}
