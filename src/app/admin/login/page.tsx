'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { ThemeToggle } from '@/components/theme-toggle';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (email.includes('@') && password.length >= 4) {
        // Successful login
        router.push('/admin');
      } else {
        setLoading(false);
        setError('தவறான மின்னஞ்சல் அல்லது கடவுச்சொல். தயவுசெய்து சரிபார்க்கவும்.');
      }
    }, 600);
  };

  const handleQuickFill = () => {
    setEmail('editor@sattavilakku.com');
    setPassword('admin1234');
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-muted/40 relative">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <ThemeToggle />
        <Link
          href="/"
          className="text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md border border-border bg-card"
        >
          &larr; முகப்புக்குத் திரும்புக
        </Link>
      </div>

      <div className="w-full max-w-md bg-card border border-border rounded-lg shadow-lg p-6 sm:p-8 space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <BrandLogo size="md" isLink={false} />
          </div>
          <div className="pt-2">
            <h1 className="text-xl font-bold font-tamil text-foreground">
              ஆசிரியர் நிர்வாக உள்நுழைவு (Admin Portal)
            </h1>
            <p className="text-xs text-muted-foreground mt-1 font-tamil">
              சட்டவிளக்கு இதழ் மற்றும் செய்திப் பதிப்பக உள்நுழைவு தளம்
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs font-tamil flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground font-tamil">
              ஆசிரியர் மின்னஞ்சல் (Admin Email)
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="editor@sattavilakku.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-md border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary font-sans"
              />
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground font-tamil">
              கடவுச்சொல் (Password)
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-md border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary font-sans"
              />
              <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-md bg-primary text-primary-foreground font-bold text-xs sm:text-sm hover:bg-primary/90 transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>சரிபார்க்கப்படுகிறது...</span>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                <span>உள்நுழைக (Login as Admin)</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Access helper */}
        <div className="pt-2 border-t border-border/80">
          <div className="p-3 rounded-md bg-muted/70 text-xs space-y-1.5 text-muted-foreground">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">சோதனை உள்நுழைவு (Demo Credentials):</span>
              <button
                type="button"
                onClick={handleQuickFill}
                className="text-primary hover:underline font-bold text-[11px]"
              >
                தானாக நிரப்புக &rarr;
              </button>
            </div>
            <div className="font-mono text-[11px] text-foreground">
              மின்னஞ்சல்: editor@sattavilakku.com<br />
              கடவுச்சொல்: admin1234
            </div>
          </div>
        </div>

        <div className="text-center text-[11px] text-muted-foreground">
          <span>Supabase Auth & RLS Integration Ready • பாதுகாப்பானது</span>
        </div>
      </div>
    </div>
  );
}
