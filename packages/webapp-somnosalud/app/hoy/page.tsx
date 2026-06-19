import { redirect } from 'next/navigation';

import { DisclaimerBanner } from '@/components/compliance/DisclaimerBanner';
import { TodayPlan } from '@/components/plan/TodayPlan';
import { createClient } from '@/lib/supabase/server';

/**
 * Sprint 10 (2026-06-19) — Tab "Hoy" / Plan del día.
 *
 * Paridad con mobile `(tabs)/hoy.tsx`. Muestra el plan personalizado del
 * paciente derivado del último resultado completado. Permite check/uncheck
 * para tracking opcional.
 *
 * Flow:
 * 1. Server Component: lee user (RLS) + última evaluation completed + snapshot.
 * 2. Si no hay user → redirect login.
 * 3. Si no hay evaluation completed → redirect /eval/profile (empezar).
 * 4. Si hay snapshot → renderiza TodayPlan con items derivados.
 *
 * Compliance:
 * - DisclaimerBanner obligatorio (Capa 2 ADR-003).
 * - Si hasApneaSign / hasMoodSign → Alert prominente derivación.
 */
export default async function HoyPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/hoy');
  }

  const { data: lastEval } = await supabase
    .from('evaluations')
    .select('id, completed_at, results_snapshot, profile')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!lastEval) {
    redirect('/eval/profile');
  }

  const profile = lastEval.profile as { firstName?: string } | null;
  const firstName = profile?.firstName ?? null;

  return (
    <main className="min-h-dvh">
      <DisclaimerBanner />
      <div className="container max-w-3xl py-8 md:py-12">
        <TodayPlan
          firstName={firstName}
          resultsSnapshot={lastEval.results_snapshot}
          completedAt={lastEval.completed_at as string | null}
        />
      </div>
    </main>
  );
}
