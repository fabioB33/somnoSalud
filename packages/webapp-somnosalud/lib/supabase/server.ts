import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Cliente Supabase para uso en Server Components, Route Handlers y
 * Server Actions. Usa cookies() de next/headers para leer/escribir
 * la session.
 *
 * IMPORTANTE: en Server Components puros (no Actions/Route Handlers)
 * el setAll() puede fallar al intentar modificar cookies — el bloque
 * try/catch lo silencia porque el middleware refrescara la session
 * en la proxima request. Patron oficial del Supabase SSR guide.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY son requeridas.',
    );
  }

  const cookieStore = cookies();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component — middleware refrescara la session.
        }
      },
    },
  });
}
