-- ============================================================================
-- Migration 0002 — Tabla evaluations (1 row por intento de evaluacion)
-- ============================================================================
-- Sprint 2.B (2026-05-14): JSON columns por cuestionario para simplicidad.
-- Sprint 9+ migra el state actual de sessionStorage a esta tabla.
--
-- Decisiones:
-- - 1 row por intento de evaluacion (cada vez que paciente arranca de cero =
--   nueva row). Esto permite analytics + historial multi-evaluacion del mismo
--   usuario.
-- - JSON columns para cuestionarios (isi, ess, etc.) en vez de tablas
--   normalizadas porque (a) cada cuestionario tiene shape distinto, (b) los
--   queries son siempre por evaluation completa, no por respuesta individual,
--   (c) menos schema migrations a futuro si cambian campos.
-- - results_snapshot JSON guarda el output del clinical-engine en el momento
--   de la evaluacion (frozen). Permite reproducir resultados aun si el engine
--   cambia despues.
-- - status enum permite evaluations en progreso (sessionStorage migra a
--   in_progress, completa pasa a completed con completed_at).
-- - idempotency_key opcional para futura prevencion de double-submit Sprint 9+.
-- ============================================================================

CREATE TYPE public.evaluation_status AS ENUM (
  'in_progress',  -- paciente esta llenando el flow
  'completed',    -- /eval/results renderizo con clinical-engine
  'abandoned'     -- paciente abandono sin completar (cleanup job futuro)
);

CREATE TABLE public.evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Lifecycle
  status public.evaluation_status NOT NULL DEFAULT 'in_progress',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,

  -- Idempotency (Sprint 9+: prevenir double-submit en results)
  idempotency_key TEXT,

  -- Compliance contexto (capturado al iniciar evaluacion)
  consent_terms_version_at_start TEXT,

  -- Input data del paciente (mismo shape que EvalState['*'] del webapp)
  profile JSONB,        -- { dateOfBirth, biologicalSex, weightKg, heightCm }
  safety JSONB,         -- { pregnancyStatus, currentMedications[], anticoagulantFlag, ... }
  isi JSONB,            -- number[] de 7 items 0-4
  ess JSONB,            -- number[] de 8 items 0-3
  stopbang JSONB,       -- { snoring, tired, observed, pressure, neckOver40cm }
  phq9 JSONB,           -- number[] de 9 items 0-3 (item 9 = ideacion suicida)
  gad7 JSONB,           -- number[] de 7 items 0-3
  dass21 JSONB,         -- number[] de 21 items 0-3
  sleep JSONB,          -- diario de sueno (Sprint 9 extendido: 13 campos)
  lab JSONB,            -- Record<string, number> opcional (7 parametros)
  genetics JSONB,       -- Record<string, string> opcional (5 variantes)

  -- Output snapshot del clinical-engine al momento de completar
  results_snapshot JSONB,

  -- Constraints
  CONSTRAINT evaluations_completed_at_only_if_completed
    CHECK (
      (status = 'completed' AND completed_at IS NOT NULL) OR
      (status != 'completed' AND completed_at IS NULL)
    ),
  CONSTRAINT evaluations_idempotency_unique_per_user
    UNIQUE (user_id, idempotency_key)
);

COMMENT ON TABLE public.evaluations IS
  '1 row por intento de evaluacion. JSON columns matchean shape de
   EvalState del webapp (hooks/usePersistEval.ts). Sprint 9+ migra
   sessionStorage a esta tabla con write-through al usuario autenticado.';

-- Indices para queries comunes
CREATE INDEX idx_evaluations_user_id ON public.evaluations(user_id);
CREATE INDEX idx_evaluations_user_status_created
  ON public.evaluations(user_id, status, created_at DESC);
CREATE INDEX idx_evaluations_completed_at
  ON public.evaluations(completed_at DESC) WHERE completed_at IS NOT NULL;

-- Trigger auto-update updated_at
CREATE TRIGGER evaluations_updated_at
  BEFORE UPDATE ON public.evaluations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_profile_updated_at();

-- Habilita RLS (policies en migration 0004).
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
