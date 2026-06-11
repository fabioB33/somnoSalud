import { FadeIn } from '@/components/motion/FadeIn';
import { StepHeader } from '@/components/eval/StepHeader';

import { SleepForm } from './SleepForm';

/**
 * Pantalla /eval/sleep — Diario de sueno (form custom).
 *
 * Sprint UX polish 2026-06-11: StepHeader reusable + FadeIn.
 */
export default function SleepPage() {
  return (
    <main className="min-h-dvh">
      <div className="container max-w-2xl py-10 md:py-14">
        <FadeIn>
          <StepHeader
            step={9}
            title="Diario de sueño"
            description="Pensá en cómo dormís típicamente en las últimas 2 semanas (no en una mala noche puntual)."
          />
        </FadeIn>

        <FadeIn delay={0.1}>
          <SleepForm />
        </FadeIn>
      </div>
    </main>
  );
}
