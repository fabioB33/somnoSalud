import { NextRequest, NextResponse } from 'next/server';

import { updateSession } from '@/lib/supabase/middleware';

/**
 * middleware — Capa 1 compliance gates (ADR-003) + refresh session Supabase
 * (Sprint 9.A) + auth gate /mis-resultados (Sprint 9.C).
 *
 * Orden de operaciones:
 * 1. Refresh tokens Supabase + obtener user (siempre, rutas no-asset).
 * 2. Auth gate: /mis-resultados requiere user logueado, sino redirige a
 *    /login?next=...
 * 3. Compliance gate cookie somno_consent_v1 (solo /eval/*).
 *    Si redirige, conserva las cookies refrescadas en el response.
 *
 * Excepciones del compliance gate:
 * - /eval/menor-no-permitido: pantalla terminal cuando se rechaza por edad <18.
 */
const AUTH_PROTECTED_PREFIXES = ['/mis-resultados'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paso 1: refresh Supabase session (todas las rutas matchadas).
  const { response: refreshedResponse, userId } = await updateSession(request);

  // Paso 2: auth gate para rutas protegidas.
  if (AUTH_PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    if (!userId) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', pathname);
      const redirectResponse = NextResponse.redirect(url);
      refreshedResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value);
      });
      return redirectResponse;
    }
    return refreshedResponse;
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
