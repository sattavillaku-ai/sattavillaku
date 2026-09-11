'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { ThemeToggle } from '@/components/theme-toggle';

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleGoBack = () => {
    if (
      typeof window !== 'undefined' &&
      window.history.length > 1 &&
      document.referrer &&
      !document.referrer.includes('/admin') &&
      !document.referrer.includes('/auth/callback')
    ) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-muted/30 relative font-tamil text-foreground">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <ThemeToggle />
        <Link
          href="/"
          className="text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md border border-border bg-card flex items-center gap-1.5 transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>தளத்திற்குத் திரும்புக</span>
        </Link>
      </div>

      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg p-6 sm:p-8 space-y-6 text-center">
        {/* Brand Header */}
        <div className="flex flex-col items-center space-y-3">
          <BrandLogo size="lg" isLink={false} />
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs font-bold font-sans">
            Sattavilakku Admin
          </div>
        </div>

        {/* Access Restricted Card Body */}
        <div className="space-y-4 pt-1">
          <div className="w-14 h-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto ring-8 ring-destructive/5">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">
              அனுமதி மறுக்கப்பட்டது
            </h1>
            <h2 className="text-sm font-bold text-destructive font-sans">
              Access Restricted
            </h2>
          </div>

          <div className="space-y-2 text-xs sm:text-sm text-muted-foreground leading-relaxed px-2">
            <p className="font-semibold text-foreground font-sans">
              You are not an administrator.
            </p>
            <p className="font-sans">
              Your Google account has been authenticated successfully, but you do not have permission to access the Sattavilakku administration panel.
            </p>
            <p className="text-xs text-muted-foreground pt-1 border-t border-border/60">
              உங்கள் கூகிள் கணக்கு வெற்றிகரமாக சரிபார்க்கப்பட்டது. ஆனால் சட்டவிளக்கு ஆசிரியர் நிர்வாக கட்டுப்பாட்டகத்தை அணுகும் அனுமதி இக்கணக்கிற்கு வழங்கப்படவில்லை.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={handleGoBack}
            className="w-full py-2.5 px-4 rounded-lg border border-border bg-background hover:bg-muted text-foreground font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back / பின்செல்க</span>
          </button>

          <Link
            href="/"
            className="w-full py-2.5 px-4 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <Home className="w-4 h-4" />
            <span>Return to Website / தளத்திற்குத் திரும்புக</span>
          </Link>
        </div>

        {/* Subtle Footer */}
        <div className="pt-3 border-t border-border/80 text-[11px] text-muted-foreground font-sans">
          <span>சட்டவிளக்கு • Sattavilakku Legal Magazine & News</span>
        </div>
      </div>
    </div>
  );
}
