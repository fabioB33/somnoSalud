import { FadeIn } from '@/components/motion/FadeIn';
import { StepHeader } from '@/components/eval/StepHeader';

import { GeneticsForm } from './GeneticsForm';

/**
 * Pantalla /eval/genetics — 5 variantes geneticas (OPCIONAL).
 *
 * Sprint UX polish 2026-06-11: StepHeader reusable + FadeIn.
 *
 * @see docs/vault/clinical/COMPLIANCE-ARGENTINA.md §"Datos genéticos"
 */
export default function GeneticsPage() {
  return (
    <main className="min-h-dvh">
      <div className="container max-w-2xl py-10 md:py-14">
        <FadeIn>
          <StepHeader
            step={11}
            title="Variantes genéticas"
            eyebrow="Paso 11 de 12 · Opcional"
            description="Si te hiciste un estudio genético (ej: 23andMe, AncestryDNA, panel médico) y conocés tu genotipo en alguna de estas variantes, ingresalo para enriquecer las recomendaciones."
          />
          <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
            Si no sabés o no te hiciste estudios, podés saltar este paso.
            La mayoría de las recomendaciones funcionan sin estos datos.
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <GeneticsForm />
        </FadeIn>
      </div>
    </main>
  );
}
