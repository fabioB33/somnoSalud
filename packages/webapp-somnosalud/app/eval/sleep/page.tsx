import { ProgressBar } from '@/components/eval/ProgressBar';

import { SleepForm } from './SleepForm';

/**
 * Pantalla /eval/sleep — Diario de sueno (form custom, no escalar).
 *
 * 7 campos heterogeneos sobre patron de sueno tipico del paciente.
 * No usa <QuestionnaireForm> porque los inputs son heterogeneos
 * (number, time, slider 1-10).
 *
 * Estos datos alimentan el clinical-engine engine/phenotype y
 * engine/precision en /eval/results (Sprint 8).
 */
export default function SleepPage() {
  return (
    <main className="min-h-dvh">
      <div className="container max-w-2xl py-8 md:py-12">
        <ProgressBar current={9} total={12} />
        <h1 className="mb-3 mt-4 text-3xl font-bold tracking-tight md:text-4xl">
          Diario de sueño
        </h1>
        <p className="mb-8 text-base text-muted-foreground">
          Pensá en cómo dormís <strong>típicamente</strong> en las últimas
          2 semanas (no en una mala noche puntual).
        </p>

        <SleepForm />
      </div>
    </main>
  );
}
