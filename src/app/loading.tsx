import React from 'react';
import { Skeleton } from '@/components/loading-skeleton';

export default function RootLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="space-y-3 border-b border-border pb-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-3/4 max-w-lg" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <Skeleton className="aspect-16/10 w-full rounded-lg" />
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-44 w-full rounded-lg" />
          <Skeleton className="h-44 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
