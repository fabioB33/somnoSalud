-- ============================================================================
-- Migration 0004 — RLS Policies (single-tenant: usuario ve solo sus datos)
-- ============================================================================
-- Sprint 2.B (2026-05-14): RLS estricto desde el dia 1.
--
-- Reglas:
-- - profiles: usuario autenticado ve/edita SOLO su propia row.
-- - evaluations: usuario autenticado ve/crea/actualiza SOLO sus propias rows.
--   DELETE deshabilitado (los datos clinicos no se borran desde la app;
--   compliance Ley 25.326 derecho de supresion = job admin separado).
-- - audit_log: usuario autenticado SOLO puede leer sus propias rows.
--   INSERT solo por service_role (server Actions con secret key).
--   Sin UPDATE/DELETE para nadie (append-only).
--
-- service_role (secret key, server-side) saltea TODAS las RLS policies por
-- diseno de Supabase. NO usar secret key desde el cliente.
-- ============================================================================

-- ─── profiles ──────────────────────────────────────────────────────────────

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- INSERT no exposed: el trigger handle_new_user() lo hace via SECURITY DEFINER.
-- DELETE no exposed: cascada ON DELETE de auth.users.

-- ─── evaluations ───────────────────────────────────────────────────────────

CREATE POLICY "Users can view own evaluations"
  ON public.evaluations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own evaluations"
  ON public.evaluations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own evaluations"
  ON public.evaluations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE no exposed: compliance Ley 25.326 + retention policy futura
-- (los datos clinicos solo se eliminan via job admin con service_role).

-- ─── audit_log ─────────────────────────────────────────────────────────────

CREATE POLICY "Users can view own audit entries"
  ON public.audit_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT solo por service_role (server-side). No exposed a authenticated.
-- UPDATE/DELETE no exposed (append-only).

-- ─── service_role context ─────────────────────────────────────────────────
-- service_role usa la Secret Key (sb_secret_*) y saltea TODAS las policies.
-- Lo usamos desde Server Actions / Route Handlers para:
-- - INSERT en audit_log
-- - Operaciones admin (cleanup jobs, exports compliance)
-- - Bypass de RLS solo cuando es necesario y justificado en sprint doc.
