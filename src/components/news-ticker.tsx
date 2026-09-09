'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, ChevronRight, Calendar } from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { NewsItem } from '@/types';

export function NewsTicker() {
  const [breakingNews, setBreakingNews] = useState<NewsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [todayFormatted, setTodayFormatted] = useState('');

  useEffect(() => {
    const items = dataService.getBreakingNews();
    if (items.length > 0) {
      setBreakingNews(items);
    } else {
      setBreakingNews(dataService.getPublishedNews().slice(0, 3));
    }

    try {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat('ta-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(now);
      setTodayFormatted(formatted);
    } catch {
      setTodayFormatted('செப்டம்பர் 2026');
    }
  }, []);

  useEffect(() => {
    if (breakingNews.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % breakingNews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [breakingNews.length]);

  const currentStory = breakingNews[currentIndex];

  return (
    <div className="w-full bg-muted/70 border-b border-border text-xs text-muted-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Date & Edition info */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <span className="font-medium text-foreground">{todayFormatted}</span>
          <span className="text-border">|</span>
          <span>சென்னை பதிப்பு</span>
          <span className="text-border">|</span>
          <span className="text-[11px] font-sans">RNI: TN-TAM/2022/84920</span>
        </div>

        {/* Breaking News alert */}
        {currentStory && (
          <div className="flex items-center gap-2 overflow-hidden w-full sm:w-auto flex-1 sm:justify-end">
            <span className="shrink-0 inline-flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-xs tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              முக்கியச் செய்தி
            </span>
            <Link
              href={`/news/${currentStory.category}`}
              className="truncate text-foreground hover:text-primary transition-colors flex items-center gap-1 group font-medium"
            >
              <span className="truncate">{currentStory.headline}</span>
              <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-primary shrink-0" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
