import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.05,
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
      side: 'server',
    },
  },
});
