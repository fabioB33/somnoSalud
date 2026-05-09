'use client';

import { useRouter } from 'next/navigation';

import { ESS_ITEMS, ESS_OPTIONS } from 'somnosalud-clinical-engine';

import { QuestionnaireForm } from '@/components/eval/QuestionnaireForm';
import { usePersistEval } from '@/hooks/usePersistEval';

/**
 * ESSForm — wrapper de QuestionnaireForm para Epworth Sleepiness Scale.
 *
 * ESS_ITEMS es {number, text} sin options propios (escala uniforme),
 * por lo que la scale global ESS_OPTIONS se aplica a los 8 items.
 *
 * Persiste responses en sessionStorage state.ess como number[].
 */
export function ESSForm() {
  const router = useRouter();
  const { state, hydrated, update } = usePersistEval();

  const handleSubmit = (responses: number[]) => {
    update({ ess: responses });
    router.push('/eval/stopbang');
  };

  if (!hydrated) {
    return (
      <div className="rounded-lg border border-border/60 bg-card/40 p-6">
        <p className="text-sm text-muted-foreground">Cargando datos...</p>
      </div>
    );
  }

  return (
    <QuestionnaireForm
      instrumentName="ess"
      items={ESS_ITEMS}
      scale={ESS_OPTIONS}
      initialResponses={state.ess}
      onSubmit={handleSubmit}
      submitLabel="Continuar a STOP-BANG"
      cancelHref="/eval/isi"
    />
  );
}
