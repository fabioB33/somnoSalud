import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, ClipboardList, Plus } from 'lucide-react';

import { BrandLogo } from '@/components/brand/BrandLogo';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { getMyEvaluations } from '@/app/eval/actions';

/**
 * /mis-resultados — historial de evaluaciones del usuario logueado (Sprint 9.C).
 *
 * Server Component. Requiere sesion (redirige a /login?next=/mis-resultados
 * si no hay). RLS filtra automaticamente — solo ve sus propias rows.
 */
export const metadata = {
  title: 'Mis resultados — SomnoSalud',
  description: 'Historial de tus evaluaciones de sueño.',
  robots: 'noindex, nofollow',
};

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  in_progress: {
    label: 'En progreso',
    className: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  },
  completed: {
    label: 'Completada',
    className: 'bg-green-500/10 text-green-400 border-green-500/30',
  },
  abandoned: {
    label: 'Abandonada',
    className: 'bg-muted text-muted-foreground border-border/40',
  },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function MisResultadosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/mis-resultados');
  }

  const evaluations = await getMyEvaluations();

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="container mx-auto max-w-3xl flex-1 px-4 py-12">
        <Link
          href="/"
          className="mb-8 inline-flex transition-opacity hover:opacity-80"
          aria-label="SomnoSalud — Volver al inicio"
        >
          <BrandLogo size="md" />
        </Link>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Mis resultados</h1>
          <p className="mt-2 text-muted-foreground">
            Historial de tus evaluaciones de sueño en SomnoSalud.
          </p>
        </header>

        {evaluations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 inline-flex size-16 items-center justify-center rounded-full bg-card/40">
                <ClipboardList
                  className="size-8 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
              <h2 className="mb-2 text-xl font-semibold">
                Todavía no completaste ninguna evaluación
              </h2>
              <p className="mb-6 max-w-md text-sm text-muted-foreground">
                Hacé la primera evaluación para que aparezca acá tu historial
                médico y puedas hacer seguimiento a lo largo del tiempo.
              </p>
              <Button asChild size="lg">
                <Link href="/disclaimer">
                  <Plus className="mr-2 size-4" aria-hidden="true" />
                  Empezar mi primera evaluación
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {evaluations.map((evalItem) => {
              const status =
                STATUS_LABEL[evalItem.status] ??
                ({ label: 'Desconocido', className: 'bg-muted text-muted-foreground border-border/40' } as const);
              const isComplete =
                evalItem.status === 'completed' &&
                evalItem.results_snapshot?.complete === true;

              return (
                <Card key={evalItem.id}>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                    <div className="space-y-1">
                      <CardTitle className="text-base">
                        {evalItem.completed_at
                          ? `Evaluación del ${formatDate(evalItem.completed_at)}`
                          : `Iniciada ${formatDate(evalItem.created_at)}`}
                      </CardTitle>
                      <CardDescription>
                        ID: {evalItem.id.slice(0, 8)}…
                      </CardDescription>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </CardHeader>
                  <CardContent>
                    {isComplete && evalItem.results_snapshot?.complete ? (
                      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                        <div>
                          <dt className="text-xs text-muted-foreground">ISI</dt>
                          <dd className="font-medium">
                            {evalItem.results_snapshot.isi.totalScore}/28
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">ESS</dt>
                          <dd className="font-medium">
                            {evalItem.results_snapshot.ess.totalScore}/24
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">
                            STOP-BANG
                          </dt>
                          <dd className="font-medium">
                            {evalItem.results_snapshot.stopBang.totalScore}/8
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">
                            PHQ-9
                          </dt>
                          <dd className="font-medium">
                            {evalItem.results_snapshot.phq9.totalScore}/27
                          </dd>
                        </div>
                      </dl>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Continuar donde dejaste para ver el resumen completo de
                        tus resultados.
                      </p>
                    )}
                  </CardContent>
                  {evalItem.status === 'in_progress' && (
                    <CardContent className="pt-0">
                      <Button asChild variant="outline" size="sm">
                        <Link href="/eval/profile">
                          Continuar evaluación
                          <ArrowRight
                            className="ml-2 size-4"
                            aria-hidden="true"
                          />
                        </Link>
                      </Button>
                    </CardContent>
                  )}
                </Card>
              );
            })}

            <div className="pt-4">
              <Button asChild size="lg">
                <Link href="/disclaimer">
                  <Plus className="mr-2 size-4" aria-hidden="true" />
                  Nueva evaluación
                </Link>
              </Button>
            </div>
          </div>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}
