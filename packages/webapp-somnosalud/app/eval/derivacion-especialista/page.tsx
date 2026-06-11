import { Stethoscope } from 'lucide-react';

import { FadeIn } from '@/components/motion/FadeIn';

import { DerivacionContent } from './DerivacionContent';

/**
 * Pantalla /eval/derivacion-especialista — destino del block hard de
 * Capa 4 (ADR-003 Decision D1).
 *
 * Sprint UX polish 2026-06-11: jerarquía display + FadeIn.
 *
 * Cuando evaluateAllSafetyRules detecta una rule con severity 'block'
 * triggered, SafetyForm persiste la evaluacion en sessionStorage y
 * redirige aca.
 */
export default function DerivacionEspecialistaPage() {
  return (
    <main className="min-h-dvh">
      <div className="container max-w-2xl py-10 md:py-14">
        <FadeIn>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-somno-warm/25 bg-somno-tint-warn px-3.5 py-1.5 text-xs font-medium text-somno-warm-soft">
            <Stethoscope size={14} aria-hidden="true" />
            Derivación a especialista
          </div>

          <h1 className="mb-4 font-display text-4xl font-normal leading-[1.05] tracking-tight md:text-5xl">
            Te recomendamos consultar con un especialista
          </h1>
          <p className="mb-10 text-base leading-relaxed text-muted-foreground">
            Detectamos condiciones especiales que requieren evaluación
            presencial con un profesional de la salud antes de continuar con
            la evaluación auto-administrada.
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <DerivacionContent />
        </FadeIn>
      </div>
    </main>
  );
}
