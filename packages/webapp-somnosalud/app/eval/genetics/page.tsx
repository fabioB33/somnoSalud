import { ProgressBar } from '@/components/eval/ProgressBar';

import { GeneticsForm } from './GeneticsForm';

/**
 * Pantalla /eval/genetics — 5 variantes geneticas relevantes al
 * sueno. OPCIONAL — el paciente puede saltar.
 *
 * Variantes (VARIANT_DEFS del clinical-engine):
 * - CLOCK (rs1801260): cronotipo
 * - PER2 (rs2304672): fase de sueno avanzada
 * - ADORA2A (rs5751876): sensibilidad a cafeina
 * - COMT (Val158Met): metabolismo dopaminergico
 * - MTHFR (C677T): metilacion + B12
 *
 * Datos sensibles especiales (Decreto 1089/2012): consentimiento
 * separado granular ya cubierto en /terms (Sprint 6) — el paciente
 * acepto procesar datos clinicos al aceptar T&C.
 *
 * @see docs/vault/clinical/COMPLIANCE-ARGENTINA.md §"Datos genéticos"
 */
export default function GeneticsPage() {
  return (
    <main className="min-h-dvh">
      <div className="container max-w-2xl py-8 md:py-12">
        <ProgressBar current={11} total={12} />
        <h1 className="mb-3 mt-4 text-3xl font-bold tracking-tight md:text-4xl">
          Variantes genéticas{' '}
          <span className="text-base font-normal text-muted-foreground">
            (opcional)
          </span>
        </h1>
        <p className="mb-2 text-base text-muted-foreground">
          Si te hiciste un estudio genético (ej: 23andMe, AncestryDNA, panel
          médico) y conocés tu genotipo en alguna de estas variantes,
          ingresalo para enriquecer las recomendaciones.
        </p>
        <p className="mb-8 text-sm text-muted-foreground">
          Si no sabés o no te hiciste estudios, podés saltar este paso. La
          mayoría de las recomendaciones funcionan sin estos datos.
        </p>

        <GeneticsForm />
      </div>
    </main>
  );
}
