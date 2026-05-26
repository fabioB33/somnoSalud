import { NextRequest, NextResponse } from 'next/server';

import { updateSession } from '@/lib/supabase/middleware';

/**
 * middleware — Compliance gates (ADR-003) + refresh session Supabase + auth gate.
 *
 * Sprint 9.D (2026-05-26): /eval/* es ahora hard-gated (require login).
 *
 * Orden de operaciones:
 * 1. Refresh tokens Supabase + obtener userId (todas las rutas no-asset).
 * 2. Auth gate: rutas en AUTH_PROTECTED_PREFIXES requieren userId. Sin sesion
 *    redirige a /login?next=<pathname>.
 * 3. Compliance gate cookie somno_consent_v1 (solo /eval/*). Si falta,
 *    redirige a /terms?redirect=<pathname>. Para usuario logueado, el flow
 *    es: /login -> /disclaimer (firma consent) -> /eval/*.
 *
 * Excepciones del auth + compliance gate:
 * - /eval/menor-no-permitido: pantalla terminal cuando se rechaza por edad <18.
 *   No requiere auth ni consent (es accesible post-rechazo en /eval/profile).
 *
 * @see docs/vault/sprints/sprint-9-d-auth-gate-eval/SPRINT-9-D-AUTH-GATE-EVAL.md
 */
const AUTH_PROTECTED_PREFIXES = ['/mis-resultados', '/eval'];
const AUTH_PROTECTED_EXCEPTIONS = ['/eval/menor-no-permitido'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paso 1: refresh Supabase session (todas las rutas matchadas).
  const { response: refreshedResponse, userId } = await updateSession(request);

  // Paso 2: auth gate para rutas protegidas.
  const isAuthProtected =
    AUTH_PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix)) &&
    !AUTH_PROTECTED_EXCEPTIONS.includes(pathname);

  if (isAuthProtected && !userId) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    const redirectResponse = NextResponse.redirect(url);
    refreshedResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  }

  // Paso 3: compliance gate solo aplica a /eval/* (excepto menor-no-permitido).
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
