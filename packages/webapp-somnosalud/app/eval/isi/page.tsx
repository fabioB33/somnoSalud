import { ProgressBar } from '@/components/eval/ProgressBar';

import { ISIForm } from './ISIForm';

/**
 * Pantalla /eval/isi — Insomnia Severity Index (Bastien et al. 2001).
 *
 * Server Component renderiza header + ProgressBar + intro clinico.
 * El form interactivo es Client Component que usa <QuestionnaireForm>
 * generico con ISI_ITEMS del clinical-engine.
 *
 * Reference: Bastien CH, Vallières A, Morin CM. Validation of the
 * Insomnia Severity Index as an outcome measure for insomnia research.
 * Sleep Med. 2001;2(4):297-307.
 * DOI: 10.1016/S1389-9457(00)00065-4
 */
export default function ISIPage() {
  return (
    <main className="min-h-dvh">
      <div className="container max-w-3xl py-8 md:py-12">
        <ProgressBar current={3} total={12} />
        <h1 className="mb-3 mt-4 text-3xl font-bold tracking-tight md:text-4xl">
          Insomnia Severity Index (ISI)
        </h1>
        <p className="mb-2 text-base text-muted-foreground">
          7 preguntas sobre la severidad de tu insomnio en las últimas 2
          semanas.
        </p>
        <p className="mb-8 text-xs text-muted-foreground">
          Instrumento validado: Bastien CH, Vallières A, Morin CM.{' '}
          <em>Sleep Med. 2001;2(4):297-307.</em>{' '}
          <a
            href="https://doi.org/10.1016/S1389-9457(00)00065-4"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-4 hover:underline"
          >
            DOI: 10.1016/S1389-9457(00)00065-4
          </a>
        </p>

        <ISIForm />
      </div>
    </main>
  );
}
