import { Stethoscope } from 'lucide-react';

import { FadeIn } from '@/components/motion/FadeIn';

import { TermsForm } from './TermsForm';

/**
 * Pantalla /terms — Server Component que renderiza T&C + componente client
 * con checkbox + accept button.
 *
 * Sprint UX polish 2026-06-11: tipografía premium + glass section única + ítems
 * numerados con badge accent. Copy y compliance preservados exactamente.
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

  const SECTIONS = [
    {
      n: 1,
      title: 'Naturaleza orientativa',
      body: (
        <p>
          SomnoSalud es una herramienta digital de{' '}
          <strong>orientación clínica</strong> sobre trastornos del sueño.
          NO emite diagnóstico médico autónomo, NO prescribe medicación y
          NO reemplaza la consulta con un profesional de la salud
          habilitado.
        </p>
      ),
    },
    {
      n: 2,
      title: 'Director médico responsable',
      body: (
        <p>
          La supervisión clínica es responsabilidad del{' '}
          <strong>Dr. Pablo Ferrero (M.N. 119.783)</strong>, Director del
          Sleep Lab IFN (Instituto Ferrero de Neurología y Sueño), Buenos
          Aires, Argentina.
        </p>
      ),
    },
    {
      n: 3,
      title: 'Datos personales (Ley 25.326)',
      body: (
        <>
          <p>
            Tus respuestas a los cuestionarios se guardan{' '}
            <strong>localmente en tu navegador</strong> (sessionStorage)
            mientras completás la evaluación. Si cerrás la pestaña, los
            datos se pierden y empezás de nuevo. NO enviamos datos clínicos
            a servidores externos en esta etapa.
          </p>
          <p className="mt-3">
            Cuando habilitemos cuentas de usuario (próximas semanas), vas a
            poder optar por guardar tu evaluación en nuestra base de datos
            (encriptada at-rest, con acceso solo tuyo) para acceder al
            historial. Vas a recibir un consentimiento separado para esa
            funcionalidad.
          </p>
        </>
      ),
    },
    {
      n: 4,
      title: 'Edad mínima',
      body: (
        <p>
          La evaluación auto-administrada está disponible para personas{' '}
          <strong>mayores de 18 años</strong>. Si sos menor, vas a recibir
          información de contacto con un especialista en lugar de poder
          completar la evaluación.
        </p>
      ),
    },
    {
      n: 5,
      title: 'Salud mental',
      body: (
        <p>
          Si en algún momento tenés pensamientos de hacerte daño o pensás
          en el suicidio, llamá ahora a la línea de salud mental gratuita{' '}
          <strong className="font-mono">0800-999-0091</strong> (Argentina,
          24/7) o acercate al servicio de emergencia más cercano.
        </p>
      ),
    },
    {
      n: 6,
      title: 'Derechos del paciente (Ley 26.529)',
      body: (
        <p>
          Tenés derecho a recibir información clara sobre el alcance de la
          evaluación, a confidencialidad médica, y a obtener una copia
          portable de tu evaluación cuando esté disponible la cuenta de
          usuario.
        </p>
      ),
    },
    {
      n: 7,
      title: 'Versionado de este documento',
      body: (
        <p>
          Esta es la versión <strong>v1</strong> del consentimiento. Si
          actualizamos el texto, vas a tener que re-aceptar la nueva
          versión antes de continuar usando la herramienta.
        </p>
      ),
    },
  ];

  return (
    <main className="min-h-dvh">
      <div className="container max-w-3xl py-12 md:py-20">
        <FadeIn>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-somno-accent/20 bg-somno-tint-info px-3.5 py-1.5 text-xs font-medium text-somno-accent-soft">
            <Stethoscope size={14} aria-hidden="true" />
            Director médico: Dr. Pablo Ferrero · M.N. 119.783
          </div>

          <h1 className="mb-8 font-display text-5xl font-normal leading-[1.05] tracking-tight md:text-6xl">
            Términos, condiciones y consentimiento
          </h1>
        </FadeIn>

        <FadeIn delay={0.1}>
          <section className="glass-card mb-10 space-y-8 p-8">
            {SECTIONS.map(({ n, title, body }) => (
              <div key={n}>
                <div className="mb-3 flex items-center gap-3">
                  <span className="badge-tint-info inline-flex size-8 items-center justify-center rounded-lg font-display text-sm font-semibold">
                    {n}
                  </span>
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">
                    {title}
                  </h2>
                </div>
                <div className="pl-11 text-sm leading-relaxed text-foreground/85">
                  {body}
                </div>
              </div>
            ))}
          </section>
        </FadeIn>

        <FadeIn delay={0.15}>
          <TermsForm redirectTo={redirectTo} />
        </FadeIn>
      </div>
    </main>
  );
}
