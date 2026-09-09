'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleAuth() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          setError(error.message);
          return;
        }
        if (data.session) {
          router.replace('/admin');
        } else {
          // Listen to state change in case hash is processed asynchronously
          const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
              if (session) {
                router.replace('/admin');
              }
            }
          );
          return () => {
            authListener.subscription.unsubscribe();
          };
        }
      } catch (err: any) {
        setError(err.message || 'உள்நுழைவில் பிழை ஏற்பட்டது');
      }
    }

    handleAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background font-tamil text-foreground">
      <div className="max-w-md w-full p-6 text-center space-y-4 bg-card border border-border rounded-lg shadow-sm">
        {error ? (
          <div className="space-y-2">
            <div className="text-destructive font-bold text-sm">உள்நுழைவு தோல்வி</div>
            <p className="text-xs text-muted-foreground">{error}</p>
            <button
              onClick={() => router.replace('/admin/login')}
              className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs font-bold"
            >
              மீண்டும் முயற்சிக்கவும்
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
            <div className="text-sm font-bold">கூகிள் அங்கீகாரம் சரிபார்க்கப்படுகிறது...</div>
            <p className="text-xs text-muted-foreground">ஆசிரியர் கட்டுப்பாட்டகத்திற்கு அழைத்துச் செல்லப்படுகிறீர்கள்.</p>
          </div>
        )}
      </div>
    </div>
  );
}
