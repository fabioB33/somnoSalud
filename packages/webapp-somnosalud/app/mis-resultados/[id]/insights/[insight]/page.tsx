import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import { DisclaimerBanner } from '@/components/compliance/DisclaimerBanner';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import {
  buildAcompanamientoInsight,
  buildCuerpoInsight,
  buildDescansoInsight,
  buildRespiracionInsight,
  buildResumenInsight,
  type InsightDetail,
} from '@/lib/insights-builder';
import type { BuildResultsOutput } from '@/lib/results-builder';

/**
 * Sprint 14 (2026-06-19) — Sub-pantalla de insight P5.X individual.
 *
 * Renderiza el detalle completo de 1 dimensión (respiracion/descanso/
 * acompanamiento/cuerpo/resumen). Replica P5.1-P5.5 del mobile.
 */

const BUILDERS: Record<string, (r: BuildResultsOutput | null) => InsightDetail> = {
  respiracion: buildRespiracionInsight,
  descanso: buildDescansoInsight,
  acompanamiento: buildAcompanamientoInsight,
  cuerpo: buildCuerpoInsight,
  resumen: buildResumenInsight,
};

export default async function InsightDetailPage({
  params,
}: {
  params: { id: string; insight: string };
}) {
  const builder = BUILDERS[params.insight];
  if (!builder) notFound();

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/mis-resultados/${params.id}/insights/${params.insight}`);
  }

  const { data: evalRow } = await supabase
    .from('evaluations')
    .select('id, results_snapshot')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!evalRow) notFound();

  const insight = builder((evalRow.results_snapshot as BuildResultsOutput) ?? null);

  const toneClass =
    insight.tone === 'urgent'
      ? 'border-red-200 bg-red-50/50'
      : insight.tone === 'attention'
        ? 'border-amber-200 bg-amber-50/50'
        : insight.tone === 'positive'
          ? 'border-green-200 bg-green-50/50'
          : 'border-border';

  return (
    <main className="min-h-dvh">
      <DisclaimerBanner />
      <div className="container max-w-2xl py-8 md:py-12 space-y-6">
        <Link
          href={`/mis-resultados/${params.id}/insights`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Volver al resumen
        </Link>

        <div>
          <h1 className="text-3xl md:text-4xl font-serif">{insight.title}</h1>
          <p className="text-lg text-muted-foreground mt-2">{insight.summary}</p>
        </div>

        <Card className={`p-6 ${toneClass}`}>
          <p className="text-base leading-relaxed whitespace-pre-wrap">
            {insight.body}
          </p>
        </Card>

        {insight.derivationNote ? (
          <Card className="p-4 border-indigo-200 bg-indigo-50">
            <p className="text-sm">
              <strong className="text-indigo-900">Sugerencia: </strong>
              {insight.derivationNote}
            </p>
          </Card>
        ) : null}

        <Card className="p-4 bg-muted/30 text-xs text-muted-foreground">
          <p>
            Esta lectura es orientativa y NO reemplaza consulta médica. El
            director clínico es el Dr. Pablo Ferrero (M.N. 119.783).
          </p>
        </Card>
      </div>
    </main>
  );
}
