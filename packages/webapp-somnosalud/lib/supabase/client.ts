import { createBrowserClient } from '@supabase/ssr';

/**
 * Cliente Supabase para uso en Client Components (browser).
 *
 * Sprint 9.A: usa la convencion de keys 2025+ (sb_publishable_*). Lee del
 * env publico que Next inyecta en el bundle del cliente. NO usar para
 * operaciones que requieran service_role — eso solo va server-side.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY son requeridas. ' +
        'Setear en packages/webapp-somnosalud/.env.local.',
    );
  }

  return createBrowserClient(url, publishableKey);
}
