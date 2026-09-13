'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log sanitized error safely to server/monitoring
    console.error('Unhandled application error:', error.message);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center font-tamil">
      <div className="max-w-md w-full space-y-6">
        <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            தற்போது உள்ளடக்கத்தை ஏற்ற முடியவில்லை
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            தற்காலிகத் தொழில்நுட்பத் தடை ஏற்பட்டுள்ளது. தயவுசெய்து உங்கள் பக்கத்தைப் புதுப்பித்து மீண்டும் முயற்சிக்கவும்.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground text-xs sm:text-sm font-bold hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>மீண்டும் முயற்சிக்கவும் (Retry)</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-border bg-card text-foreground text-xs sm:text-sm font-bold hover:bg-muted transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>முகப்பிற்குத் திரும்பு</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
