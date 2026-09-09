'use client';

import React, { useState } from 'react';
import { Share2, Check, Copy, MessageCircle, Send } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  url?: string;
  className?: string;
}

export function ShareButtons({ title, url, className = '' }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (url) return url;
    if (typeof window !== 'undefined') return window.location.href;
    return 'https://sattavilakku.com';
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const shareUrl = encodeURIComponent(getShareUrl());
  const shareTitle = encodeURIComponent(title);

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mr-1">
        <Share2 className="w-3.5 h-3.5" />
        பகிர:
      </span>

      {/* WhatsApp */}
      <a
        href={`https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 text-xs font-medium border border-[#25D366]/20 transition-colors"
        title="WhatsApp-ல் பகிர"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        <span>WhatsApp</span>
      </a>

      {/* Twitter / X */}
      <a
        href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs bg-foreground/10 text-foreground hover:bg-foreground/20 text-xs font-medium border border-border transition-colors"
        title="X (Twitter)-ல் பகிர"
      >
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <span>X</span>
      </a>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 text-xs font-medium border border-[#1877F2]/20 transition-colors"
        title="Facebook-ல் பகிர"
      >
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        <span>Facebook</span>
      </a>

      {/* Telegram */}
      <a
        href={`https://t.me/share/url?url=${shareUrl}&text=${shareTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs bg-[#229ED9]/10 text-[#229ED9] hover:bg-[#229ED9]/20 text-xs font-medium border border-[#229ED9]/20 transition-colors"
        title="Telegram-ல் பகிர"
      >
        <Send className="w-3.5 h-3.5" />
        <span>Telegram</span>
      </a>

      {/* Copy Link */}
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs border border-border bg-card text-foreground hover:bg-muted text-xs font-medium transition-colors"
        title="இணைப்பை நகலெடு"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-600 font-semibold">நகலானது!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
            <span>இணைப்பு</span>
          </>
        )}
      </button>
    </div>
  );
}
