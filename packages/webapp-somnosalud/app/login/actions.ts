'use server';

import { headers } from 'next/headers';

import { createClient } from '@/lib/supabase/server';

export type LoginActionResult =
  | { ok: true; email: string }
  | { ok: false; error: string };

/**
 * signInWithOtp — envia magic link al email del paciente.
 *
 * Sprint 9.A: usa SMTP default de Supabase (rate limit 4/hora). El email
 * llega con un link a `${origin}/auth/callback?code=...` que el Route
 * Handler intercambia por una session.
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

  const origin = headers().get('origin');
  if (!origin) {
    return { ok: false, error: 'No se pudo determinar la URL de la app.' };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
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
