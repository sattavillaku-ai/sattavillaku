import React from 'react';

export type BadgeStatus = 'published' | 'draft' | 'review' | 'approved' | 'rejected' | 'collected' | 'processing';

interface StatusBadgeProps {
  status: BadgeStatus | string;
  className?: string;
}

const STATUS_CONFIG: Record<string, { label: string; style: string }> = {
  published: {
    label: 'வெளியிடப்பட்டது',
    style: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
  draft: {
    label: 'வரைவு (Draft)',
    style: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  review: {
    label: 'ஆய்வில் உள்ளது (Review)',
    style: 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800',
  },
  approved: {
    label: 'ஒப்புதல் பெறப்பட்டது',
    style: 'bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800',
  },
  rejected: {
    label: 'நிராகரிக்கப்பட்டது',
    style: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  },
  collected: {
    label: 'சேகரிக்கப்பட்டது',
    style: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  },
  processing: {
    label: 'செயலாக்கத்தில்...',
    style: 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  },
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status.toLowerCase()] || {
    label: status,
    style: 'bg-muted text-foreground border-border',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-xs text-[11px] font-bold border ${config.style} ${className}`}
    >
      {config.label}
    </span>
  );
}
