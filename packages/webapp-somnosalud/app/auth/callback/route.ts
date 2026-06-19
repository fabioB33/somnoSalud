import { NextRequest, NextResponse } from 'next/server';

import { sendWelcomeEmail } from '@/lib/email/send';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /auth/callback — intercambia el ?code= del magic link por una session.
 *
 * Flow:
 * 1. Usuario hace click en el link del email -> llega a esta route con ?code=...
 * 2. exchangeCodeForSession(code) valida el code + setea cookies de session.
 * 3. Sprint 9.G: si es la primera vez del user (welcome_email_sent_at NULL),
 *    dispara `sendWelcomeEmail` best-effort + marca el campo en profiles.
 * 4. Redirige a ?next= (si vino) o a / por default.
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

  // Sprint 9.G: welcome email post primer login (idempotente via DB).
  // Best-effort: si falla NO bloqueamos el redirect del user.
  await maybeFireWelcomeEmail(supabase, origin);

  // Solo permitimos `next` con rutas relativas internas — sin esto un actor
  // podria enviar ?next=https://evil.example para hacer phishing.
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/';
  return NextResponse.redirect(`${origin}${safeNext}`);
}

/**
 * Sprint 9.G — dispara welcome email best-effort.
 *
 * Idempotencia: chequea `welcome_email_sent_at` antes. Si NULL → mandar +
 * setear timestamp. Si !NULL → no-op silencioso.
 *
 * Si el wrapper Resend no está configurado (sin API key), `sendWelcomeEmail`
 * retorna `{ok:false, reason:'no-client'}` y NO marcamos el timestamp
 * (próximo login va a reintentar — esto es deseado durante el período de
 * setup de Resend).
 */
async function maybeFireWelcomeEmail(
  supabase: ReturnType<typeof createClient>,
  origin: string,
): Promise<void> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user?.email) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('welcome_email_sent_at, display_name')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile || profile.welcome_email_sent_at) return;

    const sendResult = await sendWelcomeEmail({
      to: user.email,
      patientFirstName: profile.display_name ?? undefined,
      loginUrl: `${origin}/login`,
    });

    if (sendResult.ok) {
      await supabase
        .from('profiles')
        .update({ welcome_email_sent_at: new Date().toISOString() })
        .eq('id', user.id);
    }
    // Si fall (no-client / no-from / send-failed): NO marcamos timestamp.
    // El próximo login va a reintentar. Sentry capta los send-failed.
  } catch {
    // Catch-all defensive: no rompemos el flow de auth si email infra falla.
    /* logged silently */
  }
}
