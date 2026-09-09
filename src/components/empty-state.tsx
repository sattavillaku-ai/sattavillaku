import React from 'react';
import Link from 'next/link';
import { SearchX, FileQuestion, BookOpen, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: 'search' | 'article' | 'magazine';
  className?: string;
}

export function EmptyState({
  title = 'தகவல்கள் எதுவும் கிடைக்கவில்லை',
  description = 'நீங்கள் தேடிய சொல்லிற்குரிய கட்டுரைகளோ செய்திகளோ தற்போது இல்லை. தயவுசெய்து வேறு சொல்லைக் கொண்டு தேடவும்.',
  actionText,
  actionHref,
  onAction,
  icon = 'search',
  className = '',
}: EmptyStateProps) {
  const renderIcon = () => {
    switch (icon) {
      case 'magazine':
        return <BookOpen className="w-10 h-10 text-muted-foreground" />;
      case 'article':
        return <FileQuestion className="w-10 h-10 text-muted-foreground" />;
      case 'search':
      default:
        return <SearchX className="w-10 h-10 text-muted-foreground" />;
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-lg border border-dashed border-border bg-card/50 ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        {renderIcon()}
      </div>

      <h3 className="text-lg font-bold font-tamil text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed font-tamil">
        {description}
      </p>

      {actionText && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs sm:text-sm font-semibold hover:bg-primary/90 transition-colors shadow-xs"
        >
          <span>{actionText}</span>
        </Link>
      )}

      {actionText && onAction && !actionHref && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs sm:text-sm font-semibold hover:bg-primary/90 transition-colors shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}
