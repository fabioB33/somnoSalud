'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Flame, MoonStar, Plus, TrendingUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  buildProgressInsights,
  computeAverages,
  computeStreaks,
  type DiaryEntryWebapp,
} from '@/lib/progress-builder';

interface ProgressDashboardProps {
  entries: DiaryEntryWebapp[];
}

/**
 * Sprint 11 (2026-06-19) — Dashboard de progreso.
 *
 * Paridad con mobile `(tabs)/progreso.tsx`. Muestra:
 * - Streak chip (current + best + total good nights).
 * - 4 stats KPI (avg sleep / avg in bed / efficiency / quality).
 * - Lista de insights generados por buildProgressInsights.
 * - CTA cargar nueva entry.
 * - Estado vacío (0 entries) con copy onboarding.
 */
export function ProgressDashboard({ entries }: ProgressDashboardProps) {
  const streaks = useMemo(() => computeStreaks(entries), [entries]);
  const averages = useMemo(() => computeAverages(entries), [entries]);
  const insights = useMemo(() => buildProgressInsights(entries), [entries]);

  const isEmpty = entries.length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif">Tu progreso</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isEmpty
              ? 'Empezá a registrar tus noches para ver tu evolución.'
              : `${entries.length} ${entries.length === 1 ? 'noche registrada' : 'noches registradas'}.`}
          </p>
        </div>
        <Link href="/diario">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Registrar noche
          </Button>
        </Link>
      </div>

      {isEmpty ? (
        <Card className="p-8 text-center">
          <MoonStar className="h-12 w-12 mx-auto text-indigo-500 mb-4" />
          <h2 className="text-xl font-medium mb-2">Sin registros todavía</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Cargar tus noches lleva 30 segundos. Mientras más constante seas,
            mejor te podemos mostrar tu tendencia.
          </p>
          <Link href="/diario">
            <Button size="lg">Registrar mi primera noche</Button>
          </Link>
        </Card>
      ) : (
        <>
          {/* Streak chip */}
          <Card className="p-5 bg-orange-50 border-orange-200">
            <div className="flex items-center gap-4">
              <Flame className="h-10 w-10 text-orange-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-2xl font-bold text-orange-900">
                  {streaks.currentStreakDays}{' '}
                  <span className="text-base font-normal">
                    {streaks.currentStreakDays === 1
                      ? 'noche buena seguida'
                      : 'noches buenas seguidas'}
                  </span>
                </p>
                <p className="text-xs text-orange-700">
                  Mejor racha: {streaks.bestStreakDays} · Total buenas noches:{' '}
                  {streaks.totalGoodNights}
                </p>
              </div>
            </div>
          </Card>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KPICard label="Horas dormido" value={`${averages.avgSleepHours}h`} />
            <KPICard label="Horas en cama" value={`${averages.avgTimeInBedHours}h`} />
            <KPICard
              label="Eficiencia"
              value={`${averages.avgSleepEfficiency}%`}
              accent={averages.avgSleepEfficiency >= 85 ? 'good' : averages.avgSleepEfficiency < 75 ? 'attention' : undefined}
            />
            <KPICard label="Calidad (/10)" value={`${averages.avgSubjectiveQuality}`} />
          </div>

          {/* Insights */}
          <div className="space-y-3">
            <h2 className="text-lg font-medium flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              Lecturas de tu progreso
            </h2>
            {insights.map((ins) => (
              <Card
                key={ins.id}
                className={`p-4 ${
                  ins.tone === 'positive'
                    ? 'border-green-200 bg-green-50'
                    : ins.tone === 'attention'
                      ? 'border-amber-200 bg-amber-50'
                      : 'border-border'
                }`}
              >
                <p className="text-sm font-medium mb-1">{ins.title}</p>
                <p className="text-sm text-muted-foreground">{ins.body}</p>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function KPICard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: 'good' | 'attention';
}) {
  const accentClass =
    accent === 'good'
      ? 'text-green-700'
      : accent === 'attention'
        ? 'text-amber-700'
        : '';
  return (
    <Card className="p-4">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${accentClass}`}>{value}</p>
    </Card>
  );
}
