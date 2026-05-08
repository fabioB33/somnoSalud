import { ProfileForm } from './ProfileForm';

/**
 * Pantalla /eval/profile — primera pantalla del flow de evaluacion.
 *
 * Compliance gate Capa 3 de ADR-003: verificacion edad <18 hard gate.
 * Llega aca solo via middleware (Capa 1) -> consent OK + via layout
 * (Capa 2) que renderiza DisclaimerBanner.
 *
 * Server Component renderiza header + form (que es Client Component
 * porque tiene estado interactivo).
 *
 * @see docs/vault/concepts/CONVENCIONES-FRONTEND-WEBAPP.md §1 (RSC vs client)
 */
export default function ProfilePage() {
  return (
    <main className="min-h-dvh">
      <div className="container max-w-2xl py-8 md:py-12">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Paso 1 de 12
        </p>
        <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
          Datos personales
        </h1>
        <p className="mb-8 text-base text-muted-foreground">
          Necesitamos algunos datos básicos para personalizar tu evaluación.
          Estos datos se guardan localmente en tu navegador y se pierden si
          cerrás la pestaña.
        </p>

        <ProfileForm />
      </div>
    </main>
  );
}
