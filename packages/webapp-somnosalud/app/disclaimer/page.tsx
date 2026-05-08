import Link from 'next/link';
import { ArrowRight, ShieldAlert, Stethoscope } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * Pantalla /disclaimer — primera de las pantallas P0 compliance gates.
 *
 * Compliance: cumple Ley 26.529 art. 5 (informacion clara y comprensible
 * al paciente sobre alcance de la evaluacion) ANTES de mostrar T&C.
 *
 * Server Component (default) — solo renderiza props + Link de Next.
 *
 * @see docs/vault/clinical/COMPLIANCE-ARGENTINA.md §"Disclaimer médico obligatorio (texto canónico)"
 * @see docs/vault/architecture/adr/ADR-003-compliance-gates-en-codigo.md
 */
export default function DisclaimerPage() {
  return (
    <main className="min-h-dvh">
      <div className="container max-w-3xl py-12 md:py-20">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Stethoscope size={14} aria-hidden="true" />
          Director médico: Dr. Pablo Ferrero · M.N. 119.783
        </div>

        <h1 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl">
          Disclaimer médico
        </h1>

        <Alert variant="warning" className="mb-8">
          <ShieldAlert className="h-5 w-5" aria-hidden="true" />
          <AlertTitle>Importante — leé antes de continuar</AlertTitle>
          <AlertDescription>
            <p className="mb-3">
              SomnoSalud es una herramienta <strong>orientativa</strong> de
              evaluación de trastornos del sueño. <strong>NO emite diagnóstico
              médico</strong> ni reemplaza la consulta con un profesional de
              la salud.
            </p>
            <p>
              Las recomendaciones que vas a recibir son educativas y deben ser{' '}
              <strong>validadas por un médico</strong> antes de implementarlas.
              Si tenés síntomas urgentes o pensamientos de hacerte daño, llamá
              ahora a la línea de salud mental gratuita{' '}
              <strong>0800-999-0091</strong>.
            </p>
          </AlertDescription>
        </Alert>

        <section className="mb-8 space-y-4 text-sm leading-relaxed text-foreground/90">
          <h2 className="text-lg font-semibold text-foreground">
            ¿Qué hace esta evaluación?
          </h2>
          <ul className="ml-5 list-disc space-y-2">
            <li>
              Te hace <strong>preguntas estandarizadas</strong> sobre tu sueño
              usando instrumentos clínicos validados (ISI, ESS, STOP-BANG,
              PHQ-9, GAD-7, DASS-21).
            </li>
            <li>
              <strong>Calcula scores</strong> respaldados por publicaciones
              científicas peer-reviewed (con DOI/PMID verificables).
            </li>
            <li>
              Te muestra un <strong>perfil clínico orientativo</strong> y
              recomendaciones basadas en evidencia.
            </li>
            <li>
              <strong>NO te receta medicación</strong> ni emite diagnóstico
              autónomo.
            </li>
          </ul>
        </section>

        <section className="mb-10 space-y-4 text-sm leading-relaxed text-foreground/90">
          <h2 className="text-lg font-semibold text-foreground">
            ¿Cómo se usan tus datos?
          </h2>
          <p>
            Tus respuestas se guardan <strong>en tu navegador</strong> mientras
            completás la evaluación (sessionStorage). Si cerrás la pestaña, los
            datos se pierden y empezás de nuevo. En el siguiente paso vas a
            poder leer y aceptar los términos completos antes de continuar.
          </p>
        </section>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <Button size="lg" asChild>
            <Link href="/terms">
              Continuar a términos y condiciones
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
