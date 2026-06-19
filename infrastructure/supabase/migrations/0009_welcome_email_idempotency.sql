-- ============================================================================
-- Migration 0009 — welcome_email_sent_at idempotency (Sprint 9.G)
-- ============================================================================
-- Origen: Sprint 9.G conecta el wrapper Resend (idle desde Sprint 14) al
-- flow real de auth callback. Necesitamos marcar que el welcome email ya se
-- mandó para no duplicarlo en logins subsiguientes (idempotencia).
--
-- Decisión Fabio 2026-06-19: paridad webapp ↔ mobile Tier 1.
--
-- Decisiones de schema:
--  - Campo `welcome_email_sent_at TIMESTAMPTZ` (nullable).
--    - NULL = nunca se mandó (mandar al próximo login).
--    - !NULL = ya se mandó, NO reintentar.
--  - Sin campo `welcome_email_failed_at` ni reintentos automáticos.
--    Si falla la primera vez, el próximo login lo reintenta (mejor que dejar
--    al user sin welcome). Sprint 10+ puede agregar retry logic si Sentry
--    muestra patrones de fallos recurrentes.
--  - Idempotencia se chequea server-side en `/auth/callback` antes de
--    invocar `sendWelcomeEmail`. Race condition: si 2 callbacks llegan al
--    mismo tiempo (improbable), puede mandarse 2 veces — escenario aceptable
--    (no rompe nada, solo log de Sentry).
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN welcome_email_sent_at TIMESTAMPTZ;

COMMENT ON COLUMN public.profiles.welcome_email_sent_at IS
  'Timestamp del welcome email enviado (idempotencia Sprint 9.G). NULL = nunca mandado.';
