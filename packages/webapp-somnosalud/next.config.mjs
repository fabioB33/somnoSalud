import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Permite que Next.js bundle correctamente el workspace dep clinical-engine.
  // Sin esto, Next intenta cargar el dist/ pre-compilado y rompe sourcemaps.
  transpilePackages: ['somnosalud-clinical-engine'],

  // SomnoSalud webapp NO debe enviar datos clinicos a servidores externos
  // sin consentimiento. CSP estricta se agrega en Sprint 9+ junto con headers
  // de seguridad. Por ahora, configuracion minima.
  experimental: {
    typedRoutes: true,
  },
};

// Sprint 14: withSentryConfig se aplica siempre, pero el SDK queda idle
// cuando NEXT_PUBLIC_SENTRY_DSN no esta seteado. silent: !CI evita logs
// ruidosos en dev. widenClientFileUpload mejora source maps cuando exista
// SENTRY_AUTH_TOKEN.
const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  tunnelRoute: '/monitoring',
};

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
