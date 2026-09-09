'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      className={`flex items-center justify-center space-x-1 sm:space-x-2 py-6 ${className}`}
      aria-label="பக்க வரிசை"
    >
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm font-medium transition-colors"
        aria-label="முந்தைய பக்கம்"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">முந்தையது</span>
      </button>

      {pages.map((page) => {
        const isCurrent = page === currentPage;
        return (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-md text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center ${
              isCurrent
                ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                : 'bg-card border border-border text-foreground hover:bg-muted'
            }`}
            aria-current={isCurrent ? 'page' : undefined}
          >
            {page}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm font-medium transition-colors"
        aria-label="அடுத்த பக்கம்"
      >
        <span className="hidden sm:inline">அடுத்தது</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}
