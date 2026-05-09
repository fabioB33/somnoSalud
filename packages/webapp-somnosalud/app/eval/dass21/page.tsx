import { ProgressBar } from '@/components/eval/ProgressBar';

import { DASS21Form } from './DASS21Form';

/**
 * Pantalla /eval/dass21 — Depression, Anxiety and Stress Scale-21
 * (Lovibond & Lovibond 1995).
 *
 * 21 items intercalados entre 3 subscales (depression, anxiety, stress)
 * — los items NO estan ordenados por subscale, eso es por diseno del
 * instrumento (anti response-bias). Decision Sprint 7.B: mostrarlos
 * en orden canonico DASS21_ITEMS sin separators de subscale (eso
 * confundiria al paciente al ver "saltos" entre temas).
 *
 * Reference: Lovibond SH & Lovibond PF. Manual for the Depression
 * Anxiety Stress Scales. (2nd ed.) Sydney: Psychology Foundation.
 * 1995.
 */
export default function DASS21Page() {
  return (
    <main className="min-h-dvh">
      <div className="container max-w-3xl py-8 md:py-12">
        <ProgressBar current={8} total={12} />
        <h1 className="mb-3 mt-4 text-3xl font-bold tracking-tight md:text-4xl">
          DASS-21 — Depresión, ansiedad y estrés
        </h1>
        <p className="mb-2 text-base text-muted-foreground">
          Depression, Anxiety and Stress Scale. 21 afirmaciones sobre la
          última semana.
        </p>
        <p className="mb-2 text-sm text-muted-foreground">
          Las preguntas evalúan tres dimensiones (depresión, ansiedad y
          estrés) y aparecen intercaladas. Eso es normal — el instrumento
          fue diseñado así. Respondé pensando en cuánto te aplicó cada
          afirmación durante <strong>la última semana</strong>.
        </p>
        <p className="mb-8 text-xs text-muted-foreground">
          Instrumento validado: Lovibond SH, Lovibond PF.{' '}
          <em>Manual for the Depression Anxiety Stress Scales (2nd ed.)
          Sydney: Psychology Foundation. 1995.</em>
        </p>

        <DASS21Form />
      </div>
    </main>
  );
}
