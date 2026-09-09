'use client';

import React from 'react';
import { Type, ZoomIn, ZoomOut, RotateCcw, BookOpen, Printer } from 'lucide-react';

interface ReadingControlsProps {
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  setFontSize: (size: 'sm' | 'base' | 'lg' | 'xl') => void;
  readingMode: boolean;
  setReadingMode: (mode: boolean) => void;
  className?: string;
}

export function ReadingControls({
  fontSize,
  setFontSize,
  readingMode,
  setReadingMode,
  className = '',
}: ReadingControlsProps) {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 p-3 rounded-md bg-muted/50 border border-border text-xs text-muted-foreground ${className}`}
    >
      <div className="flex items-center gap-1.5">
        <span className="font-semibold text-foreground mr-1 flex items-center gap-1">
          <Type className="w-3.5 h-3.5 text-primary" />
          எழுத்தளவு:
        </span>

        {/* Small */}
        <button
          type="button"
          onClick={() => setFontSize('sm')}
          className={`px-2 py-1 rounded-xs border text-xs font-bold transition-colors ${
            fontSize === 'sm'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card border-border text-foreground hover:bg-muted'
          }`}
          title="சிறிய எழுத்து"
        >
          A-
        </button>

        {/* Normal */}
        <button
          type="button"
          onClick={() => setFontSize('base')}
          className={`px-2 py-1 rounded-xs border text-xs font-bold transition-colors ${
            fontSize === 'base'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card border-border text-foreground hover:bg-muted'
          }`}
          title="இயல்பான அளவு"
        >
          A
        </button>

        {/* Large */}
        <button
          type="button"
          onClick={() => setFontSize('lg')}
          className={`px-2 py-1 rounded-xs border text-xs font-bold transition-colors ${
            fontSize === 'lg'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card border-border text-foreground hover:bg-muted'
          }`}
          title="பெரிய எழுத்து"
        >
          A+
        </button>

        {/* Extra Large */}
        <button
          type="button"
          onClick={() => setFontSize('xl')}
          className={`px-2 py-1 rounded-xs border text-xs font-bold transition-colors ${
            fontSize === 'xl'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card border-border text-foreground hover:bg-muted'
          }`}
          title="மிகப் பெரிய எழுத்து"
        >
          A++
        </button>

        {/* Reset */}
        <button
          type="button"
          onClick={() => setFontSize('base')}
          className="p-1 rounded-xs border border-border bg-card text-muted-foreground hover:text-foreground ml-1"
          title="மீட்டமை"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* Distraction-free reading mode toggle */}
        <button
          type="button"
          onClick={() => setReadingMode(!readingMode)}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xs border transition-colors ${
            readingMode
              ? 'bg-primary text-primary-foreground border-primary font-semibold'
              : 'bg-card border-border text-foreground hover:bg-muted'
          }`}
          title="வாசிப்பு முறை (Focus mode)"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{readingMode ? 'இயல்பு முறை' : 'வாசிப்பு முறை'}</span>
        </button>

        {/* Print article */}
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs border border-border bg-card text-foreground hover:bg-muted transition-colors"
          title="அச்சிடுக"
        >
          <Printer className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="hidden sm:inline">அச்சிட</span>
        </button>
      </div>
    </div>
  );
}
