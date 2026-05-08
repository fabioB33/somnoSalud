import { NextRequest, NextResponse } from 'next/server';

/**
 * middleware — Capa 1 de compliance gates (ADR-003).
 *
 * Bloquea TODAS las rutas /eval/* si el paciente NO aceptó los T&C
 * (cookie somno_consent_v1 ausente o != 'accepted'). Redirige a /terms
 * preservando el destino original via search param ?redirect=.
 *
 * Excepción: /eval/menor-no-permitido NO requiere consent — es la
 * pantalla destino cuando se rechaza por edad <18, accesible aún si
 * el usuario nunca aceptó T&C (caso edge: mayor entró, dio fecha
 * incorrecta, redirige acá).
 *
 * Compliance Ley 26.529 art. 7 + Ley 25.326 art. 6: bloqueo
 * server-side antes de que cualquier pantalla de evaluación renderice.
 *
 * @see docs/vault/architecture/adr/ADR-003-compliance-gates-en-codigo.md
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Excepción: la pantalla "menor no permitido" NO requiere consent.
  if (pathname === '/eval/menor-no-permitido') {
    return NextResponse.next();
  }

  // Solo aplica a /eval/* (matcher abajo lo refuerza, esto es defensa en profundidad).
  if (!pathname.startsWith('/eval')) {
    return NextResponse.next();
  }

  const consent = request.cookies.get('somno_consent_v1');
  if (!consent || consent.value !== 'accepted') {
    const url = request.nextUrl.clone();
    url.pathname = '/terms';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Solo correr middleware en /eval/* — fuera de eso es no-op.
  matcher: ['/eval/:path*'],
};
