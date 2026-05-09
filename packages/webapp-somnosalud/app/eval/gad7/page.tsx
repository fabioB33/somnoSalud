import { ProgressBar } from '@/components/eval/ProgressBar';

import { GAD7Form } from './GAD7Form';

/**
 * Pantalla /eval/gad7 — Generalized Anxiety Disorder-7 (Spitzer et al. 2006).
 *
 * 7 items, escala 0-3 uniforme (mismo OPTIONS que PHQ-9). Patron
 * identico a ESS — usa <QuestionnaireForm> generico.
 *
 * Reference: Spitzer RL, Kroenke K, Williams JB, Lowe B. A brief
 * measure for assessing generalized anxiety disorder: the GAD-7.
 * Arch Intern Med. 2006;166(10):1092-1097.
 * DOI: 10.1001/archinte.166.10.1092
 */
export default function GAD7Page() {
  return (
    <main className="min-h-dvh">
      <div className="container max-w-3xl py-8 md:py-12">
        <ProgressBar current={7} total={12} />
        <h1 className="mb-3 mt-4 text-3xl font-bold tracking-tight md:text-4xl">
          GAD-7 — Ansiedad
        </h1>
        <p className="mb-2 text-base text-muted-foreground">
          Generalized Anxiety Disorder-7. Evalúa síntomas de ansiedad
          generalizada en las últimas 2 semanas.
        </p>
        <p className="mb-8 text-xs text-muted-foreground">
          Instrumento validado: Spitzer RL, Kroenke K, Williams JB, Löwe B.{' '}
          <em>Arch Intern Med. 2006;166(10):1092-1097.</em>{' '}
          <a
            href="https://doi.org/10.1001/archinte.166.10.1092"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-4 hover:underline"
          >
            DOI: 10.1001/archinte.166.10.1092
          </a>
        </p>

        <GAD7Form />
      </div>
    </main>
  );
}
