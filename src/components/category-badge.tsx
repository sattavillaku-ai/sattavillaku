import React from 'react';
import Link from 'next/link';

interface CategoryBadgeProps {
  category: string;
  nameTamil?: string;
  size?: 'sm' | 'md';
  isLink?: boolean;
  className?: string;
}

const CATEGORY_NAMES: Record<string, string> = {
  law: 'சட்டம்',
  politics: 'அரசியல்',
  'tamil-nadu': 'தமிழ்நாடு',
  india: 'இந்தியா',
  'special-article': 'சிறப்புக் கட்டுரை',
  magazine: 'இதழ்',
};

const CATEGORY_STYLES: Record<string, string> = {
  law: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900',
  politics: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900',
  'tamil-nadu': 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
  india: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-900',
  'special-article': 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-900',
  magazine: 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-300 border-stone-200 dark:border-stone-700',
};

export function CategoryBadge({
  category,
  nameTamil,
  size = 'sm',
  isLink = false,
  className = '',
}: CategoryBadgeProps) {
  const normalized = category?.toLowerCase() || 'law';
  const label = nameTamil || CATEGORY_NAMES[normalized] || category;
  const style = CATEGORY_STYLES[normalized] || 'bg-muted text-foreground border-border';

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  const badge = (
    <span
      className={`inline-flex items-center font-bold font-tamil rounded-xs border tracking-wide uppercase transition-colors ${sizeClasses} ${style} ${className}`}
    >
      {label}
    </span>
  );

  if (isLink) {
    return (
      <Link href={`/articles/${normalized}`} className="inline-block hover:opacity-85 focus:outline-none">
        {badge}
      </Link>
    );
  }

  return badge;
}
