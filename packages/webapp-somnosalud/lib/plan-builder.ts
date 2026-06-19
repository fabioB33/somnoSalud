import type { BuildResultsOutput } from '@/lib/results-builder';

/**
 * Sprint 10 (2026-06-19) — Plan diario derivado del resultsSnapshot.
 *
 * Paridad con mobile `services/plan.ts`. En vez de re-evaluar el motor con
 * las respuestas crudas (mobile hace eso porque guarda Answers en local),
 * webapp lee el `results_snapshot` ya persistido en DB y deriva ítems del
 * plan a partir de `recommendations` + `phenotype` + `risk`.
 *
 * Tradeoff: menos granular que mobile (no podemos ramificar por `p2_sustancias`
 * directo), pero más correcto desde compliance (el plan refleja el output
 * del clinical-engine, no nuestra interpretación).
 *
 * v1: solo intervenciones SIN riesgo (higiene + TCC-I + educación + movimiento).
 * El motor ya excluye items bloqueados por safety rules.
 */

export type PlanCategory = 'higiene' | 'tcc_i' | 'educacion' | 'movimiento';

export interface PlanItem {
  id: string;
  label: string;
  category: PlanCategory;
  /** Si viene del motor (true) o es base universal (false). */
  fromEngine: boolean;
}

export interface DailyPlanWebapp {
  items: PlanItem[];
  hasApneaSign: boolean;
  hasMoodSign: boolean;
  phenotype: string | null;
}

const BASE_HYGIENE: PlanItem[] = [
  {
    id: 'luz_manana',
    label: 'Recibí luz natural a la mañana',
    category: 'higiene',
    fromEngine: false,
  },
  {
    id: 'horario',
    label: 'Acostarme en mi ventana de sueño',
    category: 'higiene',
    fromEngine: false,
  },
  {
    id: 'respiracion',
    label: 'Hacer mi rutina de respiración antes de dormir',
    category: 'tcc_i',
    fromEngine: false,
  },
];

/**
 * Deriva el plan diario desde el snapshot de resultados del motor clínico.
 * Si la evaluación no está completa, retorna solo la base universal.
 */
export function buildPlanFromResults(
  results: BuildResultsOutput | null,
): DailyPlanWebapp {
  if (!results || !results.complete) {
    return {
      items: BASE_HYGIENE,
      hasApneaSign: false,
      hasMoodSign: false,
      phenotype: null,
    };
  }

  const items: PlanItem[] = [...BASE_HYGIENE];
  const seenIds = new Set(BASE_HYGIENE.map((i) => i.id));

  // Mapear recommendations del motor a PlanItems.
  // El motor devuelve recommendations.daily / recommendations.weekly / etc.
  // Cada item tiene title + category. Mapeamos por category al canonical.
  const recs = results.recommendations;
  if (recs && typeof recs === 'object') {
    const dailyRecs = (recs as { daily?: Array<{ id?: string; title?: string; category?: string }> })
      .daily;
    if (Array.isArray(dailyRecs)) {
      for (const rec of dailyRecs) {
        const id = rec.id ?? slugifyLabel(rec.title ?? '');
        if (!id || seenIds.has(id)) continue;
        const label = rec.title ?? 'Recomendación';
        const category = mapCategoryFromEngine(rec.category);
        items.push({ id, label, category, fromEngine: true });
        seenIds.add(id);
      }
    }
  }

  const hasApneaSign = results.stopBang.risk === 'high' || results.stopBang.risk === 'intermediate';
  const hasMoodSign =
    results.phq9.severity === 'moderate' ||
    results.phq9.severity === 'moderately_severe' ||
    results.phq9.severity === 'severe' ||
    results.gad7.severity === 'moderate' ||
    results.gad7.severity === 'severe';

  // Fix typecheck 2026-06-19: usamos .phenotype (enum string) en vez de
  // .label porque el linkeado workspace en algunos contextos no resuelve la
  // prop `label` aunque el dist .d.ts la expone. Mejor más explícito y safe.
  const phenotypeStr = results.phenotype?.phenotype ?? null;

  return {
    items,
    hasApneaSign,
    hasMoodSign,
    phenotype: phenotypeStr,
  };
}

function slugifyLabel(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
}

function mapCategoryFromEngine(raw?: string): PlanCategory {
  const k = (raw ?? '').toLowerCase();
  if (k.includes('higiene') || k.includes('hygiene')) return 'higiene';
  if (k.includes('tcc') || k.includes('cbt') || k.includes('relajacion')) return 'tcc_i';
  if (k.includes('movimiento') || k.includes('exercise') || k.includes('actividad'))
    return 'movimiento';
  return 'educacion';
}
