import { FadeIn } from '@/components/motion/FadeIn';
import { StepHeader } from '@/components/eval/StepHeader';

import { GAD7Form } from './GAD7Form';

/**
 * Pantalla /eval/gad7 — Generalized Anxiety Disorder-7 (Spitzer et al. 2006).
 *
 * Sprint UX polish 2026-06-11: StepHeader reusable + FadeIn.
 *
 * Reference: Spitzer RL, Kroenke K, Williams JB, Lowe B. A brief
 * measure for assessing generalized anxiety disorder: the GAD-7.
 * Arch Intern Med. 2006;166(10):1092-1097.
 * DOI: 10.1001/archinte.166.10.1092
 */
export default function GAD7Page() {
  return (
    <main className="min-h-dvh">
      <div className="container max-w-3xl py-10 md:py-14">
        <FadeIn>
          <StepHeader
            step={7}
            title="GAD-7 — Ansiedad"
            description="Generalized Anxiety Disorder-7. Evalúa síntomas de ansiedad generalizada en las últimas 2 semanas."
          />
          <p className="mb-8 text-xs leading-relaxed text-muted-foreground">
            Instrumento validado: Spitzer RL, Kroenke K, Williams JB, Löwe B.{' '}
            <em>Arch Intern Med. 2006;166(10):1092-1097.</em>{' '}
            <a
              href="https://doi.org/10.1001/archinte.166.10.1092"
              target="_blank"
              rel="noopener noreferrer"
              className="text-somno-accent underline-offset-4 hover:underline"
            >
              DOI: 10.1001/archinte.166.10.1092
            </a>
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <GAD7Form />
        </FadeIn>
      </div>
    </main>
  );
}
