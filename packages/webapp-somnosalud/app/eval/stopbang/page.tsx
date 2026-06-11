import { FadeIn } from '@/components/motion/FadeIn';
import { StepHeader } from '@/components/eval/StepHeader';

import { STOPBangForm } from './STOPBangForm';

/**
 * Pantalla /eval/stopbang — STOP-BANG (Chung et al. 2008).
 *
 * Sprint UX polish 2026-06-11: StepHeader reusable + FadeIn.
 *
 * Reference: Chung F et al. STOP questionnaire: a tool to screen
 * patients for obstructive sleep apnea. Anesthesiology. 2008;108(5):812-821.
 */
export default function STOPBangPage() {
  return (
    <main className="min-h-dvh">
      <div className="container max-w-3xl py-10 md:py-14">
        <FadeIn>
          <StepHeader
            step={5}
            title="STOP-BANG"
            description="Screening de riesgo de apnea obstructiva del sueño. 5 preguntas + 3 datos calculados desde tu perfil."
          />
          <p className="mb-8 text-xs text-muted-foreground">
            Instrumento validado: Chung F et al.{' '}
            <em>Anesthesiology. 2008;108(5):812-821.</em>
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <STOPBangForm />
        </FadeIn>
      </div>
    </main>
  );
}
