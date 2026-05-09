import { ProgressBar } from '@/components/eval/ProgressBar';

import { ESSForm } from './ESSForm';

/**
 * Pantalla /eval/ess — Epworth Sleepiness Scale (Johns 1991).
 *
 * 8 items, escala 0-3 con labels uniformes (probabilidad de dormirse
 * en distintas situaciones).
 *
 * Reference: Johns MW. A new method for measuring daytime sleepiness:
 * the Epworth sleepiness scale. Sleep. 1991;14(6):540-545.
 */
export default function ESSPage() {
  return (
    <main className="min-h-dvh">
      <div className="container max-w-3xl py-8 md:py-12">
        <ProgressBar current={4} total={12} />
        <h1 className="mb-3 mt-4 text-3xl font-bold tracking-tight md:text-4xl">
          Epworth Sleepiness Scale (ESS)
        </h1>
        <p className="mb-2 text-base text-muted-foreground">
          ¿Qué tan probable es que te duermas (no solo te sientas
          cansado/a) en cada una de las siguientes situaciones?
        </p>
        <p className="mb-2 text-sm text-muted-foreground">
          Pensá cómo te has sentido habitualmente en las últimas semanas,
          aunque no hayas vivido alguna de estas situaciones recientemente.
        </p>
        <p className="mb-8 text-xs text-muted-foreground">
          Instrumento validado: Johns MW.{' '}
          <em>Sleep. 1991;14(6):540-545.</em>
        </p>

        <ESSForm />
      </div>
    </main>
  );
}
