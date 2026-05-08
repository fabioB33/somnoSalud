import { ArrowRight, Moon, ShieldCheck, Stethoscope } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Demo de integracion con el clinical-engine: validamos que el workspace dep
// se importa, ejecuta y devuelve el resultado esperado segun Bastien 2001.
// Esta linea sera reemplazada en Sprint 7 por la UX real de los cuestionarios,
// pero es la prueba empirica de H2 (workspace dep funciona) en este sprint.
import { scoreISI } from 'somnosalud-clinical-engine';

export default function HomePage() {
  // Caso canonico: respuestas con score 8 -> "Insomnio subclinico (leve)".
  // Test equivalente al de tests/scoring.test.ts:38 del clinical-engine.
  const isiDemo = scoreISI([2, 1, 1, 1, 1, 1, 1]);

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
            <Button size="lg" disabled aria-label="Empezar evaluación (próximamente)">
              Empezar evaluación
              <ArrowRight aria-hidden="true" />
            </Button>
            <p className="text-xs text-muted-foreground">
              Habilitado en Sprint 6 (compliance gates).
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

        {/* Verificación empírica del workspace dep clinical-engine.
            Visible en pre-launch mientras validamos integraciones, se
            elimina en Sprint 6 cuando arranque el flow real. */}
        <Card className="mx-auto mt-16 max-w-3xl border-dashed">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Smoke test — clinical-engine (workspace dep)
            </CardTitle>
            <CardDescription className="font-mono text-xs">
              scoreISI([2,1,1,1,1,1,1]) →{' '}
              <span className="text-somno-accent">
                {isiDemo.totalScore}
              </span>{' '}
              · severity:{' '}
              <span className="text-somno-accent">{isiDemo.severity}</span>
              {' · '}
              <em>{isiDemo.severityLabel}</em>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Reference:{' '}
              <a
                href={`https://doi.org/${isiDemo.reference.match(/DOI:\s*(\S+)/)?.[1] ?? ''}`}
                className="underline-offset-4 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {isiDemo.reference}
              </a>
            </p>
          </CardContent>
        </Card>
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
