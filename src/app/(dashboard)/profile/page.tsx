'use client';

import { useUser } from '@/hooks/useUser';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { User, CreditCard, Bookmark, LogOut, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const { user, profile, subscription, isSubscribed, isLoading } = useUser();
  const supabase = createClient();
  const router = useRouter();
  const [isCancelling, setIsCancelling] = useState(false);
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      const fetchBookmarks = async () => {
        const { data } = await supabase
          .from('bookmarks')
          .select('*, issue_content(*)')
          .eq('user_id', user.id);
        setBookmarks(data ?? []);
      };
      fetchBookmarks();
    }
  }, [user, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleCancelSubscription = async () => {
    if (!confirm('உங்கள் சந்தாவை ரத்து செய்ய விரும்புகிறீர்களா?')) return;
    setIsCancelling(true);
    // இங்கிருந்து API அழைக்கப்படும் (API call would go here)
    alert('சந்தா ரத்து செய்யும் வசதி விரைவில் வரும்...');
    setIsCancelling(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 font-medium">ஏற்றுகிறது...</span>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-serif">சுயவிவரம் (Profile)</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-destructive hover:text-destructive/80 font-medium"
        >
          <LogOut className="h-5 w-5" />
          வெளியேறு
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* பயனர் தகவல் (User Info) */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{profile?.display_name || 'பயனர்'}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="space-y-2 mt-4 text-sm">
            <p><span className="font-medium">பங்கு (Role):</span> {profile?.role === 'admin' ? 'நிர்வாகி' : 'வாசகர்'}</p>
          </div>
        </div>

        {/* சந்தா விவரம் (Subscription Details) */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">சந்தா விவரம்</h2>
          </div>
          <div className="space-y-4">
            {isSubscribed ? (
              <>
                <div className="text-sm">
                  <p className="text-green-600 font-bold">சந்தா செயல்பாட்டில் உள்ளது (Active)</p>
                  <p className="mt-1">முடியும் தேதி: {new Date(subscription!.current_period_end).toLocaleDateString('ta-IN')}</p>
                </div>
                <button
                  onClick={handleCancelSubscription}
                  disabled={isCancelling}
                  className="text-xs text-muted-foreground hover:text-destructive underline"
                >
                  சந்தாவை ரத்து செய்
                </button>
              </>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-4">உங்களிடம் தற்போது செயலில் உள்ள சந்தா ஏதுமில்லை.</p>
                <button
                  onClick={() => router.push('/subscribe')}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90"
                >
                  சந்தா பெறு
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* புத்தகக்குறிகள் (Bookmarks) */}
      <div className="mt-12">
        <div className="flex items-center gap-2 mb-6">
          <Bookmark className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold font-serif">சேமித்தவை (Bookmarks)</h2>
        </div>
        
        {bookmarks.length > 0 ? (
          <div className="grid gap-4">
            {bookmarks.map((b) => (
              <div key={b.id} className="p-4 rounded-lg border hover:bg-accent cursor-pointer transition-colors">
                <h3 className="font-semibold">{b.issue_content.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{b.issue_content.author_name}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            நீங்கள் இன்னும் எந்த கட்டுரைகளையும் சேமிக்கவில்லை.
          </p>
        )}
      </div>
    </div>
  );
}
