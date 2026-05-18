import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

/**
 * updateSession — helper que refresca los tokens de Supabase en cada
 * request. Lo invoca el middleware top-level antes de aplicar reglas
 * de compliance/redirect.
 *
 * Devuelve el NextResponse que ya tiene las cookies actualizadas.
 * Si el middleware caller necesita redirigir (compliance gate, login
 * required, etc), debe clonar las cookies del response retornado para
 * no perder el refresh.
 *
 * Patron oficial @supabase/ssr 0.5+: NO se debe ejecutar otra logica
 * (auth check, fetch DB) entre createServerClient() y getUser(), porque
 * eso causa race conditions en el refresh.
 */
export async function updateSession(
  request: NextRequest,
): Promise<{ response: NextResponse; userId: string | null }> {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    return { response: supabaseResponse, userId: null };
  }

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response: supabaseResponse, userId: user?.id ?? null };
}
