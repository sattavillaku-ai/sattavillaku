// Vercel Analytics / Custom Event Tracking (Mock/Wrapper implementation)
// In a real app, this would use @vercel/analytics/react

export const monitoring = {
  trackIssueView: (issueSlug: string, isSubscriber: boolean, contentType?: string) => {
    try {
      if (typeof window !== 'undefined' && (window as any).va) {
        (window as any).va('track', 'Issue_View', {
          slug: issueSlug,
          subscriber: isSubscriber ? 'Yes' : 'No',
          type: contentType || 'Issue',
        });
      }
      console.log(`[Analytics] Issue_View: ${issueSlug} | Sub: ${isSubscriber}`);
    } catch (e) {
      console.error('Analytics Error:', e);
    }
  },

  trackSubscriptionStart: (plan: 'monthly' | 'annual') => {
    try {
      if (typeof window !== 'undefined' && (window as any).va) {
        (window as any).va('track', 'Subscription_Start', {
          plan_type: plan,
        });
      }
      console.log(`[Analytics] Subscription_Start: ${plan}`);
    } catch (e) {
      console.error('Analytics Error:', e);
    }
  },

  trackSearchQuery: (query: string, resultCount: number) => {
    try {
      if (typeof window !== 'undefined' && (window as any).va) {
        (window as any).va('track', 'Search_Query', {
          search_term: query,
          results: resultCount,
        });
      }
    } catch (e) {
      console.error('Analytics Error:', e);
    }
  },

  trackPDFDownload: (issueSlug: string) => {
    try {
      if (typeof window !== 'undefined' && (window as any).va) {
        (window as any).va('track', 'PDF_Download', {
          slug: issueSlug,
        });
      }
      console.log(`[Analytics] PDF_Download: ${issueSlug}`);
    } catch (e) {
      console.error('Analytics Error:', e);
    }
  }
};
