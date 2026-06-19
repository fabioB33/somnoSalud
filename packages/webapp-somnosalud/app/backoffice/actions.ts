'use server';

import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

/**
 * Sprint 12 (2026-06-19) — Server Actions del backoffice clinician.
 *
 * Solo accesibles a users con role='clinician' o 'admin'. La RLS de
 * clinician_links + evaluations garantiza data isolation.
 */

export interface LinkedPatient {
  patientUserId: string;
  patientEmail: string | null;
  patientDisplayName: string | null;
  linkedAt: string;
  acceptedAt: string | null;
  notes: string | null;
  evaluationsCount: number;
  lastEvaluationAt: string | null;
}

interface ProfileRow {
  id: string;
  email: string | null;
  display_name: string | null;
}

interface LinkRow {
  patient_user_id: string;
  created_at: string;
  accepted_at: string | null;
  notes: string | null;
}

interface EvalCountRow {
  user_id: string;
  count: number;
  last_at: string | null;
}

/**
 * Lista pacientes linkeados al clinician actual.
 *
 * Si el user no es clinician → retorna []. RLS de clinician_links solo
 * permite SELECT de filas propias.
 */
export async function listLinkedPatients(): Promise<LinkedPatient[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  // Step 1: verificar role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || (profile.role !== 'clinician' && profile.role !== 'admin')) {
    return [];
  }

  // Step 2: leer links activos
  const { data: linksData, error: linksErr } = await supabase
    .from('clinician_links')
    .select('patient_user_id, created_at, accepted_at, notes')
    .eq('clinician_user_id', user.id)
    .is('revoked_at', null)
    .order('created_at', { ascending: false });

  if (linksErr || !linksData || linksData.length === 0) return [];

  const links = linksData as LinkRow[];
  const patientIds = links.map((l) => l.patient_user_id);

  // Step 3: leer profiles de los pacientes (RLS extendida por 0008 permite esto via link)
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('id, email, display_name')
    .in('id', patientIds);

  const profilesById = new Map<string, ProfileRow>();
  for (const p of (profilesData ?? []) as ProfileRow[]) {
    profilesById.set(p.id, p);
  }

  // Step 4: contar evaluations por paciente
  const { data: evalsData } = await supabase
    .from('evaluations')
    .select('user_id, completed_at')
    .in('user_id', patientIds)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false });

  const evalStats = new Map<string, EvalCountRow>();
  for (const row of (evalsData ?? []) as Array<{ user_id: string; completed_at: string | null }>) {
    const existing = evalStats.get(row.user_id);
    if (existing) {
      existing.count += 1;
    } else {
      evalStats.set(row.user_id, {
        user_id: row.user_id,
        count: 1,
        last_at: row.completed_at,
      });
    }
  }

  return links.map((link) => {
    const p = profilesById.get(link.patient_user_id);
    const stats = evalStats.get(link.patient_user_id);
    return {
      patientUserId: link.patient_user_id,
      patientEmail: p?.email ?? null,
      patientDisplayName: p?.display_name ?? null,
      linkedAt: link.created_at,
      acceptedAt: link.accepted_at,
      notes: link.notes,
      evaluationsCount: stats?.count ?? 0,
      lastEvaluationAt: stats?.last_at ?? null,
    };
  });
}

/**
 * Carga el detalle de 1 paciente (info + evaluations).
 *
 * Sprint 12: incluye lista de evaluations con results_snapshot. RLS extendida
 * de evaluations (policy "evaluations_select_linked_clinician" en migration
 * 0008) deja que el clinician vea estos rows.
 */
export interface PatientDetail {
  profile: {
    id: string;
    email: string | null;
    displayName: string | null;
  };
  evaluations: Array<{
    id: string;
    status: string;
    completedAt: string | null;
    createdAt: string;
    resultsSnapshot: unknown;
  }>;
}

export async function loadPatientDetail(patientId: string): Promise<PatientDetail | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Verificar que existe link activo (RLS lo confirma pero verify explícito).
  const { data: linkData } = await supabase
    .from('clinician_links')
    .select('patient_user_id')
    .eq('clinician_user_id', user.id)
    .eq('patient_user_id', patientId)
    .is('revoked_at', null)
    .maybeSingle();

  if (!linkData) {
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, display_name')
    .eq('id', patientId)
    .maybeSingle();

  if (!profile) return null;

  const { data: evalsRaw } = await supabase
    .from('evaluations')
    .select('id, status, completed_at, created_at, results_snapshot')
    .eq('user_id', patientId)
    .order('created_at', { ascending: false })
    .limit(20);

  const evaluations = (evalsRaw ?? []).map((e) => ({
    id: e.id as string,
    status: e.status as string,
    completedAt: (e.completed_at as string | null) ?? null,
    createdAt: e.created_at as string,
    resultsSnapshot: e.results_snapshot,
  }));

  return {
    profile: {
      id: profile.id as string,
      email: (profile.email as string | null) ?? null,
      displayName: (profile.display_name as string | null) ?? null,
    },
    evaluations,
  };
}

/**
 * Vincular un paciente al clinician actual via email.
 *
 * Flow:
 * 1. Buscar profile con ese email.
 * 2. Si no existe → retornar error explícito (clinician puede pedirle a
 *    paciente que se registre primero).
 * 3. Si existe → INSERT en clinician_links (RLS valida que clinician sea el
 *    user actual + tenga role correcto).
 */
export type LinkResult =
  | { ok: true; patientId: string }
  | { ok: false; reason: 'no-session' | 'not-clinician' | 'patient-not-found' | 'already-linked' | 'db-error'; error?: string };

export async function linkPatientByEmail(email: string, notes?: string): Promise<LinkResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, reason: 'no-session' };

  // Validar role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || (profile.role !== 'clinician' && profile.role !== 'admin')) {
    return { ok: false, reason: 'not-clinician' };
  }

  // Buscar paciente por email
  const { data: target } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();

  if (!target) {
    return { ok: false, reason: 'patient-not-found' };
  }

  // Verificar link existente (puede estar revoked, en cuyo caso reactivamos).
  const { data: existing } = await supabase
    .from('clinician_links')
    .select('clinician_user_id, revoked_at')
    .eq('clinician_user_id', user.id)
    .eq('patient_user_id', target.id)
    .maybeSingle();

  if (existing && !existing.revoked_at) {
    return { ok: false, reason: 'already-linked' };
  }

  if (existing && existing.revoked_at) {
    // Reactivar: clear revoked_at
    const { error: updateErr } = await supabase
      .from('clinician_links')
      .update({ revoked_at: null, notes: notes ?? null })
      .eq('clinician_user_id', user.id)
      .eq('patient_user_id', target.id);
    if (updateErr) return { ok: false, reason: 'db-error', error: updateErr.message };
    return { ok: true, patientId: target.id as string };
  }

  const { error: insertErr } = await supabase
    .from('clinician_links')
    .insert({
      clinician_user_id: user.id,
      patient_user_id: target.id,
      notes: notes ?? null,
    });

  if (insertErr) return { ok: false, reason: 'db-error', error: insertErr.message };
  return { ok: true, patientId: target.id as string };
}

/**
 * Gate util: redirige si el user no es clinician.
 * Usar al principio de Server Components del backoffice.
 */
export async function requireClinicianOrRedirect(): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/backoffice');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || (profile.role !== 'clinician' && profile.role !== 'admin')) {
    redirect('/');
  }
}
