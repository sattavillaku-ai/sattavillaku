import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.05, // 5% traces to keep costs low
  debug: false,
  environment: process.env.NODE_ENV,
  ignoreErrors: [
    '404',
    '401',
    'Unauthorized',
    'Subscription required'
  ],
  initialScope: {
    tags: {
      magazine: 'sattavillaku',
      side: 'client',
    },
  },
});
