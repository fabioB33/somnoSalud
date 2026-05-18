import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * GET /auth/callback — intercambia el ?code= del magic link por una session.
 *
 * Flow:
 * 1. Usuario hace click en el link del email -> llega a esta route con ?code=...
 * 2. exchangeCodeForSession(code) valida el code + setea cookies de session.
 * 3. Redirige a ?next= (si vino) o a / por default.
 *
 * Si el code es invalido / expirado / ya usado -> redirige a /login con
 * ?error=invalid_code.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=invalid_code`);
  }

  // Solo permitimos `next` con rutas relativas internas — sin esto un actor
  // podria enviar ?next=https://evil.example para hacer phishing.
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/';
  return NextResponse.redirect(`${origin}${safeNext}`);
}
