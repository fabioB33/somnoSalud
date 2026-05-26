/**
 * globalTeardown Playwright: cleanup de test users efimeros despues de cada
 * corrida E2E (Sprint 9.D).
 *
 * Cada test que llama `skipToEvalWithProfile` o `acceptConsent` crea un user
 * con email `e2e-<timestamp>-<rnd>@test.somnosalud.local` via Supabase admin
 * API. Sin cleanup, se acumulan en auth.users.
 *
 * Esta funcion lista todos los users que matchean el prefijo e2e- y los
 * borra. Best-effort: si falla, NO rompe la corrida (solo log).
 */
export default async function globalTeardown(): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !secretKey) {
    console.warn('[e2e teardown] sin SUPABASE creds, skipeando cleanup');
    return;
  }

  try {
    const listRes = await fetch(
      `${supabaseUrl}/auth/v1/admin/users?per_page=100`,
      {
        headers: {
          apikey: secretKey,
          Authorization: `Bearer ${secretKey}`,
        },
      },
    );
    if (!listRes.ok) {
      console.warn('[e2e teardown] list users fallo:', listRes.status);
      return;
    }
    const { users } = (await listRes.json()) as {
      users: Array<{ id: string; email?: string }>;
    };
    const e2e = users.filter((u) => u.email?.startsWith('e2e-'));
    if (e2e.length === 0) return;

    console.log(`[e2e teardown] borrando ${e2e.length} test users efimeros...`);
    await Promise.all(
      e2e.map((u) =>
        fetch(`${supabaseUrl}/auth/v1/admin/users/${u.id}`, {
          method: 'DELETE',
          headers: {
            apikey: secretKey,
            Authorization: `Bearer ${secretKey}`,
          },
        }).catch((err) =>
          console.warn(`[e2e teardown] DELETE ${u.id} fallo:`, err),
        ),
      ),
    );
  } catch (err) {
    console.warn('[e2e teardown] error general:', err);
  }
}
