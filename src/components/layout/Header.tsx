'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Menu, Search, User, Sun, Moon, X, BookOpen, Crown, ShieldAlert } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();
  const isAdminPath = pathname.startsWith('/admin');

  const supabase = createClient();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isAdminPath) return;
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Check initial user role
    const checkUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setIsAdmin(userData?.role === 'admin');
      } else {
        setIsAdmin(false);
      }
    };

    checkUserRole();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setIsAdmin(userData?.role === 'admin');
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      subscription.unsubscribe();
    };
  }, [isAdminPath]);

  if (isAdminPath) return null;

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled 
          ? "border-b bg-background/95 backdrop-blur-md shadow-md py-2 border-border/80" 
          : "bg-background py-4 md:py-6"
      )}
    >
      {/* Top Border Accent — Red gradient matching the brand */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-red-500 to-primary" />

      <div className={cn(
        "container mx-auto flex items-center justify-between px-4 transition-all duration-300 relative z-50",
        isScrolled ? "h-14" : "h-16 md:h-24"
      )}>
        {/* லோகோ (Logo) — Brand image */}
        <Link href="/" className="flex items-center group">
          <Image
            src="/images/sattavillaku-logo.jpeg"
            alt="சட்டவிளக்கு - Satta Vilakku"
            width={450}
            height={97}
            className={cn(
              "w-auto object-contain transition-all duration-300 group-hover:scale-105",
              isScrolled 
                ? "h-9 md:h-11" 
                : "h-12 sm:h-14 md:h-20"
            )}
            priority
          />
        </Link>

        {/* டெஸ்க்டாப் (Desktop Nav) */}
        <nav className="hidden md:flex items-center gap-10 text-xs font-black uppercase tracking-widest text-foreground/80">
          <Link href="/" className="hover:text-primary transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary hover:after:w-full after:transition-all">முகப்பு</Link>
          <Link href="/issues" className="hover:text-primary transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary hover:after:w-full after:transition-all">இதழ்கள்</Link>
          <Link href="/about" className="hover:text-primary transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary hover:after:w-full after:transition-all">எங்களைப் பற்றி</Link>
          {isAdmin && (
            <Link href="/admin/issues" className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4" />
              நிர்வாகம் (Admin)
            </Link>
          )}
          <Link href="/search" className="hover:text-primary transition-colors flex items-center gap-2">
            <Search className="h-4 w-4" />
            தேடல்
          </Link>
        </nav>

        {/* செயல்கள் (Actions) */}
        <div className="flex items-center gap-4">
          <Link 
            href={isAdmin ? "/admin/issues" : "/login"} 
            className="p-2.5 rounded-xl border border-border bg-card hover:bg-primary hover:text-white transition-all shadow-sm active:scale-95 flex items-center gap-2"
            title={isAdmin ? "நிர்வாக பலகை (Admin Dashboard)" : "உள்நுழைவு (Login)"}
          >
            <User className="h-5 w-5" />
            {isAdmin && <span className="hidden sm:inline text-xs font-black uppercase tracking-wider">Admin</span>}
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
          "fixed inset-0 z-40 bg-background md:hidden transition-all duration-500 ease-in-out px-6",
          isMobileMenuOpen ? "top-0 pt-20 md:pt-28 opacity-100 translate-y-0" : "top-full opacity-0 -translate-y-4 pointer-events-none"
        )}
      >
        <div className="bg-card rounded-[2.5rem] mt-4 p-8 border border-border/50 shadow-xl">
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
            {isAdmin && (
              <Link href="/admin/issues" onClick={() => setIsMobileMenuOpen(false)} className="text-primary flex items-center justify-between border-b pb-4">
                <span>நிர்வாகம் (Admin Dashboard)</span>
                <ShieldAlert className="h-6 w-6" />
              </Link>
            )}
            {!isAdmin && (
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-primary flex items-center justify-between border-b pb-4">
                <span>உள்நுழைவு (Login)</span>
                <User className="h-6 w-6 opacity-20" />
              </Link>
            )}
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
