import { Suspense } from 'react';

import { DisclaimerBanner } from '@/components/compliance/DisclaimerBanner';

import { Skeleton } from '@/components/ui/skeleton';

import { ResultsContent } from './ResultsContent';

function ResultsLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-60 w-full" />
      <span className="sr-only">Cargando resultados...</span>
    </div>
  );
}

/**
 * Pantalla /eval/results — Capa 5 ADR-003.
 *
 * Server Component renderiza header + DisclaimerBanner reforzado +
 * <ResultsContent /> (Client Component que invoca buildResults).
 *
 * Compliance:
 * - DisclaimerBanner variant="reinforced" arriba (ANTES del contenido)
 *   y abajo (DESPUES del contenido) — paciente NO puede leer
 *   recomendaciones sin ver el disclaimer reforzado primero.
 * - M.N. Pablo Ferrero 119.783 visible en footer + en disclaimer.
 * - Si flow incompleto, ResultsContent redirige al primer paso faltante.
 *
 * @see docs/vault/architecture/adr/ADR-003-compliance-gates-en-codigo.md (Capa 5)
 */
export default function ResultsPage() {
  return (
    <main className="min-h-dvh print:bg-white print:text-black">
      {/* Disclaimer reforzado ARRIBA */}
      <DisclaimerBanner variant="reinforced" />

      <div className="container max-w-4xl py-8 md:py-12 print:max-w-full print:py-4">
        {/* Suspense wrapper requerido por useSearchParams() para el static
            prerender de Next.js 14. */}
        <Suspense fallback={<ResultsLoading />}>
          <ResultsContent />
        </Suspense>
      </div>

      {/* Disclaimer reforzado ABAJO (segunda vez, principio de safety) */}
      <DisclaimerBanner variant="reinforced" />

      <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-muted-foreground print:border-foreground/40">
        <p>
          <strong className="text-foreground/85">SomnoSalud</strong> ·
          Plataforma médica digital · Buenos Aires, Argentina
        </p>
        <p className="mt-1.5">
          Director médico responsable: Dr. Pablo Ferrero — M.N. 119.783 ·
          Instituto Ferrero de Neurología y Sueño (IFN)
        </p>
      </footer>
    </main>
  );
}
