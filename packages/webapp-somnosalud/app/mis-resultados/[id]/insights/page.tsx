import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { DisclaimerBanner } from '@/components/compliance/DisclaimerBanner';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { buildAllInsights, type InsightDetail } from '@/lib/insights-builder';
import type { BuildResultsOutput } from '@/lib/results-builder';

/**
 * Sprint 14 (2026-06-19) — Hub de los 5 insights P5.1-P5.5.
 *
 * Replica el comportamiento mobile de la tab resultados/index.tsx — muestra
 * card por insight con summary + tone color. Click → sub-pantalla con body
 * completo + derivationNote.
 */
export default async function InsightsHubPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/mis-resultados/${params.id}/insights`);
  }

  const { data: evalRow } = await supabase
    .from('evaluations')
    .select('id, results_snapshot, completed_at')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!evalRow) notFound();

  const insights = buildAllInsights(
    (evalRow.results_snapshot as BuildResultsOutput) ?? null,
  );

  return (
    <main className="min-h-dvh">
      <DisclaimerBanner />
      <div className="container max-w-3xl py-8 md:py-12 space-y-6">
        <Link
          href="/mis-resultados"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Volver a mis resultados
        </Link>

        <div>
          <h1 className="text-3xl md:text-4xl font-serif">Tu lectura por dimensión</h1>
          {evalRow.completed_at ? (
            <p className="text-sm text-muted-foreground mt-1">
              Evaluación del{' '}
              {new Date(evalRow.completed_at).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          ) : null}
        </div>

        <div className="space-y-3">
          {insights.map((ins) => (
            <Link
              key={ins.id}
              href={`/mis-resultados/${params.id}/insights/${ins.id}`}
              className="block"
            >
              <InsightCardRow insight={ins} />
            </Link>
          ))}
        </div>

        <Card className="p-4 bg-muted/30 text-xs text-muted-foreground">
          <p>
            <strong>Nota:</strong> Estas lecturas son orientativas y NO
            reemplazan consulta médica. El director clínico es el Dr. Pablo
            Ferrero (M.N. 119.783).
          </p>
        </Card>
      </div>
    </main>
  );
}

function InsightCardRow({ insight }: { insight: InsightDetail }) {
  const toneClass =
    insight.tone === 'urgent'
      ? 'border-red-200 bg-red-50'
      : insight.tone === 'attention'
        ? 'border-amber-200 bg-amber-50'
        : insight.tone === 'positive'
          ? 'border-green-200 bg-green-50'
          : 'border-border';

  return (
    <Card className={`p-4 hover:shadow-md transition-all ${toneClass}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium">{insight.title}</p>
          <p className="text-sm text-muted-foreground mt-1">{insight.summary}</p>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
      </div>
    </Card>
  );
}
