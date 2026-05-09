import { ProgressBar } from '@/components/eval/ProgressBar';

import { STOPBangForm } from './STOPBangForm';

/**
 * Pantalla /eval/stopbang — STOP-BANG (Chung et al. 2008).
 *
 * Screening de riesgo de apnea obstructiva del sueno. 8 preguntas:
 * - 5 manuales boolean (S, T, O, P, N): paciente responde Si/No.
 * - 3 auto-calculados desde profile (B, A, G): visible read-only.
 *
 * Cada Si suma 1 punto. Score 0-2 = bajo riesgo, 3-4 = intermedio,
 * 5-8 = alto riesgo.
 *
 * Reference: Chung F et al. STOP questionnaire: a tool to screen
 * patients for obstructive sleep apnea. Anesthesiology.
 * 2008;108(5):812-821.
 */
export default function STOPBangPage() {
  return (
    <main className="min-h-dvh">
      <div className="container max-w-3xl py-8 md:py-12">
        <ProgressBar current={5} total={12} />
        <h1 className="mb-3 mt-4 text-3xl font-bold tracking-tight md:text-4xl">
          STOP-BANG
        </h1>
        <p className="mb-2 text-base text-muted-foreground">
          Screening de riesgo de apnea obstructiva del sueño. 5 preguntas
          + 3 datos calculados desde tu perfil.
        </p>
        <p className="mb-8 text-xs text-muted-foreground">
          Instrumento validado: Chung F et al.{' '}
          <em>Anesthesiology. 2008;108(5):812-821.</em>
        </p>

        <STOPBangForm />
      </div>
    </main>
  );
}
