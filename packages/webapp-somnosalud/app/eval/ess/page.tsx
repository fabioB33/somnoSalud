import { FadeIn } from '@/components/motion/FadeIn';
import { StepHeader } from '@/components/eval/StepHeader';

import { ESSForm } from './ESSForm';

/**
 * Pantalla /eval/ess — Epworth Sleepiness Scale (Johns 1991).
 *
 * Sprint UX polish 2026-06-11: StepHeader reusable + FadeIn.
 *
 * Reference: Johns MW. A new method for measuring daytime sleepiness:
 * the Epworth sleepiness scale. Sleep. 1991;14(6):540-545.
 */
export default function ESSPage() {
  return (
    <main className="min-h-dvh">
      <div className="container max-w-3xl py-10 md:py-14">
        <FadeIn>
          <StepHeader
            step={4}
            title="Epworth Sleepiness Scale (ESS)"
            description="¿Qué tan probable es que te duermas (no solo te sientas cansado/a) en cada una de las siguientes situaciones?"
          />
          <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
            Pensá cómo te has sentido habitualmente en las últimas semanas,
            aunque no hayas vivido alguna de estas situaciones recientemente.
          </p>
          <p className="mb-8 text-xs text-muted-foreground">
            Instrumento validado: Johns MW.{' '}
            <em>Sleep. 1991;14(6):540-545.</em>
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <ESSForm />
        </FadeIn>
      </div>
    </main>
  );
}
