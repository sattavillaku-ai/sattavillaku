import React from 'react';
import Link from 'next/link';
import { BrandLogo } from './brand-logo';
import { ShieldCheck, Mail, MapPin, Phone, Scale, BookOpen, ExternalLink } from 'lucide-react';

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/40 border-t border-border mt-16 text-sm text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Column 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo size="md" />
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              சட்டவிளக்கு என்பது சட்டம், அரசியல், தமிழ்நாடு மற்றும் இந்திய நடப்புகள் குறித்த நடுநிலையான, நம்பகமான, ஆழமான ஆய்வுக் கட்டுரைகளையும் அன்றாடச் செய்திகளையும் வழங்கும் முன்னோடி தமிழ் டிஜிட்டல் மாத இதழ்.
            </p>
            <div className="space-y-1.5 text-xs text-muted-foreground pt-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span>RNI பதிவு எண்: <strong>TN-TAM/2022/84920</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span>பாரிமுனை, சென்னை - 600 104, தமிழ்நாடு</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>editor@sattavilakku.com</span>
              </div>
            </div>
          </div>

          {/* Column 2: இதழ் (Magazine) */}
          <div className="space-y-3">
            <h3 className="font-bold text-base text-foreground font-tamil flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-primary" />
              மாத இதழ்
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/magazine/current" className="hover:text-primary transition-colors">
                  தற்போதைய இதழ் (Current)
                </Link>
              </li>
              <li>
                <Link href="/magazine" className="hover:text-primary transition-colors">
                  அனைத்து இதழ்கள்
                </Link>
              </li>
              <li>
                <Link href="/magazine/archive" className="hover:text-primary transition-colors">
                  இதழ் காப்பகம் (Archive)
                </Link>
              </li>
              <li>
                <Link href="/magazine#reader" className="hover:text-primary transition-colors">
                  டிஜிட்டல் PDF வாசிப்பாளர்
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: செய்திகள் & கட்டுரைகள் */}
          <div className="space-y-3">
            <h3 className="font-bold text-base text-foreground font-tamil flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-primary" />
              பிரிவுகள்
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/news/law" className="hover:text-primary transition-colors">
                  சட்டம் & நீதிமன்றத் தீர்ப்புகள்
                </Link>
              </li>
              <li>
                <Link href="/news/politics" className="hover:text-primary transition-colors">
                  அரசியல் கள நிலவரங்கள்
                </Link>
              </li>
              <li>
                <Link href="/news/tamil-nadu" className="hover:text-primary transition-colors">
                  தமிழ்நாடு அரசு & சமூகம்
                </Link>
              </li>
              <li>
                <Link href="/news/india" className="hover:text-primary transition-colors">
                  இந்திய தேசிய நடப்புகள்
                </Link>
              </li>
              <li>
                <Link href="/articles" className="hover:text-primary transition-colors">
                  சிறப்புக் கட்டுரைகள்
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: தகவல் & சட்ட வழிகாட்டுதல் */}
          <div className="space-y-3">
            <h3 className="font-bold text-base text-foreground font-tamil">
              இதழியல் & தொடர்பு
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  எங்களைப் பற்றி (About Us)
                </Link>
              </li>
              <li>
                <Link href="/about#ethics" className="hover:text-primary transition-colors">
                  ஆசிரியர் நெறிமுறைக் கொள்கை
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  தொடர்பு & கருத்துக்கள்
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-primary transition-colors">
                  முழு தேடல் தளம்
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-primary transition-colors text-xs font-semibold text-primary">
                  ஆசிரியர் குழு நுழைவு &rarr;
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="mt-12 pt-6 border-t border-border/80 text-xs text-muted-foreground leading-relaxed">
          <p className="mb-2">
            <strong>சட்டப்பூர்வ அறிவிப்பு:</strong> சட்டவிளக்கு இதழில் வெளியாகும் கட்டுரைகள் மற்றும் செய்திகள் பொதுமக்கள் விழிப்புணர்விற்காக மட்டுமே வழங்கப்படுகின்றன. இவை நேரடி சட்ட ஆலோசனையாக (Legal Advice) கருதப்படலாகாது. சட்ட விவகாரங்களில் குறிப்பிட்ட வழக்குரைஞர்களை அணுகி உரிய ஆலோசனை பெறவும்.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/40">
            <p>© {currentYear} சட்டவிளக்கு (SATTAVILAKKU). அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.</p>
            <div className="flex items-center space-x-4">
              <Link href="/about" className="hover:text-foreground">விதிமுறைகள்</Link>
              <span>•</span>
              <Link href="/about" className="hover:text-foreground">தனியுரிமைக் கொள்கை</Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-foreground">செய்தி வெளியீடுகள் சமர்ப்பிக்க</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
