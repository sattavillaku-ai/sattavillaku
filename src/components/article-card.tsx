import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Calendar, BookOpen } from 'lucide-react';
import { Article } from '@/types';
import { CategoryBadge } from './category-badge';
import { formatDateTamil } from '@/lib/utils';

interface ArticleCardProps {
  article: Article;
  layout?: 'standard' | 'horizontal' | 'compact';
  className?: string;
}

export function ArticleCard({ article, layout = 'standard', className = '' }: ArticleCardProps) {
  if (layout === 'horizontal') {
    return (
      <article
        className={`group flex flex-col sm:flex-row gap-4 sm:gap-6 bg-card border border-border rounded-md overflow-hidden p-4 sm:p-5 hover:border-primary/50 transition-all shadow-2xs hover:shadow-xs ${className}`}
      >
        <div className="relative w-full sm:w-56 md:w-64 h-48 sm:h-auto shrink-0 overflow-hidden rounded-xs bg-muted">
          {article.heroImage ? (
            <img
              src={article.heroImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs font-tamil">
              சட்டவிளக்கு
            </div>
          )}
          {article.issueTitle && (
            <div className="absolute top-2 left-2 bg-primary/90 backdrop-blur-xs text-primary-foreground text-[10px] px-2 py-0.5 rounded-xs font-bold flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              <span>இதழ் கட்டுரை</span>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between flex-1 py-1">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CategoryBadge category={article.category} nameTamil={article.categoryNameTamil} isLink />
              {article.readTimeMinutes && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {article.readTimeMinutes} நிமிடம்
                </span>
              )}
            </div>

            <h3 className="text-lg sm:text-xl font-bold font-tamil text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
              <Link href={`/articles/${article.slug}`}>{article.title}</Link>
            </h3>

            <p className="text-muted-foreground text-sm line-clamp-2 mt-2 leading-relaxed font-tamil">
              {article.excerpt}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 mt-3 border-t border-border/60 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground font-tamil">{article.author.name}</span>
            </div>
            <time dateTime={article.publishedAt} className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDateTamil(article.publishedAt)}
            </time>
          </div>
        </div>
      </article>
    );
  }

  if (layout === 'compact') {
    return (
      <article className={`group py-3 border-b border-border/80 last:border-0 ${className}`}>
        <div className="flex items-center gap-2 mb-1.5">
          <CategoryBadge category={article.category} nameTamil={article.categoryNameTamil} size="sm" isLink />
          <span className="text-[11px] text-muted-foreground">{formatDateTamil(article.publishedAt)}</span>
        </div>
        <h4 className="text-sm font-bold font-tamil leading-snug group-hover:text-primary transition-colors line-clamp-2">
          <Link href={`/articles/${article.slug}`}>{article.title}</Link>
        </h4>
      </article>
    );
  }

  // Standard vertical card
  return (
    <article
      className={`group flex flex-col bg-card border border-border rounded-md overflow-hidden hover:border-primary/50 transition-all shadow-2xs hover:shadow-xs ${className}`}
    >
      <div className="relative aspect-16/10 w-full overflow-hidden bg-muted">
        {article.heroImage ? (
          <img
            src={article.heroImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs font-tamil">
            சட்டவிளக்கு
          </div>
        )}
        {article.issueTitle && (
          <div className="absolute top-2 left-2 bg-primary/90 backdrop-blur-xs text-primary-foreground text-[10px] px-2 py-0.5 rounded-xs font-bold flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            <span>இதழ் கட்டுரை</span>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-4 sm:p-5 justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CategoryBadge category={article.category} nameTamil={article.categoryNameTamil} isLink />
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.readTimeMinutes} நிமிடம்
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold font-tamil text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2 mb-2">
            <Link href={`/articles/${article.slug}`}>{article.title}</Link>
          </h3>

          <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2 leading-relaxed font-tamil">
            {article.excerpt}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 mt-3 border-t border-border/60 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground truncate max-w-[140px]">{article.author.name}</span>
          <time dateTime={article.publishedAt}>{formatDateTamil(article.publishedAt)}</time>
        </div>
      </div>
    </article>
  );
}
