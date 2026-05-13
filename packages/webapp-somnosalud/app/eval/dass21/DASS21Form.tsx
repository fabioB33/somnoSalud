'use client';

import { useRouter } from 'next/navigation';

import {
  DASS21_ITEMS,
  DASS21_OPTIONS,
  DASS21_STEM,
} from 'somnosalud-clinical-engine';

import { QuestionnaireForm } from '@/components/eval/QuestionnaireForm';
import { usePersistEval } from '@/hooks/usePersistEval';

/**
 * DASS21Form — 21 items intercalados entre depression/anxiety/stress.
 *
 * Sin separators por subscale (decision documentada en sprint 7.B):
 * los items estan intercalados por diseno del instrumento (anti
 * response-bias). Mostrarlos agrupados confundiria al paciente porque
 * el instrumento NO se valida con esa presentacion.
 *
 * Sprint 8.5: agregamos separators visuales "Parte 1/2/3 de 3" cada
 * 7 items SOLO para descanso visual del paciente. NO mencionan la
 * subscale (depression/anxiety/stress) — solo dividen visualmente.
 *
 * Persistencia: state.dass21 = number[] (21 elementos).
 */

/**
 * Separators visuales del DASS-21 — solo descanso visual (3 grupos de 7
 * items). NO menciona subscale (los items siguen intercalados en orden
 * canonico del instrumento).
 */
const DASS21_SEPARATORS = new Map<number, string>([
  [0, 'Parte 1 de 3'],
  [7, 'Parte 2 de 3'],
  [14, 'Parte 3 de 3'],
]);

export function DASS21Form() {
  const router = useRouter();
  const { state, hydrated, update } = usePersistEval();

  const handleSubmit = (responses: number[]) => {
    update({ dass21: responses });
    router.push('/eval/sleep');
  };

  if (!hydrated) {
    return (
      <div className="rounded-lg border border-border/60 bg-card/40 p-6">
        <p className="text-sm text-muted-foreground">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="rounded-lg border border-border/60 bg-card/40 p-4 text-sm">
        {DASS21_STEM}
      </p>

      <QuestionnaireForm
        instrumentName="dass21"
        items={DASS21_ITEMS}
        scale={DASS21_OPTIONS}
        initialResponses={state.dass21}
        onSubmit={handleSubmit}
        submitLabel="Continuar a Diario de sueño"
        cancelHref="/eval/gad7"
        itemSeparators={DASS21_SEPARATORS}
      />
    </div>
  );
}
