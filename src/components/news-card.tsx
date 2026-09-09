import React from 'react';
import Link from 'next/link';
import { Clock, ExternalLink, ArrowRight, Flame } from 'lucide-react';
import { NewsItem } from '@/types';
import { CategoryBadge } from './category-badge';
import { formatTimeTamil, formatDateTamil } from '@/lib/utils';

interface NewsCardProps {
  news: NewsItem;
  variant?: 'grid' | 'list' | 'lead';
  className?: string;
}

export function NewsCard({ news, variant = 'grid', className = '' }: NewsCardProps) {
  if (variant === 'lead') {
    return (
      <div
        className={`group bg-card border border-border rounded-lg p-5 sm:p-6 hover:border-primary/40 transition-all shadow-xs ${className}`}
      >
        <div className="flex flex-col lg:flex-row gap-6">
          {news.imageUrl && (
            <div className="lg:w-1/2 aspect-16/10 rounded-md overflow-hidden bg-muted relative">
              <img
                src={news.imageUrl}
                alt={news.headline}
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
              />
              {news.isBreaking && (
                <div className="absolute top-2.5 left-2.5 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <Flame className="w-3 h-3 fill-current" />
                  முக்கியச் செய்தி
                </div>
              )}
            </div>
          )}

          <div className="flex-1 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <CategoryBadge category={news.category} nameTamil={news.categoryNameTamil} isLink />
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimeTamil(news.publishedAt)} | {formatDateTamil(news.publishedAt)}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold font-tamil leading-snug group-hover:text-primary transition-colors">
                <Link href={`/news/${news.category}`}>{news.headline}</Link>
              </h2>

              <p className="text-muted-foreground text-sm leading-relaxed font-tamil line-clamp-3">
                {news.summary}
              </p>

              {news.source && (
                <div className="text-xs text-muted-foreground pt-1 flex items-center gap-1">
                  <span>செய்தி ஆதாரம்:</span>
                  <span className="font-semibold text-foreground">{news.source}</span>
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-border/70 flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-sans">
                நம்பகத்தன்மை: {news.relevanceScore}%
              </span>
              <Link
                href={`/news/${news.category}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <span>முழு விவரம்</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div
        className={`group flex items-start gap-4 py-3.5 border-b border-border/80 last:border-0 hover:bg-muted/30 transition-colors px-2 rounded-xs ${className}`}
      >
        {news.imageUrl && (
          <div className="w-24 sm:w-32 aspect-16/10 rounded-xs overflow-hidden shrink-0 bg-muted">
            <img
              src={news.imageUrl}
              alt={news.headline}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <CategoryBadge category={news.category} nameTamil={news.categoryNameTamil} size="sm" isLink />
            <span className="text-[11px] text-muted-foreground">{formatTimeTamil(news.publishedAt)}</span>
          </div>

          <h3 className="text-sm sm:text-base font-bold font-tamil leading-snug group-hover:text-primary transition-colors line-clamp-2">
            <Link href={`/news/${news.category}`}>{news.headline}</Link>
          </h3>

          {news.source && (
            <div className="text-[11px] text-muted-foreground mt-1">
              ஆதாரம்: <span className="text-foreground/80">{news.source}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Standard grid news card
  return (
    <div
      className={`group flex flex-col bg-card border border-border rounded-md overflow-hidden hover:border-primary/40 transition-all shadow-2xs hover:shadow-xs ${className}`}
    >
      {news.imageUrl && (
        <div className="relative aspect-16/10 w-full overflow-hidden bg-muted">
          <img
            src={news.imageUrl}
            alt={news.headline}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {news.isBreaking && (
            <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase flex items-center gap-1 shadow-sm">
              <Flame className="w-3 h-3 fill-current" />
              முக்கியச் செய்தி
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col flex-1 p-4 sm:p-5 justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <CategoryBadge category={news.category} nameTamil={news.categoryNameTamil} isLink />
            <time className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimeTamil(news.publishedAt)}
            </time>
          </div>

          <h3 className="text-base font-bold font-tamil leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-2">
            <Link href={`/news/${news.category}`}>{news.headline}</Link>
          </h3>

          <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2 leading-relaxed font-tamil">
            {news.summary}
          </p>
        </div>

        <div className="pt-3 mt-3 border-t border-border/70 flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate max-w-[130px]">ஆதாரம்: {news.source}</span>
          <Link
            href={`/news/${news.category}`}
            className="text-primary hover:underline font-semibold flex items-center gap-0.5"
          >
            <span>படிக்க</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
