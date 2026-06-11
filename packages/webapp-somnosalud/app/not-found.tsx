import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { FadeIn } from '@/components/motion/FadeIn';

/**
 * Pantalla 404 custom — reemplaza el default ugly de Next.
 *
 * Sprint UX polish 2026-06-11: BrandLogo glow + Fraunces display + glass.
 *
 * Convencion App Router: app/not-found.tsx se renderiza automaticamente
 * en rutas inexistentes.
 */
export const metadata = {
  title: 'Página no encontrada — SomnoSalud',
};

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="container max-w-2xl flex-1 py-20 md:py-32">
        <FadeIn>
          <div className="text-center">
            <div className="mb-8 flex justify-center">
              <BrandLogo size="xl" withWordmark={false} glow />
            </div>

            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-somno-accent/20 bg-somno-tint-info px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-somno-accent-soft">
              Error 404
            </p>
            <h1 className="mb-5 text-balance font-display text-5xl font-normal leading-[1.05] tracking-tight md:text-6xl">
              Esta página no existe
            </h1>
            <p className="mb-10 text-balance text-base leading-relaxed text-muted-foreground">
              Tal vez el link era viejo o tipeaste algo raro. Volvé al inicio
              o empezá una evaluación desde cero.
            </p>

            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
              <Button
                size="lg"
                asChild
                className="group h-12 rounded-full px-6 text-base shadow-glow-accent transition-all hover:shadow-[0_0_44px_rgba(129,140,248,0.45)]"
              >
                <Link href="/">
                  <ArrowLeft
                    aria-hidden="true"
                    className="transition-transform group-hover:-translate-x-0.5"
                  />
                  Volver al inicio
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="h-12 rounded-full border-white/[0.10] bg-white/[0.02] px-6 text-base hover:bg-white/[0.06]"
              >
                <Link href="/disclaimer">Empezar evaluación</Link>
              </Button>
            </div>
          </div>
        </FadeIn>
      </main>

      <PublicFooter />
    </div>
  );
}
