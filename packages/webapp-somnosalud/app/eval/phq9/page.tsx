import { ProgressBar } from '@/components/eval/ProgressBar';

import { PHQ9Form } from './PHQ9Form';

/**
 * Pantalla /eval/phq9 — Patient Health Questionnaire-9 (Kroenke et al. 2001).
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
      <div className="container max-w-3xl py-8 md:py-12">
        <ProgressBar current={6} total={12} />
        <h1 className="mb-3 mt-4 text-3xl font-bold tracking-tight md:text-4xl">
          PHQ-9 — Salud mental
        </h1>
        <p className="mb-2 text-base text-muted-foreground">
          Patient Health Questionnaire-9. Evalúa síntomas de depresión.
        </p>
        <p className="mb-8 text-xs text-muted-foreground">
          Instrumento validado: Kroenke K, Spitzer RL, Williams JB.{' '}
          <em>J Gen Intern Med. 2001;16(9):606-613.</em>{' '}
          <a
            href="https://doi.org/10.1046/j.1525-1497.2001.016009606.x"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-4 hover:underline"
          >
            DOI: 10.1046/j.1525-1497.2001.016009606.x
          </a>
        </p>

        <PHQ9Form />
      </div>
    </main>
  );
}
