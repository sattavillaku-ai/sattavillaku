'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Shield } from 'lucide-react';
import { BrandLogo } from './brand-logo';
import { ThemeToggle } from './theme-toggle';
import { MobileNav } from './mobile-nav';
import { NewsTicker } from './news-ticker';

export function PublicHeader() {
  const pathname = usePathname();

  const navLinks = [
    { label: 'முகப்பு', href: '/' },
    { label: 'இதழ்கள்', href: '/magazine' },
    { label: 'கட்டுரைகள்', href: '/articles' },
    { label: 'செய்திகள்', href: '/news' },
    { label: 'சட்டம்', href: '/news/law' },
    { label: 'அரசியல்', href: '/news/politics' },
    { label: 'தமிழ்நாடு', href: '/news/tamil-nadu' },
    { label: 'இந்தியா', href: '/news/india' },
  ];

  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur-md border-b border-border shadow-2xs">
      <NewsTicker />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <div className="flex items-center">
            <BrandLogo size="md" />
          </div>

          {/* Desktop Center Navigation */}
          <nav className="hidden xl:flex items-center space-x-1 lg:space-x-1.5" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-150 ${
                    active
                      ? 'text-primary bg-primary/10 font-bold border-b-2 border-primary rounded-b-none'
                      : 'text-foreground/80 hover:text-primary hover:bg-muted/60'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link
              href="/search"
              className="p-2 rounded-md border border-border bg-card text-foreground hover:bg-muted hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="தேடல் (Search)"
            >
              <Search className="w-4 h-4" />
            </Link>

            <ThemeToggle />

            <Link
              href="/admin/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="ஆசிரியர் உள்நுழைவு"
            >
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span>நிர்வாகம்</span>
            </Link>

            {/* Mobile Hamburger Drawer */}
            <div className="xl:hidden">
              <MobileNav />
            </div>
          </div>
        </div>

        {/* Secondary Category bar on Medium Desktops (lg:flex xl:hidden) */}
        <div className="hidden lg:flex xl:hidden border-t border-border/60 py-2 items-center justify-center space-x-3 overflow-x-auto">
          {navLinks.map((link) => {
            const active = isLinkActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
                  active ? 'bg-primary text-primary-foreground font-bold' : 'text-foreground hover:bg-muted'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
