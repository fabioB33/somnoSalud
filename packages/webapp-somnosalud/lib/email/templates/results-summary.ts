export interface ResultsSummaryProps {
  patientFirstName: string;
  evaluationDate: string;
  resultsUrl: string;
}

/**
 * Template placeholder del email "resumen de resultados".
 *
 * Sprint 14: HTML inline simple sin invocacion real. Cuando el flow se active
 * (Sprint 9+), reemplazar por react-email o mantener HTML inline segun decision
 * de arquitectura. El cuerpo legal/disclaimer va a vivir aca tambien (capa 5
 * ADR-003 extendida a email channel).
 */
export function renderResultsSummary(props: ResultsSummaryProps): string {
  const { patientFirstName, evaluationDate, resultsUrl } = props;

  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>Tu resumen de evaluacion SomnoSalud</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #1a1a2e; color: #e6e6e6; margin: 0; padding: 24px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background: #16213e; border-radius: 12px; padding: 32px;">
      <tr>
        <td>
          <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 16px;">Hola ${escapeHtml(patientFirstName)},</h1>
          <p style="margin: 0 0 16px; line-height: 1.6;">
            Tu evaluacion del <strong>${escapeHtml(evaluationDate)}</strong> esta lista.
          </p>
          <p style="margin: 0 0 24px; line-height: 1.6;">
            Recorda que los resultados son <strong>orientativos</strong> y NO reemplazan
            la consulta medica. Validalos siempre con tu profesional de salud antes de
            implementar cualquier recomendacion.
          </p>
          <p style="margin: 0 0 32px;">
            <a href="${escapeHtml(resultsUrl)}" style="display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
              Ver mis resultados
            </a>
          </p>
          <hr style="border: none; border-top: 1px solid #2a3a5e; margin: 24px 0;" />
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">
            SomnoSalud &mdash; Director medico Dr. Pablo Ferrero M.N. 119.783 &mdash;
            Instituto Ferrero de Neurologia y Sueno (IFN).
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
