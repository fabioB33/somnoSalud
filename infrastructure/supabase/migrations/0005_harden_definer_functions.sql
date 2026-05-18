-- ============================================================================
-- Migration 0005 — Hardening SECURITY DEFINER functions + search_path
-- ============================================================================
-- Sprint 2.B (2026-05-18): post-aplicacion 0001-0004 los Supabase advisors
-- reportaron 3 WARN de seguridad:
--
-- 1. handle_profile_updated_at: search_path mutable (lint 0011)
--    -> agregamos SET search_path = '' en la function.
--
-- 2. handle_new_user: ejecutable por anon via /rest/v1/rpc/ (lint 0028)
-- 3. handle_new_user: ejecutable por authenticated via /rest/v1/rpc/ (lint 0029)
--    -> revocamos EXECUTE de public + anon + authenticated. La function
--    sigue invocandose desde el trigger on_auth_user_created (los triggers
--    usan los privilegios del owner, no del role que dispara el INSERT).
--
-- handle_profile_updated_at NO necesita revoke porque es un trigger function
-- sin SECURITY DEFINER (corre como SECURITY INVOKER por defecto y solo
-- toca NEW dentro del trigger context).
-- ============================================================================

-- ─── Fix 1: search_path en handle_profile_updated_at ───────────────────────
CREATE OR REPLACE FUNCTION public.handle_profile_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ─── Fix 2 + 3: revoke EXECUTE en handle_new_user ──────────────────────────
-- El default de Postgres es GRANT EXECUTE TO PUBLIC al crear functions.
-- Combinado con SECURITY DEFINER, Supabase la expone como RPC en
-- /rest/v1/rpc/handle_new_user. Cualquiera podria llamarla con un body
-- arbitrario y forzar INSERTs en public.profiles bypaseando el flow real
-- de signup (auth.users INSERT -> trigger -> handle_new_user).
--
-- Revocamos en cascada: PUBLIC + anon + authenticated. Postgres ejecuta
-- el trigger on_auth_user_created con los privilegios del owner de la
-- function (postgres role), no del role que dispara el INSERT en
-- auth.users, asi que el trigger sigue funcionando.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
