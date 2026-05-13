'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  ArrowRight,
  Phone,
  Printer,
  RotateCcw,
  Stethoscope,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { CrisisHotlineCard } from '@/components/compliance/CrisisHotlineCard';
import { usePersistEval } from '@/hooks/usePersistEval';
import { clearAllStorage } from '@/lib/persist';
import { buildResults, type BuildResultsOutput } from '@/lib/results-builder';

/**
 * ResultsContent — Client Component que invoca buildResults sobre el
 * sessionStorage state, redirige si falta algun paso, y renderiza
 * todas las secciones (resumen + recomendaciones + lab? + genetics?
 * + banderas) en Accordion colapsable.
 *
 * Tambien maneja:
 * - PHQ-9 item 9 >= 1 -> CrisisHotlineCard reinforced arriba.
 * - Risk severe -> Alert prominente con CTA derivacion.
 * - Boton Imprimir / Exportar PDF (window.print()).
 * - Boton Empezar de nuevo (clearAllStorage + redirect a /).
 * - ?debug=1 -> panel JSON raw para Pablo.
 */
export function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, hydrated } = usePersistEval();
  const debugMode = searchParams.get('debug') === '1';
  const [resetting, setResetting] = useState(false);

  // Build solo cuando hidrato. useMemo evita re-cómputo en re-render.
  const results: BuildResultsOutput | null = useMemo(() => {
    if (!hydrated) return null;
    try {
      return buildResults(state);
    } catch (err) {
      console.error('[results] buildResults failed:', err);
      return null;
    }
  }, [hydrated, state]);

  // Si flow incompleto, redirigir al primer paso faltante.
  useEffect(() => {
    if (!hydrated || !results) return;
    if (!results.complete) {
      router.replace(results.nextRoute);
    }
  }, [hydrated, results, router]);

  if (!hydrated || !results) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
        <span className="sr-only">Cargando resultados...</span>
      </div>
    );
  }

  if (!results.complete) {
    // El effect ya redirigió. Render placeholder mientras navega.
    return (
      <Alert variant="warning">
        <AlertTitle>Flow incompleto</AlertTitle>
        <AlertDescription>
          Faltan algunos pasos. Te llevamos al primero pendiente...
        </AlertDescription>
      </Alert>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    if (
      !window.confirm(
        '¿Estás seguro? Esto borra tus respuestas y empieza una evaluación nueva.',
      )
    ) {
      return;
    }
    setResetting(true);
    clearAllStorage();
    router.push('/');
  };

  const {
    bmi,
    isi,
    ess,
    stopBang,
    phq9,
    gad7,
    dass21,
    phenotype,
    risk,
    recommendations,
    precision,
    labPanel,
    geneticProfile,
    item9Triggered,
    blockedByCompliance,
  } = results;

  return (
    <div className="space-y-6">
      {/* Header con título + score precisión. */}
      <header className="space-y-3 text-center">
        <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
          Tus resultados
        </h1>
        <p className="text-base text-muted-foreground">
          Análisis basado en tus respuestas. Las recomendaciones tienen
          nivel de evidencia A/B/C según publicaciones científicas.
        </p>
        <div className="inline-flex items-center gap-3 rounded-full border border-border/60 bg-card/60 px-4 py-2 text-sm">
          <span className="text-muted-foreground">Confianza del análisis:</span>
          <strong className="text-somno-accent">
            {precision.confidencePercent}% — {precision.confidenceLabel}
          </strong>
        </div>
      </header>

      {/* PHQ-9 item 9 >= 1: alerta máxima arriba. */}
      {item9Triggered && <CrisisHotlineCard variant="reinforced" />}

      {/* Risk severe: derivación urgente prominente. */}
      {risk.requiresSpecialistReferral && (
        <Alert variant="destructive" className="print:border-foreground">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          <AlertTitle>Recomendamos consultar con un especialista</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              <strong>Nivel de riesgo: {risk.overallRiskLabel}.</strong> Tu
              evaluación indica condiciones que requieren atención médica.
            </p>
            <ul className="ml-5 list-disc space-y-1">
              {risk.referralReasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
            <p className="mt-3 text-sm">
              Contactá al{' '}
              <a
                href="https://ifn.com.ar"
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:underline"
              >
                Instituto Ferrero de Neurología y Sueño
              </a>{' '}
              para coordinar una consulta.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Acordeón con las secciones de resultados. */}
      <Accordion
        type="multiple"
        defaultValue={['resumen', 'recomendaciones']}
        className="rounded-lg border border-border/60 bg-card/40 px-5"
      >
        {/* SECCIÓN 1 — Resumen scoring. */}
        <AccordionItem value="resumen">
          <AccordionTrigger className="text-base">
            📊 Resumen de scoring
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <ScoreCard
                label="ISI (Insomnio)"
                value={`${isi.totalScore}/28`}
                severity={isi.severityLabel}
                reference={isi.reference}
              />
              <ScoreCard
                label="ESS (Somnolencia diurna)"
                value={`${ess.totalScore}/24`}
                severity={ess.severityLabel}
                reference={ess.reference}
              />
              <ScoreCard
                label="STOP-BANG (Riesgo apnea)"
                value={`${stopBang.totalScore}/8`}
                severity={stopBang.riskLabel}
                reference={stopBang.reference}
              />
              <ScoreCard
                label="PHQ-9 (Depresión)"
                value={`${phq9.totalScore}/27`}
                severity={phq9.severityLabel}
                reference={phq9.reference}
              />
              <ScoreCard
                label="GAD-7 (Ansiedad)"
                value={`${gad7.totalScore}/21`}
                severity={gad7.severityLabel}
                reference={gad7.reference}
              />
              <ScoreCard
                label="DASS-21 (Depresión / Ansiedad / Estrés)"
                value={`D ${dass21.depressionScore} · A ${dass21.anxietyScore} · S ${dass21.stressScore}`}
                severity={`${dass21.depressionLabel} · ${dass21.anxietyLabel} · ${dass21.stressLabel}`}
                reference={dass21.reference}
              />
              <ScoreCard
                label="BMI"
                value={`${bmi.bmi.toFixed(1)} kg/m²`}
                severity={bmi.categoryLabel}
                reference={bmi.reference}
              />
              <ScoreCard
                label="Fenotipo de insomnio"
                value={phenotype.phenotypeLabel}
                severity={`SE: ${phenotype.details.sleepEfficiencyPercent.toFixed(1)}%`}
                reference="Edinger et al. — ICSD-3"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* SECCIÓN 2 — Recomendaciones. */}
        <AccordionItem value="recomendaciones">
          <AccordionTrigger className="text-base">
            💡 Recomendaciones personalizadas
          </AccordionTrigger>
          <AccordionContent>
            <p className="mb-4 text-sm text-muted-foreground">
              {recommendations.clinicalNote}
            </p>

            {recommendations.primary.length > 0 && (
              <RecGroup title="🟢 Primarias (primer línea)" recs={recommendations.primary} />
            )}
            {recommendations.adjunctive.length > 0 && (
              <RecGroup title="🟡 Adjuntas (complementarias)" recs={recommendations.adjunctive} />
            )}
            {recommendations.optional.length > 0 && (
              <RecGroup title="🔵 Opcionales" recs={recommendations.optional} />
            )}

            {recommendations.blockedRecommendations.length > 0 && (
              <div className="mt-5 rounded-md border border-destructive/40 bg-destructive/10 p-4">
                <p className="text-sm font-medium text-destructive-foreground">
                  Recomendaciones excluidas por safety rules
                </p>
                <ul className="mt-2 ml-5 list-disc space-y-1 text-sm text-foreground/80">
                  {recommendations.blockedRecommendations.map((id) => (
                    <li key={id}>
                      <code className="font-mono text-xs">{id}</code>
                    </li>
                  ))}
                </ul>
                {blockedByCompliance.length > 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Bloqueadas por safety rules: {blockedByCompliance.join(', ')}
                  </p>
                )}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* SECCIÓN 3 — Lab opcional. */}
        {labPanel && labPanel.results.length > 0 && (
          <AccordionItem value="lab">
            <AccordionTrigger className="text-base">
              🧪 Análisis de laboratorio
            </AccordionTrigger>
            <AccordionContent>
              <p className="mb-4 text-sm text-muted-foreground">
                {labPanel.summary}
              </p>
              <div className="space-y-3">
                {labPanel.results.map((r) => (
                  <div
                    key={r.parameterCode}
                    className="rounded-md border border-border/40 bg-card/20 p-3 text-sm"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <strong>{r.parameterName}</strong>
                      <span
                        className={
                          r.status === 'optimal' || r.status === 'normal'
                            ? 'text-somno-accent'
                            : 'text-yellow-300'
                        }
                      >
                        {r.value} {r.unit} — {r.statusLabel}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {r.sleepImplication}
                    </p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* SECCIÓN 4 — Genetics opcional. */}
        {geneticProfile && geneticProfile.variants.length > 0 && (
          <AccordionItem value="genetics">
            <AccordionTrigger className="text-base">
              🧬 Variantes genéticas
            </AccordionTrigger>
            <AccordionContent>
              <p className="mb-4 text-sm text-muted-foreground">
                {geneticProfile.summary}
              </p>
              <div className="space-y-3">
                {geneticProfile.variants.map((v) => (
                  <div
                    key={`${v.gene}-${v.genotype}`}
                    className="rounded-md border border-border/40 bg-card/20 p-3 text-sm"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <strong>
                        {v.gene}{' '}
                        <span className="font-mono text-xs">({v.genotype})</span>
                      </strong>
                      <span className="text-somno-accent">{v.impactLabel}</span>
                    </div>
                    <p className="mt-1 text-xs text-foreground/80">
                      {v.interpretation}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {v.clinicalImplication}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Cronotipo: {geneticProfile.chronotypeInfluence}. Cafeína:{' '}
                {geneticProfile.caffeineAdvice}.
              </p>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* SECCIÓN 5 — Banderas de riesgo (si triggered). */}
        {risk.triggeredFlags.length > 0 && (
          <AccordionItem value="banderas">
            <AccordionTrigger className="text-base">
              🚩 Banderas de riesgo activadas ({risk.triggeredFlags.length})
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-3">
                {risk.triggeredFlags.map((flag) => (
                  <li
                    key={flag.code}
                    className="rounded-md border border-yellow-500/40 bg-yellow-500/5 p-3 text-sm"
                  >
                    <p>
                      <strong className="text-yellow-200">
                        {flag.code} — {flag.name}
                      </strong>
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({flag.severity})
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-foreground/80">
                      {flag.description}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Fuente: {flag.source} · Valor: {String(flag.value)} ·
                      Threshold: {flag.threshold}
                    </p>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* SECCIÓN 6 — Datos faltantes (si precision < 100%). */}
        {precision.missingData.length > 0 && (
          <AccordionItem value="missing">
            <AccordionTrigger className="text-base">
              📋 Datos faltantes ({precision.missingData.length})
            </AccordionTrigger>
            <AccordionContent>
              <p className="mb-3 text-sm text-muted-foreground">
                Tu análisis tiene una confianza del{' '}
                {precision.confidencePercent}%. Si querés que sea más preciso,
                podés:
              </p>
              <ul className="ml-5 list-disc space-y-1 text-sm">
                {precision.improvementSuggestions.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>

      {/* PHQ-9 item 9 NO triggered: hotline default abajo (Decision E3). */}
      {!item9Triggered && <CrisisHotlineCard variant="default" />}

      {/* Recurso IFN siempre visible. */}
      <section className="rounded-lg border border-border/60 bg-card/40 p-5 print:break-inside-avoid">
        <div className="flex items-start gap-3">
          <Stethoscope
            className="mt-0.5 shrink-0 text-somno-accent"
            size={20}
            aria-hidden="true"
          />
          <div className="text-sm leading-relaxed">
            <h3 className="mb-2 font-semibold">Consulta médica</h3>
            <p>
              Para validar estas recomendaciones con un profesional o
              coordinar una evaluación presencial:
            </p>
            <p className="mt-2">
              <strong>Instituto Ferrero de Neurología y Sueño (IFN)</strong>
              <br />
              Director: Dr. Pablo Ferrero — M.N. 119.783
              <br />
              <a
                href="https://ifn.com.ar"
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:underline"
              >
                ifn.com.ar
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Acciones (no se imprimen). */}
      <div className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:items-center print:hidden">
        <Button size="lg" onClick={handlePrint}>
          <Printer aria-hidden="true" />
          Imprimir / Exportar PDF
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={handleReset}
          disabled={resetting}
        >
          <RotateCcw aria-hidden="true" />
          Empezar de nuevo
        </Button>
      </div>

      {/* Panel debug (solo con ?debug=1). */}
      {debugMode && (
        <details className="rounded-lg border border-dashed border-border/60 bg-card/20 p-4 text-xs print:hidden">
          <summary className="cursor-pointer font-medium text-muted-foreground">
            🔧 Debug: JSON raw del clinical-engine output
          </summary>
          <pre className="mt-3 overflow-auto rounded bg-background/80 p-3 font-mono text-[11px]">
            {JSON.stringify(results, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

/** ScoreCard — card pequeño con un score + severidad + reference. */
function ScoreCard({
  label,
  value,
  severity,
  reference,
}: {
  label: string;
  value: string;
  severity: string;
  reference: string;
}) {
  return (
    <div className="rounded-md border border-border/40 bg-card/20 p-3 text-sm print:break-inside-avoid">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-mono text-lg font-semibold text-somno-accent">
        {value}
      </p>
      <p className="text-foreground/90">{severity}</p>
      <p className="mt-1 text-[10px] text-muted-foreground">{reference}</p>
    </div>
  );
}

/** RecGroup — bloque de recomendaciones por categoria. */
function RecGroup({
  title,
  recs,
}: {
  title: string;
  recs: Array<{
    id: string;
    nameEs: string;
    description: string;
    evidenceLevel: 'A' | 'B' | 'C';
    dosage?: string;
    timing?: string;
    duration?: string;
    contraindications: string[];
    reference: string;
  }>;
}) {
  return (
    <div className="mb-5">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <ul className="space-y-3">
        {recs.map((rec) => (
          <li
            key={rec.id}
            className="rounded-md border border-border/40 bg-card/20 p-4 text-sm print:break-inside-avoid"
          >
            <div className="flex items-baseline justify-between gap-2">
              <strong>{rec.nameEs}</strong>
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-mono text-primary">
                Evidencia {rec.evidenceLevel}
              </span>
            </div>
            <p className="mt-2 text-foreground/90">{rec.description}</p>
            {(rec.dosage || rec.timing || rec.duration) && (
              <p className="mt-2 text-xs text-muted-foreground">
                {rec.dosage && <>Dosis: {rec.dosage}. </>}
                {rec.timing && <>Cuando: {rec.timing}. </>}
                {rec.duration && <>Duración: {rec.duration}. </>}
              </p>
            )}
            {rec.contraindications.length > 0 && (
              <p className="mt-1 text-xs text-yellow-300">
                ⚠ Contraindicaciones: {rec.contraindications.join(', ')}
              </p>
            )}
            <p className="mt-2 text-[10px] text-muted-foreground">
              {rec.reference}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
