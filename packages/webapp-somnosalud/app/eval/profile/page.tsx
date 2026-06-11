import { StepHeader } from '@/components/eval/StepHeader';
import { FadeIn } from '@/components/motion/FadeIn';

import { ProfileForm } from './ProfileForm';

/**
 * Pantalla /eval/profile — primera pantalla del flow de evaluacion.
 *
 * Sprint UX polish 2026-06-11: StepHeader reusable con progress + jerarquía
 * display. Form preservado (Client Component).
 *
 * Compliance gate Capa 3 de ADR-003: verificacion edad <18 hard gate.
 * Llega aca solo via middleware (Capa 1) -> consent OK + via layout
 * (Capa 2) que renderiza DisclaimerBanner.
 *
 * @see docs/vault/concepts/CONVENCIONES-FRONTEND-WEBAPP.md §1 (RSC vs client)
 */
export default function ProfilePage() {
  return (
    <main className="min-h-dvh">
      <div className="container max-w-2xl py-10 md:py-14">
        <FadeIn>
          <StepHeader
            step={1}
            title="Datos personales"
            description="Necesitamos algunos datos básicos para personalizar tu evaluación. Estos datos se guardan localmente en tu navegador y se pierden si cerrás la pestaña."
          />
        </FadeIn>

        <FadeIn delay={0.1}>
          <ProfileForm />
        </FadeIn>
      </div>
    </main>
  );
}
