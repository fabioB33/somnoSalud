'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/lib/supabase/server';
import type { DiaryEntryWebapp } from '@/lib/progress-builder';

/**
 * Sprint 11 (2026-06-19) — Server Actions del diario.
 *
 * Paridad con mobile `services/diary-sync.ts`. Webapp escribe directo a
 * `diary_entries` (tabla creada por migration 0006). RLS filtra por user.
 */

export type SaveDiaryResult =
  | { ok: true; entryId: string }
  | { ok: false; reason: 'no-session' | 'db-error'; error?: string };

export interface SaveDiaryInput {
  forDate: string; // YYYY-MM-DD
  sleepLatencyMinutes: number;
  nightAwakenings: number;
  totalSleepHours: number;
  timeInBedHours: number;
  earlyAwakening: 'never' | 'sometimes' | 'frequently' | 'always';
  subjectiveQuality: number;
}

export async function saveDiaryEntry(input: SaveDiaryInput): Promise<SaveDiaryResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, reason: 'no-session' };

  const payload = {
    user_id: user.id,
    recorded_at: new Date().toISOString(),
    for_date: input.forDate,
    sleep_latency_minutes: Math.round(input.sleepLatencyMinutes),
    night_awakenings: Math.round(input.nightAwakenings),
    total_sleep_hours: Math.round(input.totalSleepHours * 100) / 100,
    time_in_bed_hours: Math.round(input.timeInBedHours * 100) / 100,
    early_awakening: input.earlyAwakening,
    subjective_quality: Math.round(input.subjectiveQuality),
  };

  const { data, error } = await supabase
    .from('diary_entries')
    .insert(payload)
    .select('id')
    .single();

  if (error || !data) {
    return { ok: false, reason: 'db-error', error: error?.message };
  }

  revalidatePath('/progreso');
  revalidatePath('/hoy');
  return { ok: true, entryId: data.id };
}

export async function listMyDiaryEntries(limit = 90): Promise<DiaryEntryWebapp[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('diary_entries')
    .select('id, recorded_at, for_date, sleep_latency_minutes, night_awakenings, total_sleep_hours, time_in_bed_hours, early_awakening, subjective_quality')
    .eq('user_id', user.id)
    .order('recorded_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id as string,
    recordedAt: row.recorded_at as string,
    forDate: row.for_date as string,
    sleepLatencyMinutes: row.sleep_latency_minutes as number,
    nightAwakenings: row.night_awakenings as number,
    totalSleepHours: Number(row.total_sleep_hours),
    timeInBedHours: Number(row.time_in_bed_hours),
    earlyAwakening: row.early_awakening as DiaryEntryWebapp['earlyAwakening'],
    subjectiveQuality: row.subjective_quality as number,
  }));
}
