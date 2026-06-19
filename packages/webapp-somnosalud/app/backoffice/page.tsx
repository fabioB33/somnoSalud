import {
  listLinkedPatients,
  requireClinicianOrRedirect,
} from '@/app/backoffice/actions';
import { BackofficeDashboard } from '@/components/backoffice/BackofficeDashboard';

/**
 * Sprint 12 (2026-06-19) — Backoffice clinician (página principal).
 *
 * Solo accesible si user.role === 'clinician' o 'admin'. RLS clinician_links
 * + evaluations garantiza data isolation.
 */
export default async function BackofficePage() {
  await requireClinicianOrRedirect();
  const patients = await listLinkedPatients();

  return (
    <main className="min-h-dvh">
      <div className="container max-w-5xl py-8 md:py-12">
        <BackofficeDashboard patients={patients} />
      </div>
    </main>
  );
}
