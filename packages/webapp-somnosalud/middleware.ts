import { NextRequest, NextResponse } from 'next/server';

import { updateSession } from '@/lib/supabase/middleware';

/**
 * middleware — Capa 1 compliance gates (ADR-003) + refresh session Supabase (Sprint 9.A).
 *
 * Orden de operaciones:
 * 1. Refresh tokens Supabase (siempre, en todas las rutas no-asset). Esto
 *    cumple el contrato @supabase/ssr 0.5+ de no inyectar logica entre
 *    createServerClient() y getUser().
 * 2. Compliance gate cookie somno_consent_v1 (existente, solo /eval/*).
 *    Si redirige, conserva las cookies refrescadas en el response.
 *
 * Excepciones del gate compliance:
 * - /eval/menor-no-permitido: pantalla terminal cuando se rechaza por edad <18.
 * - Rutas fuera de /eval/*: el matcher de abajo las excluye del gate, pero
 *   igual reciben el refresh de Supabase para mantener la session vigente.
 *
 * Auth gating (rutas que requieren user logueado) NO se aplica aca todavia.
 * Sprint 9.B agrega protect de /mis-resultados cuando exista.
 *
 * @see docs/vault/architecture/adr/ADR-003-compliance-gates-en-codigo.md
 * @see docs/vault/sprints/sprint-9-a-supabase-auth/SPRINT-9-A-SUPABASE-AUTH.md
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paso 1: refresh Supabase session (todas las rutas matchadas).
  const { response: refreshedResponse } = await updateSession(request);

  // Paso 2: compliance gate solo aplica a /eval/* (excepto menor-no-permitido).
  if (!pathname.startsWith('/eval')) {
    return refreshedResponse;
  }
  if (pathname === '/eval/menor-no-permitido') {
    return refreshedResponse;
  }

  const consent = request.cookies.get('somno_consent_v1');
  if (!consent || consent.value !== 'accepted') {
    const url = request.nextUrl.clone();
    url.pathname = '/terms';
    url.searchParams.set('redirect', pathname);
    const redirectResponse = NextResponse.redirect(url);
    // Preservar las cookies refrescadas por Supabase en el redirect.
    refreshedResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  }

  return refreshedResponse;
}

export const config = {
  // Aplica a todas las rutas excepto assets estaticos + monitoring tunnel Sentry.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|monitoring|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
