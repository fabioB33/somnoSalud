'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  ArrowRight,
  Award,
  ClipboardList,
  Dna,
  Flag,
  Lightbulb,
  Phone,
  Printer,
  RotateCcw,
  Sparkles,
  Stethoscope,
  TestTube,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { CrisisHotlineCard } from '@/components/compliance/CrisisHotlineCard';
import { FadeIn } from '@/components/motion/FadeIn';
import { Stagger } from '@/components/motion/Stagger';
import { ScoreReveal } from '@/components/motion/ScoreReveal';
import { usePersistEval } from '@/hooks/usePersistEval';
import { clearAllStorage } from '@/lib/persist';
import { buildResults, type BuildResultsOutput } from '@/lib/results-builder';
import { markEvaluationCompleted } from '@/app/eval/actions';
import { cn } from '@/lib/utils';

/**
 * ResultsContent — Client Component que invoca buildResults sobre el
 * sessionStorage state, redirige si falta algun paso, y renderiza
 * todas las secciones del análisis.
 *
 * Sprint UX polish 2026-06-11: rediseño visual con storytelling emocional:
 *  - Hero del resultado: ISI score animado con Fraunces display + glow.
 *  - Confidence ring visual sutil del análisis.
 *  - Score cards con jerarquía clínica (severidad badge tint).
 *  - Recomendaciones con evidence badge prominente + iconography rica.
 *  - Banderas de riesgo con warm tint (no destructive — eso es para crisis).
 *  - Acciones con shadow glow accent.
 *
 * Lógica clínica + outputs del clinical-engine intactos. Texto canónico
 * compliance preservado. Logging Supabase y idempotency preservados.
 */
