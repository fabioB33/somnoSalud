import { getFromAddress, getResendClient } from './resend-client';
import { renderResultsSummary } from './templates/results-summary';

export type SendResult =
  | { ok: true; id: string }
  | { ok: false; reason: 'no-client' | 'no-from' | 'send-failed'; error?: unknown };

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
