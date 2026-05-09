import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ProgressBar } from '@/components/eval/ProgressBar';

/**
 * Pantalla /eval/phq9 — PLACEHOLDER Sprint 7.B.
 *
 * Se implementa completo en Sprint 7.B con:
 * - PHQ-9 9 items, escala 0-3 (Kroenke 2001).
 * - Detección automática ítem 9 ≥ 1 (ideación suicida) → recurso
 *   emergencia 24/7 línea 0800-999-0091 visible inmediatamente.
 * - Recurso emergencia siempre visible en footer del form (Decisión E3).
 *
 * Por ahora muestra placeholder con boton "Volver" para que el flow
 * de Sprint 7.A (welcome -> ... -> /eval/stopbang -> ???) tenga un
 * destino sin 404.
 */
export default function PHQ9PlaceholderPage() {
  return (
    <main className="min-h-dvh">
      <div className="container max-w-2xl py-8 md:py-12">
        <ProgressBar current={6} total={12} />
        <h1 className="mb-3 mt-4 text-3xl font-bold tracking-tight md:text-4xl">
          PHQ-9 — Salud mental
        </h1>

        <Alert variant="info" className="my-8">
          <AlertTitle>Próximamente — Sprint 7.B</AlertTitle>
          <AlertDescription>
            Esta pantalla se implementará en el próximo sprint. Va a evaluar
            síntomas de depresión usando el PHQ-9 (Patient Health
            Questionnaire-9) con detección automática de ideación suicida.
            Por ahora, tus respuestas previas (profile, safety, ISI, ESS,
            STOP-BANG) ya están guardadas localmente.
          </AlertDescription>
        </Alert>

        <Button variant="outline" size="lg" asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </main>
  );
}
