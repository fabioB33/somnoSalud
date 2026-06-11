import { FadeIn } from '@/components/motion/FadeIn';
import { StepHeader } from '@/components/eval/StepHeader';

import { ISIForm } from './ISIForm';

/**
 * Pantalla /eval/isi — Insomnia Severity Index (Bastien et al. 2001).
 *
 * Sprint UX polish 2026-06-11: StepHeader reusable + FadeIn. Reference DOI/PMID
 * preservada.
 *
 * Reference: Bastien CH, Vallières A, Morin CM. Validation of the
 * Insomnia Severity Index as an outcome measure for insomnia research.
 * Sleep Med. 2001;2(4):297-307.
 * DOI: 10.1016/S1389-9457(00)00065-4
 */
export default function ISIPage() {
  return (
    <main className="min-h-dvh">
      <div className="container max-w-3xl py-10 md:py-14">
        <FadeIn>
          <StepHeader
            step={3}
            title="Insomnia Severity Index (ISI)"
            description="7 preguntas sobre la severidad de tu insomnio en las últimas 2 semanas."
          />
          <p className="mb-8 text-xs leading-relaxed text-muted-foreground">
            Instrumento validado: Bastien CH, Vallières A, Morin CM.{' '}
            <em>Sleep Med. 2001;2(4):297-307.</em>{' '}
            <a
              href="https://doi.org/10.1016/S1389-9457(00)00065-4"
              target="_blank"
              rel="noopener noreferrer"
              className="text-somno-accent underline-offset-4 hover:underline"
            >
              DOI: 10.1016/S1389-9457(00)00065-4
            </a>
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <ISIForm />
        </FadeIn>
      </div>
    </main>
  );
}
