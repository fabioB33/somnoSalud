import { getFromAddress, getResendClient } from './resend-client';
import { renderResultsSummary } from './templates/results-summary';
import { renderWelcome } from './templates/welcome';

export type SendResult =
  | { ok: true; id: string }
  | { ok: false; reason: 'no-client' | 'no-from' | 'send-failed'; error?: unknown };

export interface WelcomeEmailOptions {
  to: string;
  patientFirstName?: string;
  loginUrl: string;
}

export interface ResultsEmailOptions {
  to: string;
  patientFirstName: string;
  evaluationDate: string;
  resultsUrl: string;
}

/**
 * Envia el email "resumen de resultados" al paciente.
 *
 * Sprint 14: NO se invoca desde ningun client/server component todavia.
 * Queda listo para Sprint 9+ cuando el flow de results haya escrito en DB
 * el `evaluationId` + url permanente.
 */
export async function sendResultsEmail(
  opts: ResultsEmailOptions,
): Promise<SendResult> {
  const client = getResendClient();
  if (!client) return { ok: false, reason: 'no-client' };

  const from = getFromAddress();
  if (!from) return { ok: false, reason: 'no-from' };

  try {
    const { data, error } = await client.emails.send({
      from,
      to: opts.to,
      subject: 'Tu resumen de evaluacion SomnoSalud',
      html: renderResultsSummary({
        patientFirstName: opts.patientFirstName,
        evaluationDate: opts.evaluationDate,
        resultsUrl: opts.resultsUrl,
      }),
    });

    if (error || !data) return { ok: false, reason: 'send-failed', error };
    return { ok: true, id: data.id };
  } catch (error) {
    return { ok: false, reason: 'send-failed', error };
  }
}

/**
 * Sprint 9.F (2026-06-19) — Envia el email de bienvenida post-register.
 *
 * Se invoca 1 vez por user, idealmente desde el `/auth/callback` route handler
 * cuando es la primera vez que el user crea sesion (detectable via
 * `created_at === last_sign_in_at` o flag explicito en profiles).
 *
 * Best-effort: si falla, NO bloqueamos el flow de login. Sprint 9.G conecta
 * esto al flow real.
 */
export async function sendWelcomeEmail(
  opts: WelcomeEmailOptions,
): Promise<SendResult> {
  const client = getResendClient();
  if (!client) return { ok: false, reason: 'no-client' };

  const from = getFromAddress();
  if (!from) return { ok: false, reason: 'no-from' };

  try {
    const { data, error } = await client.emails.send({
      from,
      to: opts.to,
      subject: 'Bienvenido a SomnoSalud',
      html: renderWelcome({
        patientFirstName: opts.patientFirstName,
        loginUrl: opts.loginUrl,
      }),
    });

    if (error || !data) return { ok: false, reason: 'send-failed', error };
    return { ok: true, id: data.id };
  } catch (error) {
    return { ok: false, reason: 'send-failed', error };
  }
}
