'use client';

import { useState } from 'react';
import { Download, Lock, Loader2, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface DownloadPDFButtonProps {
  issueSlug: string;
  hasAccess: boolean;
  pdfAvailable: boolean;
  className?: string;
}

export function DownloadPDFButton({ 
  issueSlug, 
  hasAccess, 
  pdfAvailable,
  className 
}: DownloadPDFButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const router = useRouter();

  const handleDownload = async () => {
    if (!hasAccess) {
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
      disabled={isDownloading || (hasAccess && !pdfAvailable)}
      className={cn(
        "flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95",
        !hasAccess 
          ? "bg-amber-600 text-white hover:bg-amber-700"
          : (pdfAvailable ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed"),
        className
      )}
      title={!hasAccess ? "₹30/மாதம் சந்தா எடுத்து இதழை வாசியுங்கள்" : ""}
    >
      {isDownloading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>திறக்கப்படுகிறது...</span>
        </>
      ) : !hasAccess ? (
        <>
          <Lock className="h-5 w-5" />
          <span>இதழ் PDF வாசிக்க (சந்தா தேவை)</span>
        </>
      ) : !pdfAvailable ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>PDF தயாராகிறது...</span>
        </>
      ) : (
        <>
          <BookOpen className="h-5 w-5" />
          <span>இதழ் PDF வாசிக்க</span>
        </>
      )}
    </button>
  );
}
