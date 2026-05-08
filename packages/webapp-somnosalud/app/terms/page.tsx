import { Stethoscope } from 'lucide-react';

import { TermsForm } from './TermsForm';

/**
 * Pantalla /terms — Server Component que renderiza T&C + componente client
 * con checkbox + accept button.
 *
 * Compliance: cumple Ley 25.326 art. 6 (consentimiento explicito previo)
 * + Ley 26.529 art. 7 (consentimiento informado escrito antes de evaluacion
 * clinica). El checkbox NO viene pre-marcado (regla compliance-anmat).
 *
 * El timestamp del consent + version (v1) se loguea en sessionStorage cuando
 * se acepta. Cuando arranque Supabase Sprint 11, el log migra a tabla
 * `evaluations.consent_given_at`.
 *
 * @see docs/vault/clinical/COMPLIANCE-ARGENTINA.md §"Política de privacidad"
 * @see docs/vault/architecture/adr/ADR-003-compliance-gates-en-codigo.md
 */
export default function TermsPage({
  searchParams,
}: {
  searchParams: { redirect?: string };
}) {
  const redirectTo = searchParams.redirect ?? '/eval/profile';

  return (
    <main className="min-h-dvh">
      <div className="container max-w-3xl py-12 md:py-20">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Stethoscope size={14} aria-hidden="true" />
          Director médico: Dr. Pablo Ferrero · M.N. 119.783
        </div>

        <h1 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl">
          Términos, condiciones y consentimiento
        </h1>

        <section className="mb-8 space-y-4 text-sm leading-relaxed text-foreground/90">
          <h2 className="text-lg font-semibold text-foreground">
            1. Naturaleza orientativa
          </h2>
          <p>
            SomnoSalud es una herramienta digital de <strong>orientación
            clínica</strong> sobre trastornos del sueño. NO emite diagnóstico
            médico autónomo, NO prescribe medicación y NO reemplaza la consulta
            con un profesional de la salud habilitado.
          </p>

          <h2 className="text-lg font-semibold text-foreground">
            2. Director médico responsable
          </h2>
          <p>
            La supervisión clínica es responsabilidad del{' '}
            <strong>Dr. Pablo Ferrero (M.N. 119.783)</strong>, Director del
            Sleep Lab IFN (Instituto Ferrero de Neurología y Sueño), Buenos
            Aires, Argentina.
          </p>

          <h2 className="text-lg font-semibold text-foreground">
            3. Datos personales (Ley 25.326)
          </h2>
          <p>
            Tus respuestas a los cuestionarios se guardan{' '}
            <strong>localmente en tu navegador</strong> (sessionStorage)
            mientras completás la evaluación. Si cerrás la pestaña, los datos
            se pierden y empezás de nuevo. NO enviamos datos clínicos a
            servidores externos en esta etapa.
          </p>
          <p>
            Cuando habilitemos cuentas de usuario (próximas semanas), vas a
            poder optar por guardar tu evaluación en nuestra base de datos
            (encriptada at-rest, con acceso solo tuyo) para acceder al
            historial. Vas a recibir un consentimiento separado para esa
            funcionalidad.
          </p>

          <h2 className="text-lg font-semibold text-foreground">
            4. Edad mínima
          </h2>
          <p>
            La evaluación auto-administrada está disponible para personas{' '}
            <strong>mayores de 18 años</strong>. Si sos menor, vas a recibir
            información de contacto con un especialista en lugar de poder
            completar la evaluación.
          </p>

          <h2 className="text-lg font-semibold text-foreground">
            5. Salud mental
          </h2>
          <p>
            Si en algún momento tenés pensamientos de hacerte daño o pensás en
            el suicidio, llamá ahora a la línea de salud mental gratuita{' '}
            <strong>0800-999-0091</strong> (Argentina, 24/7) o acercate al
            servicio de emergencia más cercano.
          </p>

          <h2 className="text-lg font-semibold text-foreground">
            6. Derechos del paciente (Ley 26.529)
          </h2>
          <p>
            Tenés derecho a recibir información clara sobre el alcance de la
            evaluación, a confidencialidad médica, y a obtener una copia
            portable de tu evaluación cuando esté disponible la cuenta de
            usuario.
          </p>

          <h2 className="text-lg font-semibold text-foreground">
            7. Versionado de este documento
          </h2>
          <p>
            Esta es la versión <strong>v1</strong> del consentimiento. Si
            actualizamos el texto, vas a tener que re-aceptar la nueva versión
            antes de continuar usando la herramienta.
          </p>
        </section>

        <TermsForm redirectTo={redirectTo} />
      </div>
    </main>
  );
}
