'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Menu, Search, User, Sun, Moon, X, BookOpen, Crown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function Header() {
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled 
          ? "border-b bg-background/95 backdrop-blur-md shadow-sm py-2" 
          : "bg-background py-4"
      )}
    >
      {/* Top Border Accent — Red gradient matching the brand */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-red-500 to-primary" />

      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* லோகோ (Logo) — Brand image */}
        <Link href="/" className="flex items-center group">
          <Image
            src="/images/sattavillaku-logo.jpeg"
            alt="சட்டவிளக்கு - Satta Vilakku"
            width={220}
            height={55}
            className="h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-105"
            priority
          />
        </Link>

        {/* டெஸ்க்டாப் (Desktop Nav) */}
        <nav className="hidden md:flex items-center gap-10 text-xs font-black uppercase tracking-widest text-foreground/80">
          <Link href="/" className="hover:text-primary transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary hover:after:w-full after:transition-all">முகப்பு</Link>
          <Link href="/issues" className="hover:text-primary transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary hover:after:w-full after:transition-all">இதழ்கள்</Link>
          <Link href="/about" className="hover:text-primary transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary hover:after:w-full after:transition-all">எங்களைப் பற்றி</Link>
          <Link href="/search" className="hover:text-primary transition-colors flex items-center gap-2">
            <Search className="h-4 w-4" />
            தேடல்
          </Link>
        </nav>

        {/* செயல்கள் (Actions) */}
        <div className="flex items-center gap-4">
          <Link href="/subscribe" className="hidden sm:flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full hover:bg-primary/90 hover:shadow-lg transition-all font-black text-[10px] uppercase tracking-wider active:scale-95">
            <Crown className="h-4 w-4" />
            சந்தா செலுத்துக
          </Link>
          
          <div className="h-8 w-px bg-border hidden sm:block mx-2" />

          <Link href="/profile" className="p-2.5 rounded-xl border border-border bg-card hover:bg-primary hover:text-white transition-all shadow-sm active:scale-95">
            <User className="h-5 w-5" />
          </Link>

          {/* மொபைல் மெனு (Mobile Toggle) */}
          <button
            className="md:hidden p-2.5 rounded-xl bg-primary text-white shadow-lg active:scale-95 transition-transform"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* மொபைல் டிராயர் (Mobile Drawer) */}
      <div 
        className={cn(
          "fixed inset-0 top-[73px] z-40 bg-background md:hidden transition-all duration-500 ease-in-out px-6",
          isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        )}
      >
        <div className="bg-white/95 rounded-[2.5rem] mt-4 p-8 border border-border/50 shadow-xl">
          <nav className="flex flex-col gap-8 text-2xl font-black font-serif text-foreground">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between border-b pb-4">
              <span>முகப்பு</span>
              <BookOpen className="h-6 w-6 opacity-20" />
            </Link>
            <Link href="/issues" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between border-b pb-4">
              <span>இதழ்கள்</span>
              <BookOpen className="h-6 w-6 opacity-20" />
            </Link>
            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between border-b pb-4">
              <span>எங்களைப் பற்றி</span>
              <BookOpen className="h-6 w-6 opacity-20" />
            </Link>
            <Link href="/subscribe" onClick={() => setIsMobileMenuOpen(false)} className="text-primary flex items-center gap-3">
              <Crown className="h-7 w-7" />
              <span>சந்தா பெறு</span>
            </Link>
          </nav>
          
          <div className="mt-12 flex items-center justify-between bg-secondary p-6 rounded-3xl text-white shadow-2xl">
            <div className="flex flex-col">
              <span className="text-xs opacity-60 uppercase font-black tracking-widest mb-1">Appearance</span>
              <span className="font-bold">தோற்றம் (Theme)</span>
            </div>
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-4 rounded-2xl bg-white/10 hover:bg-white/20"
              >
                {theme === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
