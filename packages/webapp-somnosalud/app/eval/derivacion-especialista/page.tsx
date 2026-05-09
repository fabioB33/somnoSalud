import { DerivacionContent } from './DerivacionContent';

/**
 * Pantalla /eval/derivacion-especialista — destino del block hard de
 * Capa 4 (ADR-003 Decision D1).
 *
 * Cuando evaluateAllSafetyRules detecta una rule con severity 'block'
 * triggered (ej: SAFE-040 melatonina + anticoagulantes), SafetyForm
 * persiste la evaluacion en sessionStorage y redirige aca.
 *
 * Server Component renderiza intro + Client Component que lee la
 * evaluacion del sessionStorage y muestra el detalle de la(s) rule(s)
 * disparadas.
 */
export default function DerivacionEspecialistaPage() {
  return (
    <main className="min-h-dvh">
      <div className="container max-w-2xl py-8 md:py-12">
        <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
          Te recomendamos consultar con un especialista
        </h1>
        <p className="mb-8 text-base text-muted-foreground">
          Detectamos condiciones especiales que requieren evaluación
          presencial con un profesional de la salud antes de continuar con
          la evaluación auto-administrada.
        </p>

        <DerivacionContent />
      </div>
    </main>
  );
}
