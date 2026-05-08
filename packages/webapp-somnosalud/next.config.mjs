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

export default nextConfig;
