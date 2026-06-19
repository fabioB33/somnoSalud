import { redirect } from 'next/navigation';

import { getMyWaitlistEntry } from '@/app/premium/actions';
import { PremiumLanding } from '@/components/premium/PremiumLanding';
import { createClient } from '@/lib/supabase/server';

/**
 * Sprint 13 (2026-06-19) — Pantalla Premium con waitlist.
 *
 * NO hay paywall real todavía. Captura emails de gente interesada en lo
 * que viene + listamos features futuras. Cuando se cierre pricing +
 * provider (Stripe/MercadoPago) + split comercial Pampa Labs/IFN, se
 * convierte en checkout real.
 */
export default async function PremiumPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/premium');
  }

  const entry = await getMyWaitlistEntry();

  return (
    <main className="min-h-dvh">
      <div className="container max-w-3xl py-8 md:py-12">
        <PremiumLanding entry={entry} userEmail={user.email ?? ''} />
      </div>
    </main>
  );
}
