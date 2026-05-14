import { Resend } from 'resend';

let _client: Resend | null = null;

/**
 * Wrapper lazy del cliente Resend. Retorna null si no hay RESEND_API_KEY,
 * lo que permite que el resto de la app siga funcionando sin emails reales
 * mientras la cuenta Resend + dominio verificado no estan listos.
 *
 * Sprint 14: instalado idle. Sprint 9+ (post-Supabase) decide cuando invocar.
 */
export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!_client) _client = new Resend(apiKey);
  return _client;
}

export function getFromAddress(): string | null {
  return process.env.RESEND_FROM_EMAIL ?? null;
}
