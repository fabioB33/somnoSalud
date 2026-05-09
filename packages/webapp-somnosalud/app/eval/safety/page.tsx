import { ProgressBar } from '@/components/eval/ProgressBar';

import { SafetyForm } from './SafetyForm';

/**
 * Pantalla /eval/safety — Capa 4 de compliance gates (ADR-003).
 *
 * Server Component renderiza header + ProgressBar. El form es Client
 * Component porque ejecuta evaluateAllSafetyRules con estado y redirige
 * segun severity.
 *
 * @see docs/vault/architecture/adr/ADR-003-compliance-gates-en-codigo.md (Capa 4)
 * @see packages/clinical-engine/src/safety/rules.ts
 */
export default function SafetyPage() {
  return (
    <main className="min-h-dvh">
      <div className="container max-w-2xl py-8 md:py-12">
        <ProgressBar current={2} total={12} />
        <h1 className="mb-3 mt-4 text-3xl font-bold tracking-tight md:text-4xl">
          Seguridad clínica
        </h1>
        <p className="mb-8 text-base text-muted-foreground">
          Algunas condiciones especiales (embarazo, medicación actual,
          anticoagulantes) modifican qué recomendaciones son seguras para vos.
          Esta sección revisa esas condiciones siguiendo nuestras reglas de
          seguridad SAFE-010 a SAFE-040.
        </p>

        <SafetyForm />
      </div>
    </main>
  );
}
