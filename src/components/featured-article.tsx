import React from 'react';
import Link from 'next/link';
import { Clock, Calendar, ArrowRight, BookOpen } from 'lucide-react';
import { Article } from '@/types';
import { CategoryBadge } from './category-badge';
import { formatDateTamil } from '@/lib/utils';

interface FeaturedArticleProps {
  article: Article;
  className?: string;
}

export function FeaturedArticle({ article, className = '' }: FeaturedArticleProps) {
  return (
    <article
      className={`group relative grid grid-cols-1 lg:grid-cols-12 gap-6 bg-card border border-border rounded-lg overflow-hidden p-5 sm:p-7 shadow-xs hover:border-primary/50 transition-all ${className}`}
    >
      {/* Visual Image */}
      <div className="lg:col-span-7 relative aspect-16/10 rounded-md overflow-hidden bg-muted">
        {article.heroImage && (
          <img
            src={article.heroImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 lg:hidden" />
        {article.issueTitle && (
          <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs px-2.5 py-1 rounded-xs font-bold flex items-center gap-1.5 shadow-md">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{article.issueTitle}</span>
          </div>
        )}
      </div>

      {/* Editorial Content */}
      <div className="lg:col-span-5 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CategoryBadge category={article.category} nameTamil={article.categoryNameTamil} size="md" isLink />
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.readTimeMinutes} நிமிட வாசிப்பு
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-tamil text-foreground group-hover:text-primary transition-colors leading-tight">
            <Link href={`/articles/${article.slug}`}>{article.title}</Link>
          </h2>

          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-tamil line-clamp-4">
            {article.excerpt}
          </p>
        </div>

        <div className="pt-6 mt-4 border-t border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {article.author.photo && (
              <img
                src={article.author.photo}
                alt={article.author.name}
                className="w-10 h-10 rounded-full object-cover border border-border"
              />
            )}
            <div>
              <div className="text-sm font-bold font-tamil text-foreground">{article.author.name}</div>
              <div className="text-xs text-muted-foreground">{article.author.role}</div>
            </div>
          </div>

          <Link
            href={`/articles/${article.slug}`}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground font-semibold text-xs sm:text-sm hover:bg-primary/90 transition-colors shadow-xs"
          >
            <span>கட்டுரையைப் படிக்க</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
