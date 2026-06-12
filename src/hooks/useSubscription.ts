import { useState, useEffect } from 'react';
import { useUser } from './useUser';

// சந்தா கொக்கி (Subscription hook)
export function useSubscription() {
  const { user } = useUser();
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    if (user) {
      // நிஜமான பயன்பாட்டில் சந்தாவை சரிபார்க்கவும்
      // In a real app, check subscription status from DB
      setHasSubscription(true);
    }
  }, [user]);

  return { hasSubscription };
}
