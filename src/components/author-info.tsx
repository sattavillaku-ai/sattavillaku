import React from 'react';
import { Author } from '@/types';

interface AuthorInfoProps {
  author: Author;
  layout?: 'card' | 'inline';
  className?: string;
}

export function AuthorInfo({ author, layout = 'card', className = '' }: AuthorInfoProps) {
  if (layout === 'inline') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {author.photo && (
          <img
            src={author.photo}
            alt={author.name}
            className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
          />
        )}
        <div>
          <div className="text-sm font-bold font-tamil text-foreground">{author.name}</div>
          <div className="text-xs text-muted-foreground">{author.role}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-5 rounded-md border border-border bg-card shadow-2xs flex flex-col sm:flex-row items-center sm:items-start gap-4 ${className}`}>
      {author.photo && (
        <img
          src={author.photo}
          alt={author.name}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-primary/20 shrink-0"
        />
      )}
      <div className="text-center sm:text-left space-y-1.5 flex-1">
        <div className="text-base sm:text-lg font-bold font-tamil text-foreground">{author.name}</div>
        <div className="text-xs font-semibold text-primary">{author.role}</div>
        <p className="text-xs sm:text-sm text-muted-foreground font-tamil leading-relaxed">{author.bio}</p>
        {author.articlesCount && (
          <div className="text-[11px] text-muted-foreground pt-1">
            வெளியிடப்பட்ட கட்டுரைகள்: <span className="font-semibold text-foreground">{author.articlesCount}</span>
          </div>
        )}
      </div>
    </div>
  );
}
