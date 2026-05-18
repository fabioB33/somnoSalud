import Link from 'next/link';

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
 * Pantalla /login — entrada con magic link (Sprint 9.A).
 *
 * Server Component que renderiza el form (Client Component) + texto
 * legal mínimo. Server Action `signInWithOtp` dispara el email vía
 * Supabase Auth (SMTP default Sprint 9.A).
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
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Iniciá sesión</CardTitle>
            <CardDescription>
              Ingresá tu email y te enviamos un link para entrar. Si es la
              primera vez, te creamos la cuenta automáticamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <LoginForm />

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
          </CardContent>
        </Card>
      </main>
      <PublicFooter />
    </div>
  );
}
