'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { fetchPublishedPublicNews } from '@/lib/cms-service';
import { NewsItem } from '@/types';

export function NewsTicker() {
  const [breakingNews, setBreakingNews] = useState<NewsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [todayFormatted, setTodayFormatted] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Check prefers-reduced-motion
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      if (mediaQuery.matches) {
        setIsPaused(true);
      }
      const listener = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
        if (e.matches) setIsPaused(true);
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }

    async function loadNews() {
      try {
        const liveNews = await fetchPublishedPublicNews({ limit: 6 });
        if (isMounted) {
          if (liveNews && liveNews.length > 0) {
            setBreakingNews(liveNews);
          } else {
            const fallback = dataService.getBreakingNews();
            setBreakingNews(fallback.length > 0 ? fallback : dataService.getPublishedNews().slice(0, 4));
          }
        }
      } catch {
        if (isMounted) {
          const fallback = dataService.getBreakingNews();
          setBreakingNews(fallback.length > 0 ? fallback : dataService.getPublishedNews().slice(0, 4));
        }
      }
    }

    loadNews();

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

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (breakingNews.length <= 1 || isPaused || prefersReducedMotion) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % breakingNews.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [breakingNews.length, isPaused, prefersReducedMotion]);

  const currentStory = breakingNews[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? breakingNews.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % breakingNews.length);
  };

  return (
    <div
      className="w-full bg-muted/70 border-b border-border text-xs text-muted-foreground"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => !prefersReducedMotion && setIsPaused(false)}
    >
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

        {/* Breaking News alert & Controls */}
        {currentStory && (
          <div className="flex items-center gap-2 overflow-hidden w-full sm:w-auto flex-1 sm:justify-end">
            <span className="shrink-0 inline-flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-xs tracking-wider uppercase">
              {!prefersReducedMotion && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
              முக்கியச் செய்தி
            </span>

            <Link
              href={currentStory.sourceUrl && currentStory.sourceUrl.startsWith('/') ? currentStory.sourceUrl : `/news/${currentStory.category}`}
              className="truncate text-foreground hover:text-primary transition-colors flex items-center gap-1 group font-medium text-xs font-tamil"
            >
              <span className="truncate">{currentStory.headline}</span>
            </Link>

            {/* Manual Ticker Controls */}
            {breakingNews.length > 1 && (
              <div className="flex items-center gap-0.5 shrink-0 ml-1">
                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-1 rounded-xs hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={isPaused ? 'செய்தி ஓட்டத்தைத் தொடங்கு' : 'செய்தி ஓட்டத்தை நிறுத்து'}
                  title={isPaused ? 'தொடங்கு' : 'நிறுத்து'}
                >
                  {isPaused ? <Play className="w-2.5 h-2.5" /> : <Pause className="w-2.5 h-2.5" />}
                </button>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-1 rounded-xs hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="முந்தைய முக்கியச் செய்தி"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="p-1 rounded-xs hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="அடுத்த முக்கியச் செய்தி"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
