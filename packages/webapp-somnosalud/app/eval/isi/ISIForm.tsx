'use client';

import { useRouter } from 'next/navigation';

import { ISI_ITEMS } from 'somnosalud-clinical-engine';

import { FormSkeleton } from '@/components/eval/FormSkeleton';
import { QuestionnaireForm } from '@/components/eval/QuestionnaireForm';
import { usePersistEval } from '@/hooks/usePersistEval';

/**
 * ISIForm — wrapper de QuestionnaireForm para Insomnia Severity Index.
 *
 * Usa ISI_ITEMS del clinical-engine como source of truth (cada item
 * trae sus propios options con labels distintos por contexto). La scale
 * global pasa como fallback (no se usa porque ISI_ITEMS tiene options
 * propios).
 *
 * Persiste responses en sessionStorage state.isi como number[].
 *
 * El scoring (scoreISI) se invoca en /eval/results (Sprint 8) — este
 * sprint solo persiste las respuestas crudas.
 */
export function ISIForm() {
  const router = useRouter();
  const { state, hydrated, update } = usePersistEval();

  const handleSubmit = (responses: number[]) => {
    update({ isi: responses });
    router.push('/eval/ess');
  };

  if (!hydrated) {
    return <FormSkeleton />;
  }

  return (
    <QuestionnaireForm
      instrumentName="isi"
      items={ISI_ITEMS}
      // scale fallback (no se usa porque ISI_ITEMS tiene options propios).
      scale={[
        { value: 0, label: 'Ninguna' },
        { value: 1, label: 'Leve' },
        { value: 2, label: 'Moderada' },
        { value: 3, label: 'Severa' },
        { value: 4, label: 'Muy severa' },
      ]}
      initialResponses={state.isi}
      onSubmit={handleSubmit}
      submitLabel="Continuar a ESS"
      cancelHref="/eval/safety"
    />
  );
}
