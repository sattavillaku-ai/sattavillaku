import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted/80 dark:bg-muted/40 ${className}`}
      aria-hidden="true"
    />
  );
}

export function ArticleCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-md overflow-hidden p-4 space-y-4">
      <Skeleton className="aspect-16/10 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      <div className="pt-4 border-t border-border/60 flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

export function NewsCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-md overflow-hidden p-4 space-y-3">
      <Skeleton className="aspect-16/10 w-full" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-5 w-4/5" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  );
}

export function IssueCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-md p-4 space-y-3">
      <Skeleton className="aspect-3/4 w-full" />
      <Skeleton className="h-5 w-4/5" />
      <Skeleton className="h-4 w-full" />
      <div className="pt-2 border-t border-border flex justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b border-border/60">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}
