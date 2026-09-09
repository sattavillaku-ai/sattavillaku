import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'தகவல்களை ஏற்றுவதில் பிழை ஏற்பட்டது',
  message = 'சர்வர் இணைப்பில் தற்காலிகத் தடை ஏற்பட்டுள்ளது. தயவுசெய்து உங்கள் இணைய இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.',
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-lg border border-destructive/20 bg-destructive/5 ${className}`}
    >
      <div className="w-14 h-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7" />
      </div>

      <h3 className="text-lg font-bold font-tamil text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed font-tamil">
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs sm:text-sm font-semibold hover:bg-primary/90 transition-colors shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>மீண்டும் முயற்சிக்க (Retry)</span>
        </button>
      )}
    </div>
  );
}
