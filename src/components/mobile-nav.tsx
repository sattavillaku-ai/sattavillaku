'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, Shield, BookOpen, Newspaper, Scale, Landmark, MapPin, Globe, HelpCircle, Phone } from 'lucide-react';
import { BrandLogo } from './brand-logo';
import { ThemeToggle } from './theme-toggle';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navItems = [
    { label: 'முகப்பு', href: '/', icon: Scale },
    { label: 'இதழ்கள்', href: '/magazine', icon: BookOpen },
    { label: 'கட்டுரைகள்', href: '/articles', icon: Newspaper },
    { label: 'செய்திகள்', href: '/news', icon: Newspaper },
    { label: 'சட்டம்', href: '/news/law', icon: Scale },
    { label: 'அரசியல்', href: '/news/politics', icon: Landmark },
    { label: 'தமிழ்நாடு', href: '/news/tamil-nadu', icon: MapPin },
    { label: 'இந்தியா', href: '/news/india', icon: Globe },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-md border border-border text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="பட்டி மெனுவை திறக்கவும்"
      >
        <Menu className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-card border-l border-border shadow-2xl flex flex-col z-50 overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <BrandLogo size="sm" showSubtext={false} />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground focus:outline-none"
                aria-label="பட்டி மெனுவை மூடவும்"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-border">
              <Link
                href="/search"
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted text-muted-foreground hover:text-foreground text-sm"
              >
                <Search className="w-4 h-4" />
                <span>தேட வேண்டிய சொல்...</span>
              </Link>
            </div>

            <div className="flex-1 px-3 py-4 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-3 mb-2">
                முதன்மைப் பகுதிகள்
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <div className="pt-4 border-t border-border my-3" />

              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-3 mb-2">
                இதழ் மற்றும் தொடர்பு
              </div>
              <Link
                href="/about"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground hover:bg-muted"
              >
                <HelpCircle className="w-4 h-4 text-muted-foreground" />
                <span>எங்களைப் பற்றி</span>
              </Link>
              <Link
                href="/contact"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground hover:bg-muted"
              >
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>தொடர்புக்கு</span>
              </Link>
              <Link
                href="/admin/login"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span>ஆசிரியர் உள்நுழைவு (Admin)</span>
              </Link>
            </div>

            <div className="p-4 border-t border-border flex items-center justify-between bg-muted/40 text-xs text-muted-foreground">
              <span>தீம் தேர்வு:</span>
              <ThemeToggle showLabel />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
