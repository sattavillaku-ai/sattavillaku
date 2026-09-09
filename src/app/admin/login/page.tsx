'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, ShieldAlert, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { supabase } from '@/lib/supabase';

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'கூகிள் உள்நுழைவில் பிழை ஏற்பட்டது.');
      setLoading(false);
    }
  };

  const handleBypassDemo = () => {
    // Quick entry for local evaluation without Google OAuth setup
    router.push('/admin');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-muted/30 relative font-tamil">
      {/* Top right controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <ThemeToggle />
        <Link
          href="/"
          className="text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md border border-border bg-card flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>தளத்திற்குத் திரும்புக</span>
        </Link>
      </div>

      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <BrandLogo size="lg" isLink={false} />
          </div>
          <div className="pt-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>நிர்வாக ஆசிரியர் தளம் (Admin Only)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">
              ஆசிரியர் உள்நுழைவு
            </h1>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              சட்டவிளக்கு மாத இதழ் மற்றும் நாளிதழ் பதிப்பகப் பிரிவு
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="p-3.5 rounded-lg bg-muted/60 border border-border text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <ShieldAlert className="w-4 h-4 text-primary shrink-0" />
            <span>அங்கீகரிக்கப்பட்ட அணுகல் மட்டும்:</span>
          </div>
          <p className="leading-relaxed">
            சட்டவிளக்கு ஆசிரியர் குழுமத்தின் அனுமதியளிக்கப்பட்ட கூகிள் மின்னஞ்சல் கணக்குகள் மட்டுமே நிர்வாக அமைப்பிற்குள் அனுமதிக்கப்படும்.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
            {error}
          </div>
        )}

        {/* Google OAuth Login Button Alone */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg border border-border bg-background hover:bg-muted text-foreground font-bold text-sm transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-3 disabled:opacity-60 group"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <span>கூகிள் பக்கத்திற்கு அழைத்துச் செல்லப்படுகிறது...</span>
              </>
            ) : (
              <>
                {/* Google Multi-color G Icon */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="font-sans">Google மூலம் உள்நுழைக</span>
              </>
            )}
          </button>

          {/* Quick Demo Bypass for local preview without Google setup */}
          <div className="pt-3 border-t border-border/80 text-center">
            <button
              type="button"
              onClick={handleBypassDemo}
              className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 font-semibold"
            >
              <span>டெமோ ஆசிரியர் நுழைவு (Direct Preview Access)</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-muted-foreground border-t border-border pt-3">
          <span>Supabase SSR Authentication • Google OAuth 2.0</span>
        </div>
      </div>
    </div>
  );
}
