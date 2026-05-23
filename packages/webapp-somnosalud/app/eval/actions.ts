'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/lib/supabase/server';
import type { EvalState } from '@/hooks/usePersistEval';
import type { BuildResultsOutput } from '@/lib/results-builder';

/**
 * Server Actions del flow /eval/* (Sprint 9.C-persist-eval).
 *
 * Estrategia: usuarios autenticados tienen write-through a `evaluations`.
 * Anonimos siguen usando sessionStorage (sin modificacion).
 *
 * Idempotencia: la columna evaluations.idempotency_key + el unique constraint
 * (user_id, idempotency_key) permiten que el cliente envie el mismo id en
 * cada update sin crear rows duplicadas. Hoy usamos status='in_progress'
 * como discriminador: solo puede haber 1 in_progress por user (logica del
 * upsert), y al completar se crea uno nuevo si arranca otra evaluacion.
 */

export interface EvalListItem {
  id: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  created_at: string;
  completed_at: string | null;
  results_snapshot: BuildResultsOutput | null;
}

export type UpsertResult =
  | { ok: true; evaluationId: string }
  | { ok: false; reason: 'no-session' | 'db-error'; error?: string };

export type MarkCompletedResult =
  | { ok: true }
  | { ok: false; reason: 'no-session' | 'not-found' | 'db-error'; error?: string };

/**
 * Crea o actualiza la evaluacion in_progress del usuario logueado con
 * el state actual. Si no hay sesion, retorna { ok: false, reason: 'no-session' }.
 *
 * Usa upsert sobre (user_id, status='in_progress'): solo hay una eval
 * activa por usuario; al completarse, la proxima vez que llamen esto
 * arranca una nueva.
 */
export async function upsertEvaluationFromState(
  state: EvalState,
): Promise<UpsertResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, reason: 'no-session' };
  }

  // Buscar la evaluacion in_progress existente del user.
  const { data: existing, error: selectError } = await supabase
    .from('evaluations')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'in_progress')
    .maybeSingle();

  if (selectError) {
    return { ok: false, reason: 'db-error', error: selectError.message };
  }

  const payload = {
    user_id: user.id,
    status: 'in_progress' as const,
    profile: state.profile ?? null,
    safety: state.safety ?? null,
    isi: state.isi ?? null,
    ess: state.ess ?? null,
    stopbang: state.stopBang ?? null,
    phq9: state.phq9 ?? null,
    gad7: state.gad7 ?? null,
    dass21: state.dass21 ?? null,
    sleep: state.sleep ?? null,
    lab: state.lab ?? null,
    genetics: state.genetics ?? null,
  };

  if (existing) {
    const { error: updateError } = await supabase
      .from('evaluations')
      .update(payload)
      .eq('id', existing.id);
    if (updateError) {
      return { ok: false, reason: 'db-error', error: updateError.message };
    }
    return { ok: true, evaluationId: existing.id };
  }

  const { data: inserted, error: insertError } = await supabase
    .from('evaluations')
    .insert(payload)
    .select('id')
    .single();

  if (insertError || !inserted) {
    return { ok: false, reason: 'db-error', error: insertError?.message };
  }

  return { ok: true, evaluationId: inserted.id };
}

/**
 * Marca la evaluacion como completed y persiste el snapshot de resultados
 * del clinical-engine. Idempotente: si ya esta completed, no hace nada.
 */
export async function markEvaluationCompleted(
  evaluationId: string,
  resultsSnapshot: BuildResultsOutput,
): Promise<MarkCompletedResult> {
  if (!resultsSnapshot.complete) {
    // Defensivo: nunca deberiamos llegar aca con results incompletos.
    return { ok: false, reason: 'db-error', error: 'results-not-complete' };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, reason: 'no-session' };
  }

  // Verificar que la evaluacion existe y pertenece al user (RLS lo confirma
  // pero el verify explicito da mejor error message).
  const { data: existing, error: selectError } = await supabase
    .from('evaluations')
    .select('id, status')
    .eq('id', evaluationId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (selectError || !existing) {
    return { ok: false, reason: 'not-found' };
  }

  // Si ya estaba completed, no hacemos nada (idempotente).
  if (existing.status === 'completed') {
    return { ok: true };
  }

  const { error: updateError } = await supabase
    .from('evaluations')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      results_snapshot: resultsSnapshot,
    })
    .eq('id', evaluationId);

  if (updateError) {
    return { ok: false, reason: 'db-error', error: updateError.message };
  }

  // Audit log de la accion (best-effort, no falla la action si falla esto).
  await supabase.from('audit_log').insert({
    user_id: user.id,
    action: 'evaluation.completed',
    payload: { evaluation_id: evaluationId },
  });

  revalidatePath('/mis-resultados');
  return { ok: true };
}

/**
 * Lista las evaluaciones del usuario logueado (RLS filtra automaticamente).
 * Retorna [] si no hay sesion (la pagina llamadora hace el redirect).
 */
export async function getMyEvaluations(): Promise<EvalListItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('evaluations')
    .select('id, status, created_at, completed_at, results_snapshot')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data as EvalListItem[];
}

/**
 * Llamada post-login: si el usuario tenia state en sessionStorage,
 * lo migra a la cuenta como evaluacion in_progress nueva.
 *
 * Cliente decide cuando llamarla (post auth/callback, antes de redirect a /).
 */
export async function migrateLocalStateToDb(
  state: EvalState,
): Promise<UpsertResult> {
  // Reusamos upsertEvaluationFromState — la logica es idempotente.
  return upsertEvaluationFromState(state);
}
