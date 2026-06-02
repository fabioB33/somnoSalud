/**
 * Resuelve la URL base del sitio para construir links absolutos
 * (magic link emailRedirectTo, OAuth callback, password reset, etc).
 *
 * Orden de precedencia:
 * 1. NEXT_PUBLIC_SITE_URL — env var explícita (override manual).
 *    Útil cuando se quiere forzar un dominio custom (`https://somnosalud.com.ar`).
 * 2. VERCEL_PROJECT_PRODUCTION_URL — definido automáticamente por Vercel en
 *    el ambiente de producción. Apunta al dominio production estable
 *    (ej. `somno-salud-webapp-somnosalud.vercel.app`).
 * 3. VERCEL_URL — definido automáticamente por Vercel en cada deployment
 *    (production + preview branches + commit-specific). Cambia con cada
 *    deploy. Usado como fallback si el production URL no está.
 * 4. Header `origin` de la request — fallback runtime, requiere ser
 *    invocado desde un Server Action / Route Handler / Middleware.
 * 5. `http://localhost:3000` — fallback final para development local.
 *
 * **Regla #13 NO-HARDCODED:** ningún `localhost:3000` ni dominio Vercel
 * literal queda en código de producto. Todo deriva de env vars.
 *
 * @see https://vercel.com/docs/projects/environment-variables/system-environment-variables
 */

export interface ResolveSiteUrlOptions {
  /**
   * Header `origin` capturado por el caller con `headers().get('origin')`.
   * Si está presente y los precedentes no resuelven, se usa este.
   */
  requestOrigin?: string | null;
}

export function resolveSiteUrl(opts: ResolveSiteUrlOptions = {}): string {
  // 1. Override explícito.
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return normalize(explicit);

  // 2. Vercel production URL (estable, no cambia entre deploys).
  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (prod) return `https://${prod}`;

  // 3. Vercel deployment URL (cambia por deploy). En preview branches este
  //    es el único que va a estar definido.
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel}`;

  // 4. Header origin runtime.
  const origin = opts.requestOrigin?.trim();
  if (origin) return normalize(origin);

  // 5. Fallback dev local.
  return 'http://localhost:3000';
}

function normalize(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}
