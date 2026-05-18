-- ============================================================================
-- Migration 0001 — Tabla profiles (extension de auth.users)
-- ============================================================================
-- Sprint 2.B (2026-05-14): single-tenant Fase 1. Multi-tenant agrega clinic_id
-- en Fase 3 con migration aparte (no breaking).
--
-- Decisiones:
-- - NO modificar auth.users directamente (gestionada por Supabase Auth).
--   Creamos public.profiles con 1:1 FK a auth.users(id).
-- - Compliance fields obligatorios para ANMAT + Ley 25.326/26.529:
--   * dob_verified_at: timestamp de cuando se confirmo edad >=18 (Capa 3)
--   * consent_terms_accepted_at: T&C aceptados (Capa 1)
--   * consent_disclaimer_acknowledged_at: disclaimer medico (Capa 2)
-- - Trigger auto-crea profile cuando un usuario se registra (insert en
--   auth.users -> insert en public.profiles).
-- ============================================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Compliance Ley 25.326/26.529 + ANMAT
  dob_verified_at TIMESTAMPTZ,
  consent_terms_accepted_at TIMESTAMPTZ,
  consent_terms_version TEXT,
  consent_disclaimer_acknowledged_at TIMESTAMPTZ,

  -- Preferencias UI/comunicacion
  preferred_language TEXT NOT NULL DEFAULT 'es' CHECK (preferred_language IN ('es', 'en', 'pt')),
  receive_email_notifications BOOLEAN NOT NULL DEFAULT TRUE,

  -- Metadata
  display_name TEXT
);

COMMENT ON TABLE public.profiles IS
  'Extension de auth.users con campos compliance (consent timestamps) + preferencias.
   Auto-creado por trigger handle_new_user() al hacer signup.';

-- Indice email para lookups futuros (raro pero util en admin queries).
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- Trigger auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_profile_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_profile_updated_at();

-- Trigger auto-crea profile al hacer signup en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Habilita RLS (policies en migration 0004).
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
