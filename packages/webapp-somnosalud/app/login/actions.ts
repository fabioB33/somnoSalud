'use server';

import { headers } from 'next/headers';

import { resolveSiteUrl } from '@/lib/site-url';
import { createClient } from '@/lib/supabase/server';

export type LoginActionResult =
  | { ok: true; email: string }
  | { ok: false; error: string };

/**
 * signInWithOtp — envia magic link al email del paciente.
 *
 * Sprint 9.A: usa SMTP default de Supabase (rate limit 4/hora). El email
 * llega con un link a `${siteUrl}/auth/callback?code=...` que el Route
 * Handler intercambia por una session.
 *
 * Sprint 3 hotfix (2026-05-26): la URL absoluta se resuelve con
 * `resolveSiteUrl()` que prioriza NEXT_PUBLIC_SITE_URL → VERCEL_PROJECT_PRODUCTION_URL
 * → VERCEL_URL → header origin → localhost fallback. Esto evita el bug
 * donde el email del magic link llevaba a localhost cuando se enviaba
 * desde producción Vercel (header `origin` puede llegar vacío atrás del
 * edge proxy de Vercel, y como fallback Supabase usaba su Site URL que
 * apuntaba a localhost por config previa de development).
 *
 * Si el email no existe en auth.users, Supabase lo crea on-the-fly y
 * dispara el trigger handle_new_user() que popula public.profiles.
 */
export async function signInWithOtp(
  _prevState: LoginActionResult | null,
  formData: FormData,
): Promise<LoginActionResult> {
  const email = formData.get('email');

  if (typeof email !== 'string' || email.length === 0) {
    return { ok: false, error: 'Ingresá tu email.' };
  }

  // Validacion basica de email — Supabase tambien valida server-side.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'El email no tiene un formato válido.' };
  }

  const requestOrigin = headers().get('origin');
  const siteUrl = resolveSiteUrl({ requestOrigin });

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    return {
      ok: false,
      error:
        error.status === 429
          ? 'Demasiados intentos. Esperá unos minutos y volvé a intentar.'
          : 'No pudimos enviar el email. Verificá la dirección e intentá de nuevo.',
    };
  }

  return { ok: true, email };
}
