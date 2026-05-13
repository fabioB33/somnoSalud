'use client';

import { useRouter } from 'next/navigation';

import { GAD7_ITEMS, GAD7_OPTIONS, GAD7_STEM } from 'somnosalud-clinical-engine';

import { FormSkeleton } from '@/components/eval/FormSkeleton';
import { QuestionnaireForm } from '@/components/eval/QuestionnaireForm';
import { usePersistEval } from '@/hooks/usePersistEval';

/**
 * GAD7Form — patron identico a ESSForm. 7 items con escala global
 * uniforme (GAD7_OPTIONS).
 */
export function GAD7Form() {
  const router = useRouter();
  const { state, hydrated, update } = usePersistEval();

  const handleSubmit = (responses: number[]) => {
    update({ gad7: responses });
    router.push('/eval/dass21');
  };

  if (!hydrated) {
    return (
      <FormSkeleton />
    );
  }

  return (
    <div className="space-y-6">
      <p className="rounded-lg border border-border/60 bg-card/40 p-4 text-sm">
        {GAD7_STEM}
      </p>

      <QuestionnaireForm
        instrumentName="gad7"
        items={GAD7_ITEMS}
        scale={GAD7_OPTIONS}
        initialResponses={state.gad7}
        onSubmit={handleSubmit}
        submitLabel="Continuar a DASS-21"
        cancelHref="/eval/phq9"
      />
    </div>
  );
}
