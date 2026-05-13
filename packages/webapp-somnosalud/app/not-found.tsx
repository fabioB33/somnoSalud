import Link from 'next/link';
import { ArrowLeft, Moon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PublicFooter } from '@/components/layout/PublicFooter';

/**
 * Pantalla 404 custom — reemplaza el default ugly de Next.
 *
 * Convencion App Router: app/not-found.tsx se renderiza automaticamente
 * en rutas inexistentes.
 *
 * Server Component puro.
 */
export const metadata = {
  title: 'Página no encontrada — SomnoSalud',
};

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="container max-w-2xl flex-1 py-20 md:py-32">
        <div className="text-center">
          <div className="mb-6 inline-flex items-center justify-center rounded-full border border-border/60 bg-card/40 p-6">
            <Moon
              className="text-somno-accent"
              size={48}
              aria-hidden="true"
            />
          </div>

          <p className="mb-2 font-mono text-sm uppercase tracking-wider text-muted-foreground">
            Error 404
          </p>
          <h1 className="mb-4 text-balance text-3xl font-bold tracking-tight md:text-4xl">
            Esta página no existe
          </h1>
          <p className="mb-10 text-balance text-base text-muted-foreground">
            Tal vez el link era viejo o tipeaste algo raro. Volvé al inicio o
            empezá una evaluación desde cero.
          </p>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/">
                <ArrowLeft aria-hidden="true" />
                Volver al inicio
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/disclaimer">Empezar evaluación</Link>
            </Button>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
