import { FadeIn } from '@/components/motion/FadeIn';
import { StepHeader } from '@/components/eval/StepHeader';

import { LabForm } from './LabForm';

/**
 * Pantalla /eval/lab — 7 parametros de laboratorio (OPCIONAL).
 *
 * Sprint UX polish 2026-06-11: StepHeader reusable + FadeIn.
 */
export default function LabPage() {
  return (
    <main className="min-h-dvh">
      <div className="container max-w-2xl py-10 md:py-14">
        <FadeIn>
          <StepHeader
            step={10}
            title="Análisis de laboratorio"
            eyebrow="Paso 10 de 12 · Opcional"
            description="Si tenés a mano resultados recientes (últimos 6 meses) de algunos parámetros, ingresalos para enriquecer las recomendaciones. Si no, podés saltar este paso sin afectar tu evaluación."
          />
        </FadeIn>

        <FadeIn delay={0.1}>
          <LabForm />
        </FadeIn>
      </div>
    </main>
  );
}
