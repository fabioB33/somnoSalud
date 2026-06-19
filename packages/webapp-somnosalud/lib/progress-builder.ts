/**
 * Sprint 11 (2026-06-19) — Progress builder webapp.
 *
 * Paridad con mobile `services/progress.ts`. Pure functions sobre array de
 * `DiaryEntryWebapp` (shape espejo del table `diary_entries` Supabase).
 *
 * Diseño (regla #1):
 *  - NO inventamos datos.
 *  - Streaks usan thresholds clínicos canónicos (Lichstein 2003).
 *  - Insights solo si hay ≥3 entries en ventana.
 */

export interface DiaryEntryWebapp {
  id?: string;
  recordedAt: string;
  forDate: string;
  sleepLatencyMinutes: number;
  nightAwakenings: number;
  totalSleepHours: number;
  timeInBedHours: number;
  earlyAwakening: 'never' | 'sometimes' | 'frequently' | 'always';
  subjectiveQuality: number;
}

const GOOD_NIGHT_SLEEP_EFF = 85;
const GOOD_NIGHT_QUALITY = 7;
const INSIGHT_MIN_ENTRIES = 3;

export function sleepEfficiency(entry: DiaryEntryWebapp): number {
  if (entry.timeInBedHours <= 0) return 0;
  return Math.round((entry.totalSleepHours / entry.timeInBedHours) * 100);
}

export function isGoodNight(entry: DiaryEntryWebapp): boolean {
  return (
    sleepEfficiency(entry) >= GOOD_NIGHT_SLEEP_EFF &&
    entry.subjectiveQuality >= GOOD_NIGHT_QUALITY
  );
}

export interface StreakResult {
  currentStreakDays: number;
  bestStreakDays: number;
  totalGoodNights: number;
}

export function computeStreaks(entries: DiaryEntryWebapp[]): StreakResult {
  if (entries.length === 0) {
    return { currentStreakDays: 0, bestStreakDays: 0, totalGoodNights: 0 };
  }

  const sorted = [...entries].sort((a, b) =>
    a.recordedAt.localeCompare(b.recordedAt),
  );

  let totalGoodNights = 0;
  let bestStreakDays = 0;
  let currentRun = 0;

  for (const entry of sorted) {
    if (isGoodNight(entry)) {
      totalGoodNights += 1;
      currentRun += 1;
      if (currentRun > bestStreakDays) bestStreakDays = currentRun;
    } else {
      currentRun = 0;
    }
  }

  return { currentStreakDays: currentRun, bestStreakDays, totalGoodNights };
}

export interface AverageStats {
  avgSleepHours: number;
  avgTimeInBedHours: number;
  avgSleepEfficiency: number;
  avgSubjectiveQuality: number;
  /** Cantidad de entries usadas en el cálculo. */
  count: number;
}

export function computeAverages(entries: DiaryEntryWebapp[]): AverageStats {
  if (entries.length === 0) {
    return {
      avgSleepHours: 0,
      avgTimeInBedHours: 0,
      avgSleepEfficiency: 0,
      avgSubjectiveQuality: 0,
      count: 0,
    };
  }

  const sleep = entries.reduce((s, e) => s + e.totalSleepHours, 0) / entries.length;
  const inBed = entries.reduce((s, e) => s + e.timeInBedHours, 0) / entries.length;
  const eff = entries.reduce((s, e) => s + sleepEfficiency(e), 0) / entries.length;
  const qual = entries.reduce((s, e) => s + e.subjectiveQuality, 0) / entries.length;

  return {
    avgSleepHours: Math.round(sleep * 10) / 10,
    avgTimeInBedHours: Math.round(inBed * 10) / 10,
    avgSleepEfficiency: Math.round(eff),
    avgSubjectiveQuality: Math.round(qual * 10) / 10,
    count: entries.length,
  };
}

export interface ProgressInsight {
  id: string;
  title: string;
  body: string;
  tone: 'positive' | 'neutral' | 'attention';
}

/**
 * Genera insights longitudinales sobre las últimas N entries.
 *
 * Solo si hay ≥3 entries. Si no, retorna 1 insight neutral pidiendo más data.
 */
export function buildProgressInsights(
  entries: DiaryEntryWebapp[],
): ProgressInsight[] {
  if (entries.length < INSIGHT_MIN_ENTRIES) {
    return [
      {
        id: 'need-more-data',
        title: 'Cargá unas noches más',
        body: `Con ${entries.length} ${entries.length === 1 ? 'entrada' : 'entradas'} todavía no puedo darte tendencias confiables. Vamos a tener insights cuando registres ${INSIGHT_MIN_ENTRIES} noches.`,
        tone: 'neutral',
      },
    ];
  }

  const avg = computeAverages(entries);
  const streaks = computeStreaks(entries);
  const insights: ProgressInsight[] = [];

  // Sleep efficiency insight
  if (avg.avgSleepEfficiency >= GOOD_NIGHT_SLEEP_EFF) {
    insights.push({
      id: 'eff-good',
      title: 'Tu eficiencia del sueño viene bien',
      body: `Promediás ${avg.avgSleepEfficiency}% de eficiencia (objetivo ≥85%). Es buena señal de continuidad del descanso.`,
      tone: 'positive',
    });
  } else if (avg.avgSleepEfficiency < 75) {
    insights.push({
      id: 'eff-low',
      title: 'Tu eficiencia del sueño tiene espacio para mejorar',
      body: `Promediás ${avg.avgSleepEfficiency}%. Estás pasando tiempo en la cama sin dormir. Probá reducir la ventana de sueño o mejorar el ritual previo.`,
      tone: 'attention',
    });
  }

  // Streak insight
  if (streaks.currentStreakDays >= 3) {
    insights.push({
      id: 'streak-active',
      title: `Llevás ${streaks.currentStreakDays} noches buenas seguidas`,
      body: 'Mantené el ritmo. Las rachas largas correlacionan con mejor consolidación del sueño.',
      tone: 'positive',
    });
  } else if (streaks.bestStreakDays >= 5 && streaks.currentStreakDays === 0) {
    insights.push({
      id: 'streak-broken',
      title: `Tu mejor racha fue de ${streaks.bestStreakDays} noches`,
      body: 'Volver a esa cadencia es posible. Identificá qué tenías en común esas noches.',
      tone: 'neutral',
    });
  }

  // Subjective quality insight
  if (avg.avgSubjectiveQuality < 5) {
    insights.push({
      id: 'quality-low',
      title: 'Tu percepción del descanso viene baja',
      body: `Promediás ${avg.avgSubjectiveQuality}/10. La calidad subjetiva importa tanto como las horas. Si persiste, conviene revisar con un profesional.`,
      tone: 'attention',
    });
  }

  // Fallback si no se generó ninguno
  if (insights.length === 0) {
    insights.push({
      id: 'stable',
      title: 'Tu descanso viene estable',
      body: `Con ${avg.count} noches registradas, no veo señales que requieran atención. Seguí registrando.`,
      tone: 'neutral',
    });
  }

  return insights;
}
