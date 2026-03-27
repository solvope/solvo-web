import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {}

export default withSentryConfig(nextConfig, {
  // URL de tu organización/proyecto en Sentry (para source maps)
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Auth token para subir source maps (en CI/CD: variable de entorno)
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Silenciar logs de Sentry durante el build
  silent: !process.env.CI,
  // Subir source maps solo en producción
  hideSourceMaps: true,
  // Disable Sentry telemetry
  telemetry: false,
})
