import { redirect } from 'next/navigation';

import { DisclaimerBanner } from '@/components/compliance/DisclaimerBanner';
import { ProgressDashboard } from '@/components/progress/ProgressDashboard';
import { listMyDiaryEntries } from '@/app/diario/actions';
import { createClient } from '@/lib/supabase/server';

/**
 * Sprint 11 (2026-06-19) — Tab Progreso.
 *
 * Server Component: lee user + últimas 90 diary entries via RLS. Pasa a
 * componente Client que computa streaks + averages + insights.
 */
export default async function ProgresoPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/progreso');
  }

  const entries = await listMyDiaryEntries(90);

  return (
    <main className="min-h-dvh">
      <DisclaimerBanner />
      <div className="container max-w-4xl py-8 md:py-12">
        <ProgressDashboard entries={entries} />
      </div>
    </main>
  );
}
