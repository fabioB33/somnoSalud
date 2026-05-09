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
 * Sin separators por subscale (decision documentada en sprint doc):
 * los items estan intercalados por diseno del instrumento (anti
 * response-bias). Mostrarlos agrupados confundiria al paciente porque
 * el instrumento NO se valida con esa presentacion.
 *
 * Persistencia: state.dass21 = number[] (21 elementos).
 */
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
      />
    </div>
  );
}
