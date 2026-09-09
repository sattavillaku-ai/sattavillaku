'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Globe, Shield, User } from 'lucide-react';
import { ThemeToggle } from '../theme-toggle';
import { getCurrentAdminUser } from '@/lib/auth-service';

interface AdminHeaderProps {
  onOpenMobileSidebar: () => void;
}

const SECTION_TITLES: Record<string, string> = {
  '/admin': 'முதன்மை கட்டுப்பாட்டகம் (Overview)',
  '/admin/issues': 'மாத இதழ்கள் மேலாண்மை (Magazine Issues)',
  '/admin/issues/new': 'புதிய இதழ் உருவாக்கம் (New Issue)',
  '/admin/articles': 'கட்டுரைகள் மேலாண்மை (Articles CMS)',
  '/admin/articles/new': 'புதிய கட்டுரை எழுதுதல் (Write Article)',
  '/admin/news': 'செய்தி ஓடை (Collected News Feed)',
  '/admin/news/review': 'AI செய்தி சரிபார்ப்பு & ஒப்புதல் (Review Pipeline)',
  '/admin/media': 'ஊடக நூலகம் (Media Library)',
  '/admin/categories': 'பிரிவுகள் மேலாண்மை (Categories)',
  '/admin/authors': 'ஆசிரியர் குழு (Authors & Columnists)',
  '/admin/settings': 'தள அமைப்புகள் (Settings)',
};

export function AdminHeader({ onOpenMobileSidebar }: AdminHeaderProps) {
  const pathname = usePathname();
  const [adminUser, setAdminUser] = useState<{
    name: string;
    email: string | undefined;
    avatar: string | null;
  }>({
    name: 'கே. எஸ். இளங்கோவன்',
    email: 'editor@sattavilakku.com',
    avatar: null,
  });

  useEffect(() => {
    async function loadUser() {
      const user = await getCurrentAdminUser();
      if (user) {
        setAdminUser({
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        });
      }
    }
    loadUser();
  }, []);

  const title = SECTION_TITLES[pathname] || 'நிர்வாகப் பிரிவு';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-card border-b border-border shadow-2xs font-tamil">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-md border border-border text-foreground hover:bg-muted focus:outline-none"
          aria-label="பட்டி மெனு"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-sm sm:text-base font-bold text-foreground truncate max-w-[220px] sm:max-w-md">
            {title}
          </h1>
          <div className="text-[11px] text-muted-foreground hidden sm:block">
            சட்டவிளக்கு ஆசிரியர் நிர்வாக தளம் • Supabase Auth Active
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-background text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          title="பொது வலைதளத்தைப் பார்க்க"
        >
          <Globe className="w-3.5 h-3.5 text-primary" />
          <span>தளப் பார்வை</span>
        </Link>

        <ThemeToggle />

        {/* Admin Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-border">
          {adminUser.avatar ? (
            <img
              src={adminUser.avatar}
              alt={adminUser.name}
              className="w-8 h-8 rounded-full object-cover border border-primary/40 shadow-2xs"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs border border-primary/30">
              {adminUser.name.charAt(0)}
            </div>
          )}
          <div className="hidden md:block text-left leading-tight max-w-[140px]">
            <div className="text-xs font-bold text-foreground truncate">{adminUser.name}</div>
            <div className="text-[10px] text-primary font-semibold truncate font-sans">
              {adminUser.email || 'நிர்வாக ஆசிரியர்'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
