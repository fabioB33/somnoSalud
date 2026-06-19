export interface WelcomeProps {
  patientFirstName?: string;
  loginUrl: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Sprint 9.F (2026-06-19) — Template welcome email post-register.
 *
 * Se manda 1 vez cuando el user completa el primer magic link login y queda
 * la sesion creada. Es bienvenida + onboarding minimo + reminder de privacidad.
 *
 * Encuadre regulatorio CRITICO: NO mencionar "diagnostico" / "tratamiento" /
 * "enfermedad". Solo lenguaje educativo + tracking + sueno.
 */
export function renderWelcome(props: WelcomeProps): string {
  const { patientFirstName, loginUrl } = props;
  const greeting = patientFirstName
    ? `Hola ${escapeHtml(patientFirstName)},`
    : 'Hola,';

  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>Bienvenido a SomnoSalud</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #1a1a2e; color: #e6e6e6; margin: 0; padding: 24px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background: #16213e; border-radius: 12px; padding: 32px;">
      <tr>
        <td>
          <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 16px;">${greeting}</h1>
          <p style="margin: 0 0 16px; line-height: 1.6;">
            Te damos la bienvenida a <strong>SomnoSalud</strong>, la plataforma del
            Dr. Pablo Ferrero (M.N. 119.783) y el Instituto Ferrero de Neurologia
            y Sueno (IFN).
          </p>
          <p style="margin: 0 0 16px; line-height: 1.6;">
            Aca vas a poder evaluar tu sueno con instrumentos clinicos reales,
            recibir un plan personalizado de habitos y hacer un seguimiento
            longitudinal de tu descanso.
          </p>
          <h2 style="color: #ffffff; font-size: 18px; margin: 24px 0 12px;">Tus proximos pasos</h2>
          <ol style="padding-left: 20px; margin: 0 0 20px; line-height: 1.7;">
            <li>Completar el formulario inicial (~10 minutos).</li>
            <li>Recibir tus resultados orientativos al instante.</li>
            <li>Empezar a registrar tu sueno noche a noche para ver tu progreso.</li>
          </ol>
          <p style="margin: 0 0 16px; line-height: 1.6;">
            Recorda que los resultados son <strong>orientativos</strong> y NO
            reemplazan la consulta medica. Si en algun momento sentis que
            necesitas apoyo profesional, derivamos con un especialista.
          </p>
          <p style="margin: 0 0 32px;">
            <a href="${escapeHtml(loginUrl)}" style="display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
              Entrar a SomnoSalud
            </a>
          </p>
          <hr style="border: none; border-top: 1px solid #2a3a5e; margin: 24px 0;" />
          <p style="font-size: 12px; color: #9ca3af; margin: 0 0 8px;">
            <strong>Privacidad:</strong> tus datos estan protegidos bajo Ley 25.326
            de Proteccion de Datos Personales y solo vos podes verlos.
          </p>
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
