import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtext?: boolean;
  className?: string;
  isLink?: boolean;
}

export function BrandLogo({
  size = 'md',
  showSubtext = true,
  className = '',
  isLink = true,
}: BrandLogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl sm:text-4xl',
  };

  const content = (
    <div className={`flex items-center gap-2.5 sm:gap-3 group ${className}`}>
      {/* Law & Journalism Seal / Emblem */}
      <div
        className={`${iconSizes[size]} shrink-0 rounded-md bg-primary text-primary-foreground flex items-center justify-center shadow-xs border border-primary/20 transition-transform group-hover:scale-105`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4/5 h-4/5 text-primary-foreground"
        >
          {/* Base pillar */}
          <path d="M6 26h20M9 26V23h14v3M16 23V11" />
          {/* Scales balance bar */}
          <path d="M8 11h16" />
          {/* Left scale pan */}
          <path d="M8 11l-3 6h6l-3-6z" />
          {/* Right scale pan */}
          <path d="M24 11l-3 6h6l-3-6z" />
          {/* Flame of truth (விளக்கு / Lamp) */}
          <path
            d="M16 5c1.5 1.5 2 3.5 0 5-2-1.5-1.5-3.5 0-5z"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      </div>

      <div className="flex flex-col leading-tight">
        <span
          className={`${titleSizes[size]} font-extrabold tracking-tight font-tamil text-foreground group-hover:text-primary transition-colors`}
        >
          சட்டவிளக்கு
        </span>
        {showSubtext && (
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
            SATTAVILAKKU <span className="text-primary/70">• சட்டம் & இதழியல்</span>
          </span>
        )}
      </div>
    </div>
  );

  if (isLink) {
    return (
      <Link href="/" className="inline-block focus:outline-none focus:ring-2 focus:ring-primary rounded-md">
        {content}
      </Link>
    );
  }

  return content;
}
