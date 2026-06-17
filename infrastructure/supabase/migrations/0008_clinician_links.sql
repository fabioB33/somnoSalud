-- ============================================================================
-- Migration 0008 — Tabla clinician_links (Sprint 17 SomnoSalud Mobile)
-- ============================================================================
-- Origen: SomnoSalud Mobile Sprint 17 (backoffice multi-user real).
--
-- Decisión Fabio (2026-06-15): Cowork necesita que Dr. Pablo Ferrero (rol
-- clinician) vea las evaluations de SUS pacientes linkeados (no las del
-- dispositivo donde tiene la app instalada). El backoffice actual lee del
-- storage local — operativamente inútil.
--
-- Decisiones de schema:
--  - 1 row por (clinician, patient) — composite PK previene duplicados.
--  - Soft delete via `revoked_at`: si el clinician deja de tratar al paciente,
--    no se elimina la row, se marca revoked. Permite auditoría histórica.
--  - `accepted_at` opcional: el flujo "paciente acepta ser visto por el doctor"
--    podría agregarse en Sprint 18+ (hoy queda null para invitación-direct).
--  - Sin tabla intermedia de `clinics` o `organizations` — Sprint 18+ si IFN
--    decide multi-org. Hoy todo es Dr. Pablo Ferrero como único clinician.
-- ============================================================================

CREATE TABLE public.clinician_links (
  clinician_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  notes TEXT,
  PRIMARY KEY (clinician_user_id, patient_user_id)
);

CREATE INDEX idx_clinician_links_clinician_active
  ON public.clinician_links (clinician_user_id, created_at DESC)
  WHERE revoked_at IS NULL;

CREATE INDEX idx_clinician_links_patient_active
  ON public.clinician_links (patient_user_id, created_at DESC)
  WHERE revoked_at IS NULL;

-- ============================================================================
-- RLS — paciente NO puede modificar links, clinician sí.
-- Lectura: paciente ve sus links, clinician ve sus links.
-- ============================================================================

ALTER TABLE public.clinician_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clinician_links_select_own"
  ON public.clinician_links
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = clinician_user_id
    OR auth.uid() = patient_user_id
  );

-- Solo el clinician puede crear el link (invitación direct).
-- En Sprint 18+ podríamos requerir accepted_at del paciente antes de
-- considerar el link activo (gated en la lectura de evaluations via RLS).
CREATE POLICY "clinician_links_insert_clinician"
  ON public.clinician_links
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = clinician_user_id);

-- Update: clinician puede revocar (set revoked_at), paciente puede aceptar
-- (set accepted_at). Ambos casos via diferentes columns.
CREATE POLICY "clinician_links_update_own"
  ON public.clinician_links
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = clinician_user_id
    OR auth.uid() = patient_user_id
  )
  WITH CHECK (
    auth.uid() = clinician_user_id
    OR auth.uid() = patient_user_id
  );

-- Delete: hard delete solo via service_role (admin cleanup). Pacientes y
-- clinicians usan revoked_at en lugar de eliminar.

-- ============================================================================
-- Policy extra: clinicians pueden SELECT evaluations de pacientes linkeados.
-- Esto extiende la RLS de evaluations (0004_rls_policies.sql) para casos
-- multi-user.
-- ============================================================================

CREATE POLICY "evaluations_select_linked_clinician"
  ON public.evaluations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.clinician_links cl
      WHERE cl.clinician_user_id = auth.uid()
        AND cl.patient_user_id = evaluations.user_id
        AND cl.revoked_at IS NULL
    )
  );
