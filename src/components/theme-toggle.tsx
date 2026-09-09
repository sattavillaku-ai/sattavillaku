'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Laptop } from 'lucide-react';

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({ showLabel = false, className = '' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        className={`inline-flex items-center justify-center p-2 rounded-md border border-border bg-card text-foreground opacity-70 hover:opacity-100 transition-colors ${className}`}
        aria-label="தீம் மாற்றவும்"
      >
        <Sun className="w-4 h-4" />
      </button>
    );
  }

  const currentIcon = () => {
    if (theme === 'dark') return <Moon className="w-4 h-4 text-rose-400" />;
    if (theme === 'light') return <Sun className="w-4 h-4 text-amber-600" />;
    return <Laptop className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-card text-foreground hover:bg-muted transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="வண்ணத் தேர்வு (Theme)"
        aria-expanded={isOpen}
      >
        {currentIcon()}
        {showLabel && (
          <span className="text-xs font-medium">
            {theme === 'dark' ? 'இரவு' : theme === 'light' ? 'பகல்' : 'கணினி'}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-md shadow-lg bg-card border border-border ring-1 ring-black/5 z-50 py-1 text-sm animate-in fade-in zoom-in-95 duration-100">
          <button
            type="button"
            onClick={() => {
              setTheme('light');
              setIsOpen(false);
            }}
            className={`w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-muted transition-colors ${
              theme === 'light' ? 'font-semibold text-primary' : 'text-foreground'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-600" />
            <span>பகல் (Light)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTheme('dark');
              setIsOpen(false);
            }}
            className={`w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-muted transition-colors ${
              theme === 'dark' ? 'font-semibold text-primary' : 'text-foreground'
            }`}
          >
            <Moon className="w-4 h-4 text-rose-400" />
            <span>இரவு (Dark)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTheme('system');
              setIsOpen(false);
            }}
            className={`w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-muted transition-colors ${
              theme === 'system' ? 'font-semibold text-primary' : 'text-foreground'
            }`}
          >
            <Laptop className="w-4 h-4 text-muted-foreground" />
            <span>தானியங்கு (System)</span>
          </button>
        </div>
      )}
    </div>
  );
}
