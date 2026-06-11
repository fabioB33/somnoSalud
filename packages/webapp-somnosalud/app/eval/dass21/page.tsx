import { FadeIn } from '@/components/motion/FadeIn';
import { StepHeader } from '@/components/eval/StepHeader';

import { DASS21Form } from './DASS21Form';

/**
 * Pantalla /eval/dass21 — Depression, Anxiety and Stress Scale-21
 * (Lovibond & Lovibond 1995).
 *
 * Sprint UX polish 2026-06-11: StepHeader reusable + FadeIn.
 *
 * 21 items intercalados entre 3 subscales — anti response-bias.
 *
 * Reference: Lovibond SH & Lovibond PF. Manual for the Depression
 * Anxiety Stress Scales. (2nd ed.) Sydney: Psychology Foundation.
 * 1995.
 */
export default function DASS21Page() {
  return (
    <main className="min-h-dvh">
      <div className="container max-w-3xl py-10 md:py-14">
        <FadeIn>
          <StepHeader
            step={8}
            title="DASS-21 — Depresión, ansiedad y estrés"
            description="Depression, Anxiety and Stress Scale. 21 afirmaciones sobre la última semana."
          />
          <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
            Las preguntas evalúan tres dimensiones (depresión, ansiedad y
            estrés) y aparecen intercaladas. Eso es normal — el instrumento
            fue diseñado así. Respondé pensando en cuánto te aplicó cada
            afirmación durante <strong className="text-foreground/85">la última semana</strong>.
          </p>
          <p className="mb-8 text-xs text-muted-foreground">
            Instrumento validado: Lovibond SH, Lovibond PF.{' '}
            <em>
              Manual for the Depression Anxiety Stress Scales (2nd ed.)
              Sydney: Psychology Foundation. 1995.
            </em>
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <DASS21Form />
        </FadeIn>
      </div>
    </main>
  );
}
