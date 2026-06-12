'use client';

import { useState } from 'react';
import { Download, Lock, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface DownloadPDFButtonProps {
  issueSlug: string;
  isSubscriber: boolean;
  pdfAvailable: boolean;
  className?: string;
}

export function DownloadPDFButton({ 
  issueSlug, 
  isSubscriber, 
  pdfAvailable,
  className 
}: DownloadPDFButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const router = useRouter();

  const handleDownload = async () => {
    if (!isSubscriber) {
      router.push('/subscribe');
      return;
    }

    if (!pdfAvailable) return;

    setIsDownloading(true);
    try {
      const res = await fetch(`/api/issues/${issueSlug}/download-pdf`);
      const data = await res.json();

      if (data.signedUrl) {
        window.open(data.signedUrl, '_blank');
      } else {
        alert(data.message || 'பிழை ஏற்பட்டது');
      }
    } catch (error) {
      alert('பதிவிறக்குவதில் பிழை ஏற்பட்டது.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading || (isSubscriber && !pdfAvailable)}
      className={cn(
        "flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all shadow-sm",
        !isSubscriber 
          ? "bg-muted text-muted-foreground hover:bg-accent border-2 border-dashed"
          : (pdfAvailable ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed"),
        className
      )}
      title={!isSubscriber ? "₹30/மாதம் சந்தா எடுத்து PDF பதிவிறக்குங்கள்" : ""}
    >
      {isDownloading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>பதிவிறக்குகிறது...</span>
        </>
      ) : !isSubscriber ? (
        <>
          <Lock className="h-5 w-5" />
          <span>PDF பதிவிறக்கம்</span>
        </>
      ) : !pdfAvailable ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>PDF தயாராகிறது...</span>
        </>
      ) : (
        <>
          <Download className="h-5 w-5" />
          <span>PDF பதிவிறக்கம்</span>
        </>
      )}
    </button>
  );
}
