'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/lib/supabase/server';

/**
 * Sprint 13 (2026-06-19) — Server Actions del waitlist Premium.
 *
 * Paridad con mobile services/premium-waitlist.ts. Upserts contra
 * `premium_waitlist` (migration 0007). RLS filtra por user_id.
 */

export interface WaitlistEntry {
  email: string;
  interestedAt: string;
  notifiedAt: string | null;
  source: string | null;
  notes: string | null;
}

export type WaitlistResult =
  | { ok: true; entry: WaitlistEntry }
  | { ok: false; reason: 'no-session' | 'db-error'; error?: string };

export async function joinWaitlist(opts?: {
  source?: string;
  notes?: string;
}): Promise<WaitlistResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return { ok: false, reason: 'no-session' };

  const payload = {
    user_id: user.id,
    email: user.email,
    interested_at: new Date().toISOString(),
    source: opts?.source ?? 'webapp',
    notes: opts?.notes ?? null,
  };

  const { data, error } = await supabase
    .from('premium_waitlist')
    .upsert(payload, { onConflict: 'user_id' })
    .select('email, interested_at, notified_at, source, notes')
    .single();

  if (error || !data) {
    return { ok: false, reason: 'db-error', error: error?.message };
  }

  revalidatePath('/premium');
  return {
    ok: true,
    entry: {
      email: data.email as string,
      interestedAt: data.interested_at as string,
      notifiedAt: (data.notified_at as string | null) ?? null,
      source: (data.source as string | null) ?? null,
      notes: (data.notes as string | null) ?? null,
    },
  };
}

export async function getMyWaitlistEntry(): Promise<WaitlistEntry | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from('premium_waitlist')
    .select('email, interested_at, notified_at, source, notes')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!data) return null;

  return {
    email: data.email as string,
    interestedAt: data.interested_at as string,
    notifiedAt: (data.notified_at as string | null) ?? null,
    source: (data.source as string | null) ?? null,
    notes: (data.notes as string | null) ?? null,
  };
}

export async function leaveWaitlist(): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: 'no-session' };

  const { error } = await supabase
    .from('premium_waitlist')
    .delete()
    .eq('user_id', user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath('/premium');
  return { ok: true };
}
