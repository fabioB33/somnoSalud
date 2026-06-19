import { redirect } from 'next/navigation';

import { DisclaimerBanner } from '@/components/compliance/DisclaimerBanner';
import { DiaryForm } from '@/components/diary/DiaryForm';
import { createClient } from '@/lib/supabase/server';

/**
 * Sprint 11 (2026-06-19) — Carga de diario nocturno.
 *
 * Pantalla para registrar 1 noche (form rápido). Post-save redirige a
 * /progreso para ver el insight actualizado.
 */
export default async function DiarioPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/diario');
  }

  return (
    <main className="min-h-dvh">
      <DisclaimerBanner />
      <div className="container max-w-2xl py-8 md:py-12">
        <DiaryForm />
      </div>
    </main>
  );
}
