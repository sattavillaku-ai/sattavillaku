'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Menu, Search, User, Sun, Moon, Scale, X } from 'lucide-react';
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
          ? "border-b bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 py-2" 
          : "bg-transparent py-4"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* லோகோ (Logo) */}
        <Link href="/" className="flex items-center gap-2 group">
          <Scale className="h-7 w-7 text-primary transition-transform group-hover:rotate-12" />
          <span className="font-serif text-2xl font-bold tracking-tight text-primary">சட்டவிளக்கு</span>
        </Link>

        {/* டெஸ்க்டாப் (Desktop Nav) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/" className="hover:text-primary transition-colors">முகப்பு</Link>
          <Link href="/issues" className="hover:text-primary transition-colors">இதழ்கள்</Link>
          <Link href="/search" className="hover:text-primary transition-colors flex items-center gap-1">
            <Search className="h-4 w-4" />
            தேடல்
          </Link>
          <Link href="/subscribe" className="bg-primary text-primary-foreground px-4 py-2 rounded-full hover:bg-primary/90 transition-all font-bold">
            சந்தா (₹30/மாதம்)
          </Link>
        </nav>

        {/* செயல்கள் (Actions) */}
        <div className="flex items-center gap-2">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-accent transition-colors hidden sm:flex"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          )}
          
          <Link href="/profile" className="p-2 rounded-full hover:bg-accent transition-colors">
            <User className="h-5 w-5" />
          </Link>

          {/* மொபைல் மெனு (Mobile Toggle) */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-accent"
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
          "fixed inset-0 top-16 z-40 bg-background md:hidden transition-transform duration-300 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <nav className="flex flex-col p-8 gap-6 text-xl font-bold font-serif">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary">முகப்பு</Link>
          <Link href="/issues" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary">இதழ்கள்</Link>
          <Link href="/search" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary">தேடல்</Link>
          <Link href="/subscribe" onClick={() => setIsMobileMenuOpen(false)} className="text-primary">சந்தா பெறு (₹30/மாதம்)</Link>
          
          <div className="mt-8 pt-8 border-t flex items-center justify-between">
            <span className="text-sm font-sans font-medium">தோற்றம் (Theme)</span>
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-3 rounded-full bg-accent"
              >
                {theme === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
