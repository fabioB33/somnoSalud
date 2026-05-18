-- ============================================================================
-- Migration 0003 — Tabla audit_log (trazabilidad compliance Ley 25.326)
-- ============================================================================
-- Sprint 2.B (2026-05-14): registro append-only de acciones criticas para
-- compliance auditoria + debugging.
--
-- Decisiones:
-- - Append-only (sin updates ni deletes desde la app). Solo el service_role
--   puede limpiar registros viejos en jobs administrativos.
-- - user_id puede ser NULL para acciones del sistema (jobs, cleanup, etc).
-- - payload JSONB schema-less: cada action documenta su propio shape en
--   docs/vault/schema/audit-log-actions.md (a crear cuando el primer caller
--   de audit_log se implemente Sprint 9+).
-- - NO almacenamos IP/user-agent por defecto (mas privacidad). Si se
--   necesita para fraud detection Fase 3, agregamos columns con migration.
--
-- Actions tipicas (a documentar mas adelante):
-- - profile.consent_terms_accepted
-- - profile.consent_disclaimer_acknowledged
-- - profile.dob_verified
-- - evaluation.started
-- - evaluation.completed
-- - evaluation.results_emailed
-- - evaluation.reset
-- - auth.signed_in (magic link)
-- - auth.signed_out
-- ============================================================================

CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.audit_log IS
  'Append-only audit trail para compliance Ley 25.326 (proteccion datos personales)
   + debugging. Cada action documenta su payload shape en docs/vault.
   user_id NULL = accion del sistema (jobs, cleanup).';

-- Indices: queries comunes son por usuario + por accion + por rango temporal.
CREATE INDEX idx_audit_log_user_created ON public.audit_log(user_id, created_at DESC);
CREATE INDEX idx_audit_log_action_created ON public.audit_log(action, created_at DESC);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at DESC);

-- Habilita RLS (policies en migration 0004).
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
