import Link from 'next/link';
import { Mail, Stethoscope } from 'lucide-react';

import { BrandLogo } from '@/components/brand/BrandLogo';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { FadeIn } from '@/components/motion/FadeIn';

import { LoginForm } from './LoginForm';

/**
 * Pantalla /login — entrada con magic link.
 *
 * Sprint UX polish 2026-06-11: rediseño con glass card elevada centrada,
 * BrandLogo con glow ambient, spotlight detrás, copy y compliance preservados.
 *
 * Server Component que renderiza el form (Client Component) + texto
 * legal mínimo. Server Action `signInWithOtp` dispara el email vía
 * Supabase Auth.
 */
export const metadata = {
  title: 'Iniciá sesión — SomnoSalud',
  description:
    'Accedé a SomnoSalud con un link mágico. No usamos contraseñas — te mandamos un link por email.',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* Spotlight ambient detrás de la card. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[640px]"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 30%, rgba(129, 140, 248, 0.18) 0%, transparent 65%)',
        }}
      />

      <main className="container mx-auto flex flex-1 items-center justify-center px-4 py-16 md:py-20">
        <div className="w-full max-w-md">
          <FadeIn>
            <div className="mb-8 flex flex-col items-center gap-4 text-center">
              <Link
                href="/"
                className="transition-transform hover:scale-[1.02]"
                aria-label="SomnoSalud — Volver al inicio"
              >
                <BrandLogo size="xl" withWordmark={false} glow />
              </Link>
              <div>
                <h1 className="font-display text-4xl font-normal tracking-tight">
                  Iniciá sesión
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sin contraseñas. Te mandamos un link mágico al email.
                </p>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="glass-card-elevated p-7">
              <div className="mb-5 flex items-center gap-2.5">
                <div className="badge-tint-info inline-flex size-9 items-center justify-center rounded-xl">
                  <Mail
                    className="size-4 text-somno-accent"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-tight">
                    Ingresá con tu email
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Si es la primera vez, te creamos la cuenta.
                  </p>
                </div>
              </div>

              <LoginForm />

              <div className="mt-6 space-y-3 border-t border-white/[0.08] pt-5">
                <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                  <Stethoscope
                    className="mt-0.5 size-3.5 shrink-0 text-somno-accent"
                    aria-hidden="true"
                  />
                  <span>
                    Plataforma médica digital del{' '}
                    <strong className="text-foreground/85">
                      Dr. Pablo Ferrero
                    </strong>{' '}
                    (M.N. 119.783) — Instituto Ferrero de Neurología y Sueño
                    (IFN).
                  </span>
                </p>

                <p className="text-xs leading-relaxed text-muted-foreground">
                  Al continuar aceptás nuestros{' '}
                  <Link
                    href="/terms"
                    className="text-somno-accent underline-offset-4 hover:underline"
                  >
                    Términos y Condiciones
                  </Link>{' '}
                  y{' '}
                  <Link
                    href="/privacidad"
                    className="text-somno-accent underline-offset-4 hover:underline"
                  >
                    Política de Privacidad
                  </Link>
                  .
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