export function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, hydrated, persistedToDb, evaluationId } = usePersistEval();
  const debugMode = searchParams.get('debug') === '1';
  const [resetting, setResetting] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const markedCompletedRef = useRef(false);

  const results: BuildResultsOutput | null = useMemo(() => {
    if (!hydrated) return null;
    try {
      return buildResults(state);
    } catch (err) {
      console.error('[results] buildResults failed:', err);
      return null;
    }
  }, [hydrated, state]);

  useEffect(() => {
    if (!hydrated || !results) return;
    if (!results.complete) {
      router.replace(results.nextRoute);
    }
  }, [hydrated, results, router]);

  useEffect(() => {
    if (
      !persistedToDb ||
      !evaluationId ||
      !results ||
      !results.complete ||
      markedCompletedRef.current
    ) {
      return;
    }
    markedCompletedRef.current = true;
    void markEvaluationCompleted(evaluationId, results).then((res) => {
      if (!res.ok) {
        console.warn('[results] markEvaluationCompleted failed:', res);
      }
    });
  }, [persistedToDb, evaluationId, results]);

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

  const handleResetConfirmed = () => {
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
    <div className="space-y-7">
      {/* ─── Hero — score principal con storytelling visual ──────────── */}
      <FadeIn>
        <header className="glass-card-elevated relative overflow-hidden p-8 text-center md:p-10">
          {/* Spotlight detrás del score */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 print:hidden"
            style={{
              background:
                'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(129, 140, 248, 0.18) 0%, transparent 70%)',
            }}
          />

          <p className="badge-tint-info mx-auto mb-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wider">
            <Sparkles size={11} aria-hidden="true" />
            Tu evaluación
          </p>

          <h1 className="font-display text-4xl font-normal leading-[1.05] tracking-tight md:text-5xl">
            Tus resultados
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-balance text-base leading-relaxed text-muted-foreground">
            Análisis basado en tus respuestas. Las recomendaciones tienen
            nivel de evidencia A/B/C según publicaciones científicas.
          </p>

          {/* ISI hero score animado — el principal de la evaluación */}
          <div className="mt-8">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              ISI · Índice de Severidad del Insomnio
            </p>
            <ScoreReveal
              value={isi.totalScore}
              max={28}
              showMax
              variant="accent"
            />
            <p className="mt-3 text-lg font-medium text-foreground">
              {isi.severityLabel}
            </p>
          </div>

          {/* Confidence pill */}
          <div className="mt-7 inline-flex items-center gap-3 rounded-full border border-white/[0.08] bg-black/20 px-4 py-2 text-sm">
            <span className="text-muted-foreground">Confianza del análisis:</span>
            <strong className="text-somno-accent">
              {precision.confidencePercent}% — {precision.confidenceLabel}
            </strong>
          </div>
        </header>
      </FadeIn>

      {/* PHQ-9 item 9 >= 1: alerta máxima arriba. */}
      {item9Triggered && (
        <FadeIn delay={0.05}>
          <CrisisHotlineCard variant="reinforced" />
        </FadeIn>
      )}

      {/* Risk severe: derivación urgente prominente. */}
      {risk.requiresSpecialistReferral && (
        <FadeIn delay={0.1}>
          <Alert
            variant="destructive"
            className="rounded-2xl border-destructive/40 print:border-foreground"
          >
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            <AlertTitle className="text-base font-semibold">
              Recomendamos consultar con un especialista
            </AlertTitle>
            <AlertDescription>
              <p className="mb-3">
                <strong>Nivel de riesgo: {risk.overallRiskLabel}.</strong>{' '}
                Tu evaluación indica condiciones que requieren atención
                médica.
              </p>
              <ul className="space-y-1.5 text-sm">
                {risk.referralReasons.map((reason, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span
                      className="mt-1.5 size-1.5 shrink-0 rounded-full bg-destructive"
                      aria-hidden="true"
                    />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm">
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
        </FadeIn>
      )}

      {/* ─── Acordeón con secciones de detalle ───────────────────────── */}
      <FadeIn delay={0.15}>
        <Accordion
          type="multiple"
          defaultValue={['resumen', 'recomendaciones']}
          className="glass-card divide-y divide-white/[0.06] px-6"
        >
          {/* SECCIÓN 1 — Resumen scoring. */}
          <AccordionItem value="resumen" className="border-b-0">
            <AccordionTrigger className="text-base font-semibold">
              <span className="flex items-center gap-2.5">
                <span className="badge-tint-info inline-flex size-7 items-center justify-center rounded-lg">
                  <ClipboardList size={13} aria-hidden="true" />
                </span>
                Resumen de scoring
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-3 sm:grid-cols-2">
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
                  label="DASS-21 (Dep · Ans · Estr)"
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
          <AccordionItem value="recomendaciones" className="border-b-0">
            <AccordionTrigger className="text-base font-semibold">
              <span className="flex items-center gap-2.5">
                <span className="badge-tint-warm inline-flex size-7 items-center justify-center rounded-lg">
                  <Lightbulb size={13} aria-hidden="true" />
                </span>
                Recomendaciones personalizadas
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <p className="mb-5 rounded-xl border border-white/[0.06] bg-black/20 p-4 text-sm leading-relaxed text-muted-foreground">
                {recommendations.clinicalNote}
              </p>

              {recommendations.primary.length > 0 && (
                <RecGroup
                  title="Primarias (primera línea)"
                  tone="success"
                  recs={recommendations.primary}
                />
              )}
              {recommendations.adjunctive.length > 0 && (
                <RecGroup
                  title="Adjuntas (complementarias)"
                  tone="warm"
                  recs={recommendations.adjunctive}
                />
              )}
              {recommendations.optional.length > 0 && (
                <RecGroup
                  title="Opcionales"
                  tone="info"
                  recs={recommendations.optional}
                />
              )}

              {recommendations.blockedRecommendations.length > 0 && (
                <div className="mt-5 rounded-2xl border border-destructive/30 bg-destructive/[0.08] p-4">
                  <p className="text-sm font-semibold text-destructive">
                    Recomendaciones excluidas por safety rules
                  </p>
                  <ul className="mt-2 ml-5 list-disc space-y-1 text-sm text-foreground/85">
                    {recommendations.blockedRecommendations.map((id) => (
                      <li key={id}>
                        <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-xs">
                          {id}
                        </code>
                      </li>
                    ))}
                  </ul>
                  {blockedByCompliance.length > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Bloqueadas por safety rules:{' '}
                      {blockedByCompliance.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* SECCIÓN 3 — Lab opcional. */}
          {labPanel && labPanel.results.length > 0 && (
            <AccordionItem value="lab" className="border-b-0">
              <AccordionTrigger className="text-base font-semibold">
                <span className="flex items-center gap-2.5">
                  <span className="badge-tint-info inline-flex size-7 items-center justify-center rounded-lg">
                    <TestTube size={13} aria-hidden="true" />
                  </span>
                  Análisis de laboratorio
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  {labPanel.summary}
                </p>
                <div className="space-y-2.5">
                  {labPanel.results.map((r) => (
                    <div
                      key={r.parameterCode}
                      className="rounded-xl border border-white/[0.06] bg-black/20 p-4 text-sm print:break-inside-avoid"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <strong className="text-foreground">
                          {r.parameterName}
                        </strong>
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-xs font-medium',
                            r.status === 'optimal' || r.status === 'normal'
                              ? 'badge-tint-success'
                              : 'badge-tint-warm',
                          )}
                        >
                          {r.value} {r.unit} — {r.statusLabel}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
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
            <AccordionItem value="genetics" className="border-b-0">
              <AccordionTrigger className="text-base font-semibold">
                <span className="flex items-center gap-2.5">
                  <span className="badge-tint-warm inline-flex size-7 items-center justify-center rounded-lg">
                    <Dna size={13} aria-hidden="true" />
                  </span>
                  Variantes genéticas
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  {geneticProfile.summary}
                </p>
                <div className="space-y-2.5">
                  {geneticProfile.variants.map((v) => (
                    <div
                      key={`${v.gene}-${v.genotype}`}
                      className="rounded-xl border border-white/[0.06] bg-black/20 p-4 text-sm print:break-inside-avoid"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <strong className="text-foreground">
                          {v.gene}{' '}
                          <span className="font-mono text-xs text-muted-foreground">
                            ({v.genotype})
                          </span>
                        </strong>
                        <span className="badge-tint-info rounded-full px-2 py-0.5 text-xs font-medium">
                          {v.impactLabel}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-foreground/85">
                        {v.interpretation}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {v.clinicalImplication}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 rounded-xl border border-somno-warm/20 bg-somno-tint-warn p-3 text-xs text-foreground/85">
                  <strong className="text-somno-warm-soft">
                    Cronotipo:
                  </strong>{' '}
                  {geneticProfile.chronotypeInfluence}.{' '}
                  <strong className="text-somno-warm-soft">Cafeína:</strong>{' '}
                  {geneticProfile.caffeineAdvice}.
                </p>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* SECCIÓN 5 — Banderas de riesgo (si triggered). */}
          {risk.triggeredFlags.length > 0 && (
            <AccordionItem value="banderas" className="border-b-0">
              <AccordionTrigger className="text-base font-semibold">
                <span className="flex items-center gap-2.5">
                  <span className="badge-tint-warm inline-flex size-7 items-center justify-center rounded-lg">
                    <Flag size={13} aria-hidden="true" />
                  </span>
                  Banderas de riesgo activadas ({risk.triggeredFlags.length})
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2.5">
                  {risk.triggeredFlags.map((flag) => (
                    <li
                      key={flag.code}
                      className="rounded-xl border border-somno-warm/25 bg-somno-tint-warn p-4 text-sm"
                    >
                      <p>
                        <strong className="text-somno-warm-soft">
                          {flag.code} — {flag.name}
                        </strong>
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({flag.severity})
                        </span>
                      </p>
                      <p className="mt-2 text-xs text-foreground/85">
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
            <AccordionItem value="missing" className="border-b-0">
              <AccordionTrigger className="text-base font-semibold">
                <span className="flex items-center gap-2.5">
                  <span className="badge-tint-info inline-flex size-7 items-center justify-center rounded-lg">
                    <Award size={13} aria-hidden="true" />
                  </span>
                  Datos faltantes ({precision.missingData.length})
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="mb-3 text-sm text-muted-foreground">
                  Tu análisis tiene una confianza del{' '}
                  {precision.confidencePercent}%. Si querés que sea más
                  preciso, podés:
                </p>
                <ul className="space-y-2 text-sm">
                  {precision.improvementSuggestions.map((s, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span
                        className="mt-1.5 size-1.5 shrink-0 rounded-full bg-somno-accent"
                        aria-hidden="true"
                      />
                      <span className="text-foreground/85">{s}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </FadeIn>

      {/* PHQ-9 item 9 NO triggered: hotline default abajo (Decision E3). */}
      {!item9Triggered && (
        <FadeIn delay={0.2} whenInView>
          <CrisisHotlineCard variant="default" />
        </FadeIn>
      )}

      {/* Recurso IFN siempre visible. */}
      <FadeIn delay={0.25} whenInView>
        <section className="glass-card p-6 print:break-inside-avoid">
          <div className="flex items-start gap-4">
            <div className="badge-tint-info inline-flex size-11 shrink-0 items-center justify-center rounded-xl">
              <Stethoscope className="size-5 text-somno-accent" aria-hidden="true" />
            </div>
            <div className="text-sm leading-relaxed">
              <h3 className="mb-2 text-base font-semibold tracking-tight">
                Consulta médica
              </h3>
              <p className="text-foreground/85">
                Para validar estas recomendaciones con un profesional o
                coordinar una evaluación presencial:
              </p>
              <div className="mt-3 rounded-xl border border-white/[0.06] bg-black/20 p-4">
                <p className="font-semibold text-foreground">
                  Instituto Ferrero de Neurología y Sueño (IFN)
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Director: Dr. Pablo Ferrero — M.N. 119.783
                </p>
                <a
                  href="https://ifn.com.ar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm text-somno-accent underline-offset-4 hover:underline"
                >
                  ifn.com.ar
                  <ArrowRight size={14} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Acciones (no se imprimen). */}
      <FadeIn delay={0.3} whenInView>
        <div className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:items-center print:hidden">
          <Button
            size="lg"
            onClick={handlePrint}
            className="group h-12 rounded-full px-6 text-base shadow-glow-accent transition-all hover:shadow-[0_0_44px_rgba(129,140,248,0.45)]"
          >
            <Printer aria-hidden="true" />
            Imprimir / Exportar PDF
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setResetDialogOpen(true)}
            disabled={resetting}
            className="h-12 rounded-full border-white/[0.10] bg-white/[0.02] px-6 text-base hover:bg-white/[0.06]"
          >
            <RotateCcw aria-hidden="true" />
            Empezar de nuevo
          </Button>
        </div>
      </FadeIn>

      {/* Dialog de confirmación reset. */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Empezar una evaluación nueva?</DialogTitle>
            <DialogDescription>
              Esto va a borrar todas tus respuestas actuales. No se puede
              deshacer. Si querés guardar estos resultados, exportalos como
              PDF antes de continuar.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResetDialogOpen(false)}
              disabled={resetting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleResetConfirmed}
              disabled={resetting}
            >
              {resetting ? 'Borrando...' : 'Sí, empezar de nuevo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Panel debug (solo con ?debug=1). */}
      {debugMode && (
        <details className="rounded-2xl border border-dashed border-white/[0.15] bg-black/30 p-4 text-xs print:hidden">
          <summary className="cursor-pointer font-medium text-muted-foreground">
            Debug: JSON raw del clinical-engine output
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
    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4 text-sm print:break-inside-avoid">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1.5 font-display text-xl font-normal leading-none text-somno-accent">
        {value}
      </p>
      <p className="mt-2 text-foreground/85">{severity}</p>
      <p className="mt-2 text-[10px] text-muted-foreground">{reference}</p>
    </div>
  );
}

/** RecGroup — bloque de recomendaciones por categoria. */
function RecGroup({
  title,
  tone,
  recs,
}: {
  title: string;
  tone: 'success' | 'warm' | 'info';
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
  const toneClass =
    tone === 'success'
      ? 'badge-tint-success'
      : tone === 'warm'
      ? 'badge-tint-warm'
      : 'badge-tint-info';

  return (
    <div className="mb-5">
      <h3
        className={cn(
          'mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider',
          toneClass,
        )}
      >
        {title}
      </h3>
      <ul className="space-y-2.5">
        {recs.map((rec) => (
          <li
            key={rec.id}
            className="rounded-xl border border-white/[0.06] bg-black/20 p-4 text-sm print:break-inside-avoid"
          >
            <div className="flex items-baseline justify-between gap-2">
              <strong className="text-base text-foreground">
                {rec.nameEs}
              </strong>
              <span className="rounded-full border border-somno-accent/30 bg-somno-accent/[0.10] px-2 py-0.5 font-mono text-[10px] font-semibold text-somno-accent-soft">
                Evidencia {rec.evidenceLevel}
              </span>
            </div>
            <p className="mt-2 text-foreground/85">{rec.description}</p>
            {(rec.dosage || rec.timing || rec.duration) && (
              <p className="mt-2 text-xs text-muted-foreground">
                {rec.dosage && <>Dosis: {rec.dosage}. </>}
                {rec.timing && <>Cuando: {rec.timing}. </>}
                {rec.duration && <>Duración: {rec.duration}. </>}
              </p>
            )}
            {rec.contraindications.length > 0 && (
              <p className="mt-2 rounded-lg border border-somno-warm/25 bg-somno-tint-warn p-2 text-xs text-somno-warm-soft">
                Contraindicaciones: {rec.contraindications.join(', ')}
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
