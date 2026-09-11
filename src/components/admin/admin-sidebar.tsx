'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Newspaper,
  Sparkles,
  Image as ImageIcon,
  FolderTree,
  Users,
  Settings,
  Globe,
  LogOut,
  X
} from 'lucide-react';
import { BrandLogo } from '../brand-logo';

interface AdminSidebarProps {
  onCloseMobile?: () => void;
  className?: string;
}

export function AdminSidebar({ onCloseMobile, className = '' }: AdminSidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: 'கட்டுப்பாட்டகம் (Dashboard)', href: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'மாத இதழ்கள் (Issues)', href: '/admin/issues', icon: BookOpen },
    { name: 'கட்டுரைகள் (Articles)', href: '/admin/articles', icon: FileText },
    { name: 'செய்திகள் (News Feed)', href: '/admin/news', icon: Newspaper, exact: true },
    { name: 'AI செய்தி சரிபார்ப்பு (Review)', href: '/admin/news/review', icon: Sparkles, badge: '3' },
    { name: 'மீடியா நூலகம் (Media)', href: '/admin/media', icon: ImageIcon },
    { name: 'பிரிவுகள் (Categories)', href: '/admin/categories', icon: FolderTree },
    { name: 'ஆசிரியர்கள் (Authors)', href: '/admin/authors', icon: Users },
    { name: 'அமைப்புகள் (Settings)', href: '/admin/settings', icon: Settings },
  ];

  const isActive = (item: typeof navigation[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + '/');
  };

  return (
    <aside className={`flex flex-col h-full bg-card border-r border-border text-foreground select-none ${className}`}>
      {/* Brand & Mobile Close */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <BrandLogo size="sm" showSubtext={false} isLink={false} />
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-md hover:bg-muted text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Admin Role Tag */}
      <div className="px-4 py-2 bg-muted/50 border-b border-border text-[11px] flex items-center justify-between">
        <span className="font-bold text-primary font-tamil">ஆசிரியர் நிர்வாகம்</span>
        <span className="font-mono text-muted-foreground text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-xs">
          ADMIN CMS
        </span>
      </div>

      {/* Main Nav */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors font-tamil ${
                active
                  ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                  : 'text-foreground/80 hover:bg-muted hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                <span className="truncate">{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    active ? 'bg-white text-primary' : 'bg-primary text-primary-foreground'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Quick Links */}
      <div className="p-3 border-t border-border bg-muted/30 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-tamil"
        >
          <Globe className="w-4 h-4 text-muted-foreground" />
          <span>தளத்தைப் பார்க்க (Live Site)</span>
        </Link>
        <button
          type="button"
          onClick={async () => {
            try {
              const { createClient } = await import('@/lib/supabase/client');
              const supabase = createClient();
              await supabase.auth.signOut();
            } catch (e) {}
            window.location.href = '/admin/login';
          }}
          className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors font-tamil"
        >
          <LogOut className="w-4 h-4" />
          <span>வெளியேறு (Logout)</span>
        </button>
      </div>
    </aside>
  );
}
