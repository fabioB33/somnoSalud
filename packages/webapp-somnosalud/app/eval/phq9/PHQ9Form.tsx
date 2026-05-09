'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { PHQ9_ITEMS, PHQ9_OPTIONS, PHQ9_STEM } from 'somnosalud-clinical-engine';

import { QuestionnaireForm } from '@/components/eval/QuestionnaireForm';
import { CrisisHotlineCard } from '@/components/compliance/CrisisHotlineCard';
import { usePersistEval } from '@/hooks/usePersistEval';

/**
 * Indice del item de ideacion suicida en PHQ-9 (1-indexed = 9).
 * 0-indexed (como esta en el array de items y responses) = 8.
 */
const ITEM_9_IDX = 8;

/**
 * PHQ9Form — wrapper de QuestionnaireForm con detection live ítem 9.
 *
 * Compliance gate (Decision E3 ADR-003):
 * 1. CrisisHotlineCard variant="default" SIEMPRE visible en footer
 *    (antes de marcar nada).
 * 2. Si el paciente marca item 9 (idx 8) >= 1, la card cambia a
 *    variant="reinforced" + se muestra ARRIBA del form (no solo en
 *    footer). Esto sucede en el momento del onChange — sin esperar
 *    al submit.
 *
 * Esto cumple la regla del agent compliance-anmat: "Detectar
 * automatica de PHQ-9 item 9 >= 1 → recurso emergencia 24/7".
 */
export function PHQ9Form() {
  const router = useRouter();
  const { state, hydrated, update } = usePersistEval();
  const [item9Triggered, setItem9Triggered] = useState(
    () => (state.phq9?.[ITEM_9_IDX] ?? 0) >= 1,
  );

  const handleResponseChange = (itemIdx: number, value: number) => {
    if (itemIdx === ITEM_9_IDX) {
      setItem9Triggered(value >= 1);
    }
  };

  const handleSubmit = (responses: number[]) => {
    update({ phq9: responses });
    router.push('/eval/gad7');
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
      {/* Stem (instrucciones canonicas del clinical-engine). */}
      <p className="rounded-lg border border-border/60 bg-card/40 p-4 text-sm">
        {PHQ9_STEM}
      </p>

      {/* Card de emergencia REFORZADA arriba del form si item 9 >= 1. */}
      {item9Triggered && <CrisisHotlineCard variant="reinforced" />}

      <QuestionnaireForm
        instrumentName="phq9"
        items={PHQ9_ITEMS}
        scale={PHQ9_OPTIONS}
        initialResponses={state.phq9}
        onSubmit={handleSubmit}
        onResponseChange={handleResponseChange}
        submitLabel="Continuar a GAD-7"
        cancelHref="/eval/stopbang"
      />

      {/* Card de emergencia DEFAULT siempre visible en footer (Decision E3). */}
      {!item9Triggered && <CrisisHotlineCard variant="default" />}
    </div>
  );
}
