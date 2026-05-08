import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * Pantalla /eval/safety — PLACEHOLDER Sprint 6.
 *
 * Se implementa completo en Sprint 7 con:
 * - Capa 4 de ADR-003: enforcement de safety rules SAFE-010..040 del
 *   clinical-engine (pregnancy + medication + anticoagulant + suicide
 *   ideation).
 * - Form: pregnancy status, current medications, anticoagulant flag,
 *   medical conditions, allergies, shift work.
 * - Si rule.action === 'block' -> derivar a especialista.
 * - Si rule.action === 'restrict' -> warning pero permitir continuar.
 *
 * Por ahora muestra placeholder con boton "Volver" para que el flow
 * de Sprint 6 (welcome -> disclaimer -> terms -> profile) tenga un
 * destino sin 404.
 */
export default function SafetyPage() {
  return (
    <main className="min-h-dvh">
      <div className="container max-w-2xl py-8 md:py-12">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Paso 2 de 12
        </p>
        <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
          Seguridad clínica
        </h1>

        <Alert variant="info" className="my-8">
          <AlertTitle>Próximamente — Sprint 7</AlertTitle>
          <AlertDescription>
            Esta pantalla se implementará en el próximo sprint. Va a evaluar
            condiciones especiales (embarazo, medicación actual,
            anticoagulantes) que pueden modificar las recomendaciones de
            sueño. Por ahora, tus datos personales del paso 1 ya están
            guardados localmente.
          </AlertDescription>
        </Alert>

        <Button variant="outline" size="lg" asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </main>
  );
}
