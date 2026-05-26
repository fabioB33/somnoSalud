'use server';

import { CONSENT_TERMS_VERSION } from '@/lib/consent/version';
import { createClient } from '@/lib/supabase/server';

/**
 * Server Actions del consent informado (Sprint 9.E-consent-persist-db).
 *
 * El consent vive en 3 capas (compliance Ley 26.529 + Decreto 1089/2012):
 * 1. Cookie `somno_consent_v1=accepted` — middleware Capa 1 (gate runtime).
 * 2. `profiles.consent_terms_accepted_at` + `consent_terms_version` — registro
 *    permanente del consent (derecho de acceso del paciente: poder mostrarle
 *    cuando acepto los terminos).
 * 3. `audit_log` con action `profile.consent_terms_accepted` — trazabilidad
 *    inmutable de la aceptacion para auditoria.
 *
 * Sprint 9.D ya garantiza que TODO consent se firma con user autenticado
 * (auth gate /eval/*), entonces aca podemos asumir sesion.
 */

export type AcceptConsentResult =
  | { ok: true; persistedAt: string }
  | { ok: false; reason: 'no-session' | 'db-error'; error?: string };

/**
 * Persiste el consent del usuario logueado a DB. Idempotente: si el user
 * ya tiene un `consent_terms_accepted_at` con la version actual, no
 * sobreescribe (preserva el timestamp original — relevante para auditoria
 * legal de "cuando se acepto por primera vez").
 *
 * Se invoca desde TermsForm.handleSubmit despues de setear la cookie.
 * Fire-and-forget desde la UI: si falla, NO bloquea el flow (la cookie
 * ya esta seteada, el user puede continuar; el reintento de persistencia
 * lo maneja un job admin futuro vea profiles con cookie pero sin DB row).
 */
export async function acceptConsent(): Promise<AcceptConsentResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, reason: 'no-session' };
  }

  // Idempotencia: leer estado actual de profile.
  const { data: profile, error: selectError } = await supabase
    .from('profiles')
    .select('consent_terms_accepted_at, consent_terms_version')
    .eq('id', user.id)
    .maybeSingle();

  if (selectError) {
    return { ok: false, reason: 'db-error', error: selectError.message };
  }

  // Si ya acepto la version actual, no sobreescribir (preserva timestamp original).
  if (
    profile?.consent_terms_accepted_at &&
    profile?.consent_terms_version === CONSENT_TERMS_VERSION
  ) {
    return { ok: true, persistedAt: profile.consent_terms_accepted_at };
  }

  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      consent_terms_accepted_at: now,
      consent_terms_version: CONSENT_TERMS_VERSION,
    })
    .eq('id', user.id);

  if (updateError) {
    return { ok: false, reason: 'db-error', error: updateError.message };
  }

  // Audit log: registro inmutable de la aceptacion.
  // Best-effort: si falla audit, el consent ya esta persistido en profile.
  await supabase.from('audit_log').insert({
    user_id: user.id,
    action: 'profile.consent_terms_accepted',
    payload: {
      version: CONSENT_TERMS_VERSION,
      accepted_at: now,
    },
  });

  return { ok: true, persistedAt: now };
}
