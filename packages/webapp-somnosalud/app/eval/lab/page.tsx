import { ProgressBar } from '@/components/eval/ProgressBar';

import { LabForm } from './LabForm';

/**
 * Pantalla /eval/lab — 7 parametros de laboratorio relevantes al
 * sueno. OPCIONAL — el paciente puede saltar.
 *
 * Parametros (LAB_PARAMETERS del clinical-engine):
 * - vitD (Vitamina D 25-OH-D)
 * - b12 (Vitamina B12)
 * - iron (Hierro)
 * - ferritin (Ferritina)
 * - magnesium (Magnesio)
 * - tsh (TSH)
 * - glucose (Glucosa)
 *
 * Cada uno con su unidad + rango optimal/normal del clinical-engine.
 */
export default function LabPage() {
  return (
    <main className="min-h-dvh">
      <div className="container max-w-2xl py-8 md:py-12">
        <ProgressBar current={10} total={12} />
        <h1 className="mb-3 mt-4 text-3xl font-bold tracking-tight md:text-4xl">
          Análisis de laboratorio{' '}
          <span className="text-base font-normal text-muted-foreground">
            (opcional)
          </span>
        </h1>
        <p className="mb-8 text-base text-muted-foreground">
          Si tenés a mano resultados recientes (últimos 6 meses) de algunos
          parámetros, ingresalos para enriquecer las recomendaciones. Si
          no, podés saltar este paso sin afectar tu evaluación.
        </p>

        <LabForm />
      </div>
    </main>
  );
}
