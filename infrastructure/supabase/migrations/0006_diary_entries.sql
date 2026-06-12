-- ============================================================================
-- Migration 0006 — Tabla diary_entries (Sprint 5 + 7 SomnoSalud Mobile)
-- ============================================================================
-- Origen: SomnoSalud Mobile App Sprint 5 introdujo diary entries longitudinales
-- en SQLite local. Sprint 7 (2026-06-12) agrega sync remoto contra Supabase IFN
-- para enable multi-device.
--
-- Decisiones:
--  - 1 row por noche registrada (no por dia natural, sino por entry creada
--    desde el diario de la app). Sprint 5 mobile usa 1 entry/dia tipicamente.
--  - Campos numericos = puntos medios de scale Likert (mismo mapping que el
--    buildPatientInput.ts del mobile). NO normalizamos en granularidad fina
--    porque el mobile solo captura ese nivel.
--  - JSON column NO usada: cada campo es escalar para facilitar queries +
--    indices futuros (ej. promedio sleep eff de los ultimos 30 dias por
--    user).
--  - RLS estricto: el paciente solo ve sus propias rows.
--  - sync_token: incrementa en cada actualizacion. Sprint 8+ puede usarlo
--    para resolution de conflicts si el usuario edita la misma entry desde
--    2 devices simultaneamente. Por ahora, last-write-wins.
-- ============================================================================

CREATE TABLE public.diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identificacion canonica de la entry (mismo shape que DiaryEntry en mobile)
  recorded_at TIMESTAMPTZ NOT NULL,
  for_date DATE NOT NULL,

  -- Datos clinicos (puntos medios de Likert del mobile)
  sleep_latency_minutes INT NOT NULL CHECK (sleep_latency_minutes >= 0),
  night_awakenings INT NOT NULL CHECK (night_awakenings >= 0),
  total_sleep_hours NUMERIC(4,2) NOT NULL CHECK (total_sleep_hours >= 0),
  time_in_bed_hours NUMERIC(4,2) NOT NULL CHECK (time_in_bed_hours >= 0),
  early_awakening TEXT NOT NULL CHECK (early_awakening IN ('never','sometimes','frequently','always')),
  subjective_quality INT NOT NULL CHECK (subjective_quality BETWEEN 1 AND 10),

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indice compuesto principal: queries por usuario + fecha (timeline).
CREATE INDEX idx_diary_entries_user_date
  ON public.diary_entries (user_id, for_date DESC, recorded_at DESC);

-- ============================================================================
-- RLS — paciente solo ve sus rows. Sin acceso anon.
-- ============================================================================

ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "diary_entries_select_own"
  ON public.diary_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "diary_entries_insert_own"
  ON public.diary_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "diary_entries_update_own"
  ON public.diary_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "diary_entries_delete_own"
  ON public.diary_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- Trigger: actualiza updated_at en cada UPDATE.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.diary_entries_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER diary_entries_updated_at_trigger
  BEFORE UPDATE ON public.diary_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.diary_entries_set_updated_at();

REVOKE EXECUTE ON FUNCTION public.diary_entries_set_updated_at() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.diary_entries_set_updated_at() TO authenticated;
