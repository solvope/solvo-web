import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  // Captura de rendimiento: 100 % en dev, 10 % en prod
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,
  // Replay de sesión sólo en producción (1 % normal, 10 % en errores)
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 0.1,
  integrations: [
    Sentry.replayIntegration(),
  ],
  sendDefaultPii: false,
})
