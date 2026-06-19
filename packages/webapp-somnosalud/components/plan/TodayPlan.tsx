'use client';

import { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Circle, MoonStar } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import {
  buildPlanFromResults,
  type DailyPlanWebapp,
  type PlanItem,
} from '@/lib/plan-builder';
import type { BuildResultsOutput } from '@/lib/results-builder';

interface TodayPlanProps {
  firstName: string | null;
  resultsSnapshot: unknown;
  completedAt: string | null;
}

/**
 * Sprint 10 (2026-06-19) — Componente Client del plan del día.
 *
 * Estado de los checks vive en `localStorage` (key `today-plan-checks-v1`)
 * para no requerir DB writes en cada toggle. Sprint 11 agrega persistencia
 * real en `diary_entries` cuando se incluya el tracking longitudinal.
 *
 * UX:
 * - Hero con fecha + saludo personal.
 * - Progress chip "X de N completadas".
 * - Lista de items con checkbox refinado (Circle / CheckCircle2 lucide).
 * - Alert prominente si hasApneaSign o hasMoodSign (compliance).
 * - Card "ver mis resultados" linkeando al detalle.
 */
export function TodayPlan({ firstName, resultsSnapshot, completedAt }: TodayPlanProps) {
  const plan = useMemo<DailyPlanWebapp>(
    () => buildPlanFromResults((resultsSnapshot as BuildResultsOutput) ?? null),
    [resultsSnapshot],
  );

  const todayKey = useMemo(() => {
    const d = new Date();
    return `today-plan-checks-v1-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }, []);

  const [checks, setChecks] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const raw = window.localStorage.getItem(todayKey);
      if (!raw) return {};
      return JSON.parse(raw) as Record<string, boolean>;
    } catch {
      return {};
    }
  });

  const toggle = (id: string) => {
    setChecks((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        window.localStorage.setItem(todayKey, JSON.stringify(next));
      } catch {
        /* noop */
      }
      return next;
    });
  };

  const completedCount = plan.items.filter((it) => checks[it.id]).length;
  const total = plan.items.length;

  const today = new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground uppercase tracking-wide">
          {today}
        </p>
        <h1 className="text-3xl md:text-4xl font-serif">
          {firstName ? `Hola, ${firstName}` : 'Tu plan de hoy'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {total} {total === 1 ? 'acción' : 'acciones'} para mejorar tu descanso.
          Tildá lo que cumpliste.
        </p>
      </div>

      {/* Progress chip */}
      <Card className="p-4 bg-amber-50 border-amber-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-amber-900">
            {completedCount === 0
              ? 'Empezá tildando lo primero'
              : completedCount === total
                ? '¡Completaste todo el plan de hoy!'
                : `${completedCount} de ${total} completadas`}
          </span>
          <span className="text-2xl">
            {completedCount === total && total > 0 ? '✨' : '🌙'}
          </span>
        </div>
      </Card>

      {/* Alerts */}
      {plan.hasApneaSign ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Signos compatibles con apnea</AlertTitle>
          <AlertDescription>
            Tu resultado de STOP-BANG sugiere derivación a un especialista del
            sueño para confirmación con polisomnografía. No reemplaza consulta
            médica.
          </AlertDescription>
        </Alert>
      ) : null}

      {plan.hasMoodSign ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acompañamiento emocional sugerido</AlertTitle>
          <AlertDescription>
            Tus puntajes de ánimo y/o ansiedad sugieren conversar con un
            profesional de salud mental. El descanso y el ánimo están
            relacionados.
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Plan items */}
      <div className="space-y-2">
        {plan.items.map((it) => (
          <PlanItemRow key={it.id} item={it} done={!!checks[it.id]} onToggle={() => toggle(it.id)} />
        ))}
      </div>

      {/* Card detalle */}
      <Card className="p-4 hover:bg-muted/50 transition-colors">
        <a href="/mis-resultados" className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <MoonStar className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="text-sm font-medium">Ver mis resultados completos</p>
              <p className="text-xs text-muted-foreground">
                Detalle por dimensión + plan extendido
              </p>
            </div>
          </div>
          <span className="text-muted-foreground">→</span>
        </a>
      </Card>

      {completedAt ? (
        <p className="text-xs text-muted-foreground text-center">
          Última evaluación: {new Date(completedAt).toLocaleDateString('es-AR')}
        </p>
      ) : null}
    </div>
  );
}

function PlanItemRow({
  item,
  done,
  onToggle,
}: {
  item: PlanItem;
  done: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full text-left flex items-center gap-3 p-3 rounded-lg border transition-colors ${
        done
          ? 'bg-green-50 border-green-200 text-green-900'
          : 'bg-white border-border hover:bg-muted/30'
      }`}
    >
      {done ? (
        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
      ) : (
        <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
      )}
      <span className={`text-sm ${done ? 'line-through opacity-70' : ''}`}>{item.label}</span>
    </button>
  );
}
