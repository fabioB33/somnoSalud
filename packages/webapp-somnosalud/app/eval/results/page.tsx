import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ProgressBar } from '@/components/eval/ProgressBar';

/**
 * Pantalla /eval/results — PLACEHOLDER Sprint 8.
 *
 * Implementacion completa Sprint 8 (Capa 5 ADR-003):
 * - Invocar scoreISI, scoreESS, scoreSTOPBANG, scorePHQ9, scoreGAD7,
 *   scoreDASS21, calculateBMI desde clinical-engine con responses
 *   de sessionStorage.
 * - Invocar classifyInsomniaPhenotype + assessRisk +
 *   generateRecommendations + calculatePrecision.
 * - Si lab presente: invocar analyzeLabPanel.
 * - Si genetics presente: invocar analyzeGeneticProfile.
 * - Renderizar resultados con disclaimer reforzado + M.N. Pablo
 *   Ferrero + recomendaciones por evidencia level (A/B/C) +
 *   call-to-action a especialista si red flags + boton "Imprimir/PDF"
 *   + "Empezar de nuevo".
 *
 * Por ahora muestra mensaje "Próximamente Sprint 8" con boton volver
 * al inicio para que el flow Sprint 7.B no rompa con 404.
 */
export default function ResultsPlaceholderPage() {
  return (
    <main className="min-h-dvh">
      <div className="container max-w-2xl py-8 md:py-12">
        <ProgressBar current={12} total={12} label="Paso 12 de 12" />
        <h1 className="mb-3 mt-4 text-3xl font-bold tracking-tight md:text-4xl">
          Tus resultados
        </h1>

        <Alert variant="info" className="my-8">
          <AlertTitle>Próximamente — Sprint 8</AlertTitle>
          <AlertDescription>
            <p className="mb-3">
              Completaste todos los pasos de la evaluación. ¡Felicitaciones!
            </p>
            <p className="mb-3">
              La pantalla de resultados con scoring + recomendaciones +
              perfil clínico se implementará en el próximo sprint.
            </p>
            <p>
              Tus respuestas están guardadas localmente en tu navegador. Si
              cerrás la pestaña, se pierden y empezás de nuevo.
            </p>
          </AlertDescription>
        </Alert>

        <Button variant="outline" size="lg" asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </main>
  );
}
