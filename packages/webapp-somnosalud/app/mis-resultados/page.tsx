import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, ClipboardList, Plus, Sparkles } from 'lucide-react';

import { PublicFooter } from '@/components/layout/PublicFooter';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/motion/FadeIn';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { createClient } from '@/lib/supabase/server';
import { getMyEvaluations } from '@/app/eval/actions';
import { cn } from '@/lib/utils';

/**
 * /mis-resultados — historial de evaluaciones del usuario logueado.
 *
 * Sprint UX polish 2026-06-11: glass cards + tipografía display + iconography
 * rica + stagger animation.
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
    className: 'badge-tint-warm',
  },
  completed: {
    label: 'Completada',
    className: 'badge-tint-success',
  },
  abandoned: {
    label: 'Abandonada',
    className: 'bg-white/[0.04] text-muted-foreground border border-white/[0.08]',
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
      <main className="container mx-auto max-w-3xl flex-1 px-4 py-12 md:py-16">
        <FadeIn>
          <header className="mb-10">
            <p className="badge-tint-info mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wider">
              <Sparkles size={11} aria-hidden="true" />
              Historial
            </p>
            <h1 className="font-display text-4xl font-normal leading-[1.05] tracking-tight md:text-5xl">
              Mis resultados
            </h1>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Historial de tus evaluaciones de sueño en SomnoSalud.
            </p>
          </header>
        </FadeIn>

        {evaluations.length === 0 ? (
          <FadeIn delay={0.1}>
            <div className="glass-card flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="badge-tint-info mb-5 inline-flex size-16 items-center justify-center rounded-2xl">
                <ClipboardList
                  className="size-8 text-somno-accent"
                  aria-hidden="true"
                />
              </div>
              <h2 className="mb-2 font-display text-2xl font-normal tracking-tight">
                Todavía no completaste ninguna evaluación
              </h2>
              <p className="mb-7 max-w-md text-sm leading-relaxed text-muted-foreground">
                Hacé la primera evaluación para que aparezca acá tu historial
                médico y puedas hacer seguimiento a lo largo del tiempo.
              </p>
              <Button
                asChild
                size="lg"
                className="group h-12 rounded-full px-6 text-base shadow-glow-accent transition-all hover:shadow-[0_0_44px_rgba(129,140,248,0.45)]"
              >
                <Link href="/disclaimer">
                  <Plus className="mr-1.5 size-4" aria-hidden="true" />
                  Empezar mi primera evaluación
                </Link>
              </Button>
            </div>
          </FadeIn>
        ) : (
          <Stagger delayChildren={0.08} className="space-y-4">
            {evaluations.map((evalItem) => {
              const status =
                STATUS_LABEL[evalItem.status] ??
                ({
                  label: 'Desconocido',
                  className:
                    'bg-white/[0.04] text-muted-foreground border border-white/[0.08]',
                } as const);
              const isComplete =
                evalItem.status === 'completed' &&
                evalItem.results_snapshot?.complete === true;

              return (
                <StaggerItem key={evalItem.id} className="glass-card p-6">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold tracking-tight">
                        {evalItem.completed_at
                          ? `Evaluación del ${formatDate(evalItem.completed_at)}`
                          : `Iniciada ${formatDate(evalItem.created_at)}`}
                      </h3>
                      <p className="font-mono text-xs text-muted-foreground">
                        ID: {evalItem.id.slice(0, 8)}…
                      </p>
                    </div>
                    <span
                      className={cn(
                        'inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                        status.className,
                      )}
                    >
                      {status.label}
                    </span>
                  </div>

                  {isComplete && evalItem.results_snapshot?.complete ? (
                    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <ScoreBox
                        label="ISI"
                        value={`${evalItem.results_snapshot.isi.totalScore}/28`}
                      />
                      <ScoreBox
                        label="ESS"
                        value={`${evalItem.results_snapshot.ess.totalScore}/24`}
                      />
                      <ScoreBox
                        label="STOP-BANG"
                        value={`${evalItem.results_snapshot.stopBang.totalScore}/8`}
                      />
                      <ScoreBox
                        label="PHQ-9"
                        value={`${evalItem.results_snapshot.phq9.totalScore}/27`}
                      />
                    </dl>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Continuar donde dejaste para ver el resumen completo de
                      tus resultados.
                    </p>
                  )}

                  {evalItem.status === 'in_progress' && (
                    <div className="mt-4">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="group rounded-full border-white/[0.10] bg-white/[0.02] hover:bg-white/[0.06]"
                      >
                        <Link href="/eval/profile">
                          Continuar evaluación
                          <ArrowRight
                            className="ml-1.5 size-3.5 transition-transform group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
                        </Link>
                      </Button>
                    </div>
                  )}
                </StaggerItem>
              );
            })}

            <FadeIn whenInView className="pt-4">
              <Button
                asChild
                size="lg"
                className="group h-12 rounded-full px-6 text-base shadow-glow-accent transition-all hover:shadow-[0_0_44px_rgba(129,140,248,0.45)]"
              >
                <Link href="/disclaimer">
                  <Plus className="mr-1.5 size-4" aria-hidden="true" />
                  Nueva evaluación
                </Link>
              </Button>
            </FadeIn>
          </Stagger>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}

function ScoreBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
      <dt className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 font-display text-lg font-normal text-somno-accent">
        {value}
      </dd>
    </div>
  );
}
