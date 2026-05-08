import Link from 'next/link';
import { ArrowRight, Moon, ShieldCheck, Stethoscope } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/**
 * HomePage — pantalla de bienvenida de SomnoSalud.
 *
 * Server Component (default). El boton "Empezar evaluacion" navega a
 * /disclaimer (Sprint 6 compliance gate flow): /disclaimer -> /terms ->
 * /eval/profile -> /eval/safety -> ... (resto de pasos en Sprints 7-8).
 *
 * @see docs/vault/architecture/adr/ADR-003-compliance-gates-en-codigo.md
 */
export default function HomePage() {
  return (
    <main className="min-h-dvh">
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon
              className="text-somno-accent"
              aria-hidden="true"
              size={22}
            />
            <span className="font-semibold tracking-tight">SomnoSalud</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Pre-launch · Fase 0
          </p>
        </div>
      </header>

      <section className="container py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Stethoscope size={14} aria-hidden="true" />
            Director médico: Dr. Pablo Ferrero · M.N. 119.783
          </p>
          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
            Evaluación integral de tu{' '}
            <span className="text-somno-accent">sueño</span>
          </h1>
          <p className="mt-6 text-balance text-lg text-muted-foreground">
            Una plataforma médica digital que evalúa, orienta y educa sobre
            trastornos del sueño con respaldo científico verificable. No
            reemplaza la consulta médica — la prepara.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/disclaimer">
                Empezar evaluación
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              Tarda ~10 minutos · 100% gratis · Disclaimer obligatorio
            </p>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-3xl gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck
                  className="text-somno-accent"
                  size={20}
                  aria-hidden="true"
                />
                Orientativo, no diagnóstico
              </CardTitle>
              <CardDescription>
                Esta herramienta es{' '}
                <strong>orientativa</strong> y NO reemplaza la consulta
                médica. Las recomendaciones deben ser validadas por un
                profesional antes de implementarlas.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon
                  className="text-somno-accent"
                  size={20}
                  aria-hidden="true"
                />
                Respaldo científico
              </CardTitle>
              <CardDescription>
                Cada algoritmo de scoring (ISI, ESS, STOP-BANG, PHQ-9,
                GAD-7, DASS-21) está respaldado por publicaciones
                peer-reviewed con DOI/PMID verificables.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <footer className="border-t border-border/40 py-6">
        <div className="container text-center text-xs text-muted-foreground">
          <p>
            <strong>SomnoSalud</strong> · Plataforma médica digital · Buenos
            Aires, Argentina
          </p>
          <p className="mt-1">
            Director médico responsable: Dr. Pablo Ferrero — M.N. 119.783 ·
            Instituto Ferrero de Neurología y Sueño (IFN)
          </p>
        </div>
      </footer>
    </main>
  );
}
