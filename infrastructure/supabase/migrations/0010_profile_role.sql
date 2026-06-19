-- ============================================================================
-- Migration 0010 — Profile role + tightened clinician_links RLS (Sprint 12)
-- ============================================================================
-- Origen: Sprint 12 webapp implementa backoffice multi-user. Necesitamos
-- distinguir entre paciente y clinician.
--
-- Decisión schema:
--  - `role TEXT NOT NULL DEFAULT 'patient' CHECK IN ('patient','clinician','admin')`.
--  - Default 'patient' — usuarios actuales son pacientes. Solo se promueve a
--    'clinician' manualmente via service_role (admin Pampa Labs).
--  - 'admin' reservado para usuarios Pampa Labs con acceso completo (futuro).
--
-- Sprint 12+ no expone UI para cambiar role — la elevation se hace via SQL
-- manual o tool admin futuro.
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN role TEXT NOT NULL DEFAULT 'patient'
  CHECK (role IN ('patient', 'clinician', 'admin'));

COMMENT ON COLUMN public.profiles.role IS
  'Rol del usuario (Sprint 12). patient=default, clinician=ve pacientes linkeados, admin=Pampa Labs.';

-- Index para queries del tipo "todos los clinicians del sistema".
CREATE INDEX idx_profiles_role_clinician
  ON public.profiles (role)
  WHERE role IN ('clinician', 'admin');

-- ============================================================================
-- RLS clinician_links REFORZADA: solo users con role='clinician' o 'admin'
-- pueden INSERT (crear links). Reemplaza la policy original que dejaba
-- crear a cualquier authenticated user.
-- ============================================================================

DROP POLICY IF EXISTS "clinician_links_insert_clinician" ON public.clinician_links;

CREATE POLICY "clinician_links_insert_only_clinicians"
  ON public.clinician_links
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = clinician_user_id
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('clinician', 'admin')
    )
  );
