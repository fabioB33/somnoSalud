-- ============================================================================
-- Migration 0007 — Tabla premium_waitlist (Sprint 8 SomnoSalud Mobile)
-- ============================================================================
-- Origen: SomnoSalud Mobile App Sprint 8 (P8 monetizacion mockup).
--
-- Decision Fabio (2026-06-13): mockup tecnico de Premium sin paywall real
-- todavia. Captura emails para waitlist mientras se define pricing + provider
-- (Stripe vs MercadoPago) + split comercial Pampa Labs / IFN.
--
-- Decisiones de schema:
--  - 1 row por user_id (upsert si se vuelve a anotar). El waitlist NO es
--    histórico de intentos, es "este usuario quiere ser notificado".
--  - Campo `interested_at` registra cuando se sumo a la waitlist.
--  - Campo `notified_at` es null hasta que enviamos comm de "ya esta listo".
--  - `source` permite trackear desde donde se sumo (ej. "ajustes_button",
--    "marketplace_banner") para analytics futuro.
-- ============================================================================

CREATE TABLE public.premium_waitlist (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  interested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notified_at TIMESTAMPTZ,
  source TEXT,
  notes TEXT
);

CREATE INDEX idx_premium_waitlist_interested_at
  ON public.premium_waitlist (interested_at DESC);

-- ============================================================================
-- RLS — paciente solo ve/edita su row. Sin acceso anon.
-- ============================================================================

ALTER TABLE public.premium_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "premium_waitlist_select_own"
  ON public.premium_waitlist
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "premium_waitlist_insert_own"
  ON public.premium_waitlist
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "premium_waitlist_update_own"
  ON public.premium_waitlist
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "premium_waitlist_delete_own"
  ON public.premium_waitlist
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
