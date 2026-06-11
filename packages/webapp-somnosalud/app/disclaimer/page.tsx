import Link from 'next/link';
import { ArrowRight, ShieldAlert, Stethoscope } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FadeIn } from '@/components/motion/FadeIn';

/**
 * Pantalla /disclaimer — primera de las pantallas P0 compliance gates.
 *
 * Sprint UX polish 2026-06-11: tipografía premium (Fraunces para H1) + glass
 * sections + jerarquía de lectura suave. Copy y estructura legal preservados
 * (regla #1 compliance: NO modificar texto canónico Ley 26.529).
 *
 * Compliance: cumple Ley 26.529 art. 5 (informacion clara y comprensible
 * al paciente sobre alcance de la evaluacion) ANTES de mostrar T&C.
 *
 * @see docs/vault/clinical/COMPLIANCE-ARGENTINA.md §"Disclaimer médico obligatorio (texto canónico)"
 * @see docs/vault/architecture/adr/ADR-003-compliance-gates-en-codigo.md
 */
export default function DisclaimerPage() {
  return (
    <main className="min-h-dvh">
      <div className="container max-w-3xl py-12 md:py-20">
        <FadeIn>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-somno-accent/20 bg-somno-tint-info px-3.5 py-1.5 text-xs font-medium text-somno-accent-soft">
            <Stethoscope size={14} aria-hidden="true" />
            Director médico: Dr. Pablo Ferrero · M.N. 119.783
          </div>

          <h1 className="mb-8 font-display text-5xl font-normal tracking-tight md:text-6xl">
            Disclaimer médico
          </h1>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Alert variant="warning" className="mb-10 rounded-2xl border-somno-warm/30 bg-somno-tint-warn">
            <ShieldAlert className="h-5 w-5 text-somno-warm" aria-hidden="true" />
            <AlertTitle className="font-semibold text-somno-warm-soft">
              Importante — leé antes de continuar
            </AlertTitle>
            <AlertDescription className="text-foreground/85">
              <p className="mb-3 leading-relaxed">
                SomnoSalud es una herramienta <strong>orientativa</strong> de
                evaluación de trastornos del sueño. <strong>NO emite diagnóstico
                médico</strong> ni reemplaza la consulta con un profesional de
                la salud.
              </p>
              <p className="leading-relaxed">
                Las recomendaciones que vas a recibir son educativas y deben ser{' '}
                <strong>validadas por un médico</strong> antes de implementarlas.
                Si tenés síntomas urgentes o pensamientos de hacerte daño, llamá
                ahora a la línea de salud mental gratuita{' '}
                <strong className="font-mono">0800-999-0091</strong>.
              </p>
            </AlertDescription>
          </Alert>
        </FadeIn>

        <FadeIn delay={0.15} whenInView>
          <section className="glass-card mb-6 p-7">
            <h2 className="mb-4 font-display text-2xl font-normal tracking-tight text-foreground">
              ¿Qué hace esta evaluación?
            </h2>
            <ul className="space-y-3 text-sm leading-relaxed text-foreground/85">
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-somno-accent" aria-hidden="true" />
                <span>
                  Te hace <strong className="text-foreground">preguntas estandarizadas</strong> sobre tu sueño
                  usando instrumentos clínicos validados (ISI, ESS, STOP-BANG,
                  PHQ-9, GAD-7, DASS-21).
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-somno-accent" aria-hidden="true" />
                <span>
                  <strong className="text-foreground">Calcula scores</strong> respaldados por publicaciones
                  científicas peer-reviewed (con DOI/PMID verificables).
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-somno-accent" aria-hidden="true" />
                <span>
                  Te muestra un <strong className="text-foreground">perfil clínico orientativo</strong> y
                  recomendaciones basadas en evidencia.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-somno-warm" aria-hidden="true" />
                <span>
                  <strong className="text-foreground">NO te receta medicación</strong> ni emite diagnóstico
                  autónomo.
                </span>
              </li>
            </ul>
          </section>
        </FadeIn>

        <FadeIn delay={0.2} whenInView>
          <section className="glass-card mb-10 p-7">
            <h2 className="mb-4 font-display text-2xl font-normal tracking-tight text-foreground">
              ¿Cómo se usan tus datos?
            </h2>
            <p className="text-sm leading-relaxed text-foreground/85">
              Tus respuestas se guardan{' '}
              <strong className="text-foreground">en tu navegador</strong>{' '}
              mientras completás la evaluación (sessionStorage). Si cerrás la
              pestaña, los datos se pierden y empezás de nuevo. En el siguiente
              paso vas a poder leer y aceptar los términos completos antes de
              continuar.
            </p>
          </section>
        </FadeIn>

        <FadeIn delay={0.25} whenInView>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Button
              size="lg"
              asChild
              className="group h-12 rounded-full px-6 text-base shadow-glow-accent transition-all hover:shadow-[0_0_44px_rgba(129,140,248,0.45)]"
            >
              <Link href="/terms">
                Continuar a términos y condiciones
                <ArrowRight
                  aria-hidden="true"
                  className="ml-1 transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="h-12 rounded-full border-white/[0.10] bg-white/[0.02] px-6 text-base hover:bg-white/[0.06]"
            >
              <Link href="/">Volver al inicio</Link>
            </Button>
          </div>
        </FadeIn>
      </div>
    </main>
  );
}
