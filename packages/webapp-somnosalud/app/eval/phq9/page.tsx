import { FadeIn } from '@/components/motion/FadeIn';
import { StepHeader } from '@/components/eval/StepHeader';

import { PHQ9Form } from './PHQ9Form';

/**
 * Pantalla /eval/phq9 — Patient Health Questionnaire-9 (Kroenke et al. 2001).
 *
 * Sprint UX polish 2026-06-11: StepHeader reusable + FadeIn. Detección LIVE
 * del item 9 + CrisisHotlineCard intactos (en PHQ9Form Client Component).
 *
 * IMPORTANTE compliance: el item 9 ("Pensamientos de que estarias mejor
 * muerto/a o de hacerte dano de alguna forma") requiere DETECCION LIVE
 * con recurso de emergencia 24/7 (Decision E3 ADR-003 + agent
 * compliance-anmat). El recurso (linea 0800-999-0091) tambien aparece
 * SIEMPRE en footer del form, antes de marcar nada.
 *
 * Reference: Kroenke K, Spitzer RL, Williams JB. The PHQ-9: validity of
 * a brief depression severity measure. J Gen Intern Med. 2001;16(9):606-613.
 * DOI: 10.1046/j.1525-1497.2001.016009606.x
 */
export default function PHQ9Page() {
  return (
    <main className="min-h-dvh">
      <div className="container max-w-3xl py-10 md:py-14">
        <FadeIn>
          <StepHeader
            step={6}
            title="PHQ-9 — Salud mental"
            description="Patient Health Questionnaire-9. Evalúa síntomas de depresión."
          />
          <p className="mb-8 text-xs leading-relaxed text-muted-foreground">
            Instrumento validado: Kroenke K, Spitzer RL, Williams JB.{' '}
            <em>J Gen Intern Med. 2001;16(9):606-613.</em>{' '}
            <a
              href="https://doi.org/10.1046/j.1525-1497.2001.016009606.x"
              target="_blank"
              rel="noopener noreferrer"
              className="text-somno-accent underline-offset-4 hover:underline"
            >
              DOI: 10.1046/j.1525-1497.2001.016009606.x
            </a>
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <PHQ9Form />
        </FadeIn>
      </div>
    </main>
  );
}
