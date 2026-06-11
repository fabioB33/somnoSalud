import { FadeIn } from '@/components/motion/FadeIn';
import { StepHeader } from '@/components/eval/StepHeader';

import { SafetyForm } from './SafetyForm';

/**
 * Pantalla /eval/safety — Capa 4 de compliance gates (ADR-003).
 *
 * Sprint UX polish 2026-06-11: StepHeader reusable + FadeIn.
 *
 * @see docs/vault/architecture/adr/ADR-003-compliance-gates-en-codigo.md (Capa 4)
 * @see packages/clinical-engine/src/safety/rules.ts
 */
export default function SafetyPage() {
  return (
    <main className="min-h-dvh">
      <div className="container max-w-2xl py-10 md:py-14">
        <FadeIn>
          <StepHeader
            step={2}
            title="Seguridad clínica"
            description="Algunas condiciones especiales (embarazo, medicación actual, anticoagulantes) modifican qué recomendaciones son seguras para vos. Esta sección revisa esas condiciones siguiendo nuestras reglas de seguridad SAFE-010 a SAFE-040."
          />
        </FadeIn>

        <FadeIn delay={0.1}>
          <SafetyForm />
        </FadeIn>
      </div>
    </main>
  );
}
