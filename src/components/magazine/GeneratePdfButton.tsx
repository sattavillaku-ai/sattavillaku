'use client';

import { useState } from 'react';
import { FileText, Loader2, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function GeneratePdfButton({ issueId }: { issueId: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    if (loading) return;
    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch(`/api/admin/issues/${issueId}/generate-pdf`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert(data.error || 'PDF உருவாக்குவதில் பிழை ஏற்பட்டது');
      }
    } catch (err) {
      alert('இணைப்பில் பிழை (Network error)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGenerate}
      disabled={loading}
      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg disabled:opacity-50 transition-all flex items-center justify-center"
      title="PDF உருவாக்கு (Generate PDF)"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : success ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <FileText className="h-4 w-4" />
      )}
    </button>
  );
}
