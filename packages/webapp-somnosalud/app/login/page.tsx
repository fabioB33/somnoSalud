import Link from 'next/link';
import { Stethoscope } from 'lucide-react';

import { BrandLogo } from '@/components/brand/BrandLogo';
import { PublicFooter } from '@/components/layout/PublicFooter';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { LoginForm } from './LoginForm';

/**
 * Pantalla /login — entrada con magic link (Sprint 9.A + UX upgrade Sprint 9.B).
 *
 * Server Component que renderiza el form (Client Component) + texto
 * legal mínimo. Server Action `signInWithOtp` dispara el email vía
 * Supabase Auth (SMTP default Sprint 9.A — switch a Resend cuando este
 * disponible domain verification).
 */
export const metadata = {
  title: 'Iniciá sesión — SomnoSalud',
  description:
    'Accedé a SomnoSalud con un link mágico. No usamos contraseñas — te mandamos un link por email.',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="container mx-auto flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <Link
            href="/"
            className="flex items-center justify-center transition-opacity hover:opacity-80"
            aria-label="SomnoSalud — Volver al inicio"
          >
            <BrandLogo size="lg" />
          </Link>

          <Card>
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-xl">Iniciá sesión</CardTitle>
              <CardDescription>
                Ingresá tu email y te enviamos un link para entrar. Si es la
                primera vez, te creamos la cuenta automáticamente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <LoginForm />

              <div className="space-y-3 border-t border-border/40 pt-4">
                <p className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Stethoscope
                    className="mt-0.5 size-3.5 shrink-0 text-somno-accent"
                    aria-hidden="true"
                  />
                  <span>
                    Plataforma médica digital del{' '}
                    <strong className="text-foreground">
                      Dr. Pablo Ferrero
                    </strong>{' '}
                    (M.N. 119.783) — Instituto Ferrero de Neurología y Sueño
                    (IFN).
                  </span>
                </p>

                <p className="text-xs text-muted-foreground">
                  Al continuar aceptás nuestros{' '}
                  <Link href="/terms" className="underline">
                    Términos y Condiciones
                  </Link>{' '}
                  y{' '}
                  <Link href="/privacidad" className="underline">
                    Política de Privacidad
                  </Link>
                  .
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
