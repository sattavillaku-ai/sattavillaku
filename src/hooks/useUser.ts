'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

type Profile = Database['public']['Tables']['users']['Row'];
type Subscription = Database['public']['Tables']['subscriptions']['Row'];

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getFullUser = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        // ப்ரோஃபைல் மற்றும் சந்தா விவரங்களைப் பெறவும் (Get profile and subscription)
        const { data: profileData } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUser.id)
          .single();
        
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', currentUser.id)
          .single();

        setProfile(profileData);
        setSubscription(subData);
      }
      setIsLoading(false);
    };

    getFullUser();

    // அமர்வு மாற்றங்களைக் கண்காணிக்கவும் (Listen for auth changes)
    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          getFullUser();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setSubscription(null);
        }
      }
    );

    return () => {
      authListener.unsubscribe();
    };
  }, [supabase]);

  const isSubscribed = subscription?.status === 'active' && new Date(subscription.current_period_end) > new Date();

  return {
    user,
    profile,
    subscription,
    isLoading,
    isSubscribed,
    role: profile?.role ?? 'reader',
  };
}
