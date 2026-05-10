/**
 * results-builder.ts — funcion pura que toma EvalState (sessionStorage)
 * y construye el output completo de /eval/results.
 *
 * Decision arquitectural Sprint 8:
 * - Toda la logica de scoring + perfil + recomendaciones vive aca.
 * - ResultsContent.tsx solo renderiza, no calcula.
 * - Cuando se migre a Supabase Sprint 9+, esta funcion se invoca igual
 *   server-side desde Server Actions (es pura, sin React, sin browser
 *   APIs).
 *
 * Compliance crítico: respeta safety rules. blockedRecommendations
 * derivados de evaluateAllSafetyRules se pasan a generateRecommendations
 * para excluir items contraindicados (ej: melatonina en embarazo).
 *
 * @see packages/clinical-engine/src/* (todas las funciones invocadas)
 * @see docs/vault/architecture/adr/ADR-003-compliance-gates-en-codigo.md (Capa 5)
 */

import {
  scoreISI,
  scoreESS,
  scoreSTOPBANG,
  scorePHQ9,
  scoreGAD7,
  scoreDASS21,
  calculateBMI,
  classifyInsomniaPhenotype,
  generateRecommendations,
  assessRisk,
  calculatePrecision,
  analyzeLabPanel,
  analyzeGeneticProfile,
  evaluateAllSafetyRules,
  type ISIResult,
  type ESSResult,
  type STOPBANGResult,
  type PHQ9Result,
  type GAD7Result,
  type DASS21Result,
  type BMIResult,
  type PhenotypeResult,
  type RiskAssessment,
  type RecommendationSet,
  type PrecisionResult,
  type LabPanel,
  type GeneticProfile,
  type SleepData,
  type ISIResponses,
  type ESSResponses,
  type PHQ9Responses,
  type GAD7Responses,
  type DASS21Responses,
} from 'somnosalud-clinical-engine';

import type { EvalState } from '@/hooks/usePersistEval';

/**
 * Pasos obligatorios del flow. Si falta alguno, /eval/results NO
 * puede renderizar y debe redirigir al primer paso incompleto.
 *
 * NO incluye lab + genetics (opcionales).
 */
type RequiredStep =
  | 'profile'
  | 'safety'
  | 'isi'
  | 'ess'
  | 'stopBang'
  | 'phq9'
  | 'gad7'
  | 'dass21'
  | 'sleep';

const STEP_TO_ROUTE: Record<RequiredStep, string> = {
  profile: '/eval/profile',
  safety: '/eval/safety',
  isi: '/eval/isi',
  ess: '/eval/ess',
  stopBang: '/eval/stopbang',
  phq9: '/eval/phq9',
  gad7: '/eval/gad7',
  dass21: '/eval/dass21',
  sleep: '/eval/sleep',
};

/**
 * Resultado del builder. Si `complete: false`, el caller redirige
 * a `nextRoute`. Si `complete: true`, todos los demas campos estan
 * presentes.
 */
export type BuildResultsOutput =
  | {
      complete: false;
      missingSteps: RequiredStep[];
      nextRoute: string;
    }
  | {
      complete: true;
      bmi: BMIResult;
      isi: ISIResult;
      ess: ESSResult;
      stopBang: STOPBANGResult;
      phq9: PHQ9Result;
      gad7: GAD7Result;
      dass21: DASS21Result;
      phenotype: PhenotypeResult;
      risk: RiskAssessment;
      recommendations: RecommendationSet;
      precision: PrecisionResult;
      labPanel: LabPanel | null;
      geneticProfile: GeneticProfile | null;
      /** True si phq9[8] >= 1 — dispara CrisisHotlineCard reinforced. */
      item9Triggered: boolean;
      /** Lista de blocked recommendations derivada de safety rules. */
      blockedByCompliance: string[];
      /** Score precision dimension labels (para mostrar al paciente que faltan datos opcionales). */
      precisionMissingNotes: string[];
    };

/**
 * Detecta los pasos faltantes en el state.
 * Returns lista en orden del flow (primer faltante primero).
 */
function detectMissingSteps(state: EvalState): RequiredStep[] {
  const missing: RequiredStep[] = [];
  if (!state.profile) missing.push('profile');
  if (!state.safety) missing.push('safety');
  if (!state.isi || state.isi.length !== 7) missing.push('isi');
  if (!state.ess || state.ess.length !== 8) missing.push('ess');
  if (!state.stopBang) missing.push('stopBang');
  if (!state.phq9 || state.phq9.length !== 9) missing.push('phq9');
  if (!state.gad7 || state.gad7.length !== 7) missing.push('gad7');
  if (!state.dass21 || state.dass21.length !== 21) missing.push('dass21');
  if (!state.sleep) missing.push('sleep');
  return missing;
}

/**
 * Mappea state.sleep (Sprint 7.B SleepForm shape) al SleepData del
 * clinical-engine. Algunos campos no se capturan en Sprint 7.B
 * (earlyAwakening, earlyMorningAwakeningMinutes, caffeine, screen,
 * exercise) — usamos defaults razonables.
 *
 * Sub-DEBT: si Pablo valida y pide capturarlos, agregar al SleepForm
 * en Sprint 9.
 */
function buildSleepData(sleep: NonNullable<EvalState['sleep']>): SleepData {
  return {
    sleepLatencyMinutes: sleep.sleepLatencyMin,
    nightAwakenings: sleep.awakeningsPerNight,
    earlyAwakening: 'never',
    earlyMorningAwakeningMinutes: 0,
    totalSleepHours: sleep.totalHoursAsleep,
    timeInBedHours: sleep.timeInBedHours,
    subjectiveQuality: sleep.qualitySubjective,
    bedtimeWeekday: sleep.bedtimeTypical,
    waketimeWeekday: sleep.wakeTimeTypical,
  };
}

/**
 * Calcula sleep efficiency (% del tiempo en cama efectivamente
 * dormido). Replica la formula del clinical-engine para usarla en
 * RiskInputs.
 */
function sleepEfficiencyPercent(
  totalHoursAsleep: number,
  timeInBedHours: number,
): number {
  if (timeInBedHours <= 0) return 0;
  return Math.round((totalHoursAsleep / timeInBedHours) * 100 * 10) / 10;
}

/**
 * Construye los resultados completos. Si falta algun paso, devuelve
 * `complete: false` con el route al que redirigir.
 */
export function buildResults(state: EvalState): BuildResultsOutput {
  const missing = detectMissingSteps(state);
  if (missing.length > 0) {
    return {
      complete: false,
      missingSteps: missing,
      nextRoute: STEP_TO_ROUTE[missing[0]!],
    };
  }

  // Type narrowing: post-detectMissingSteps todos estan presentes.
  const profile = state.profile!;
  const safety = state.safety!;
  const isiResp = state.isi! as unknown as ISIResponses;
  const essResp = state.ess! as unknown as ESSResponses;
  const stopBangManual = state.stopBang!;
  const phq9Resp = state.phq9! as unknown as PHQ9Responses;
  const gad7Resp = state.gad7! as unknown as GAD7Responses;
  const dass21Resp = state.dass21! as unknown as DASS21Responses;
  const sleepUI = state.sleep!;

  // Scoring de instrumentos.
  const bmi = calculateBMI(profile.weightKg, profile.heightCm);
  const isi = scoreISI(isiResp);
  const ess = scoreESS(essResp);
  const stopBang = scoreSTOPBANG(stopBangManual, profile);
  const phq9 = scorePHQ9(phq9Resp);
  const gad7 = scoreGAD7(gad7Resp);
  const dass21 = scoreDASS21(dass21Resp);

  // Sleep + phenotype.
  const sleepData = buildSleepData(sleepUI);
  const phenotype = classifyInsomniaPhenotype(sleepData, isi.totalScore);

  // Recompute safety evaluation para obtener blockedRecommendations
  // canónicos (no dependemos del state.safety persistido — recalculamos
  // para garantizar que reflejan el clinical-engine actual).
  const safetyEval = evaluateAllSafetyRules(profile, safety, safety.currentMedications);
  const blockedByCompliance = safetyEval.rules
    .flatMap((r) => (r.triggered ? r.blockedRecommendations : []));

  // Risk assessment.
  const risk = assessRisk({
    isiTotal: isi.totalScore,
    essTotal: ess.totalScore,
    stopBangTotal: stopBang.totalScore,
    phq9Total: phq9.totalScore,
    gad7Total: gad7.totalScore,
    dass21StressScore: dass21.stressScore,
    bmi: bmi.bmi,
    sleepEfficiencyPercent: sleepEfficiencyPercent(
      sleepUI.totalHoursAsleep,
      sleepUI.timeInBedHours,
    ),
  });

  // Recommendations (respeta blockedIds).
  const hasAnxiety = gad7.totalScore >= 10;
  const hasDepression = phq9.totalScore >= 10;
  const recommendations = generateRecommendations(
    phenotype.phenotype,
    blockedByCompliance,
    hasAnxiety,
    hasDepression,
  );

  // Precision.
  const precision = calculatePrecision({
    hasISI: true,
    hasESS: true,
    hasSTOPBANG: true,
    hasPHQ9: true,
    hasGAD7: true,
    hasDASS21: true,
    hasSleepDiary: true,
    hasSleepDiaryDays: 14,
    hasBMI: true,
    hasNeckCircumference: false,
    hasLabVitD: !!state.lab?.vitD,
    hasLabB12: !!state.lab?.b12,
    hasLabIron: !!state.lab?.iron,
    hasLabFerritin: !!state.lab?.ferritin,
    hasLabMagnesium: !!state.lab?.magnesium,
    hasLabTSH: !!state.lab?.tsh,
    hasLabGlucose: !!state.lab?.glucose,
    hasGenetics: !!state.genetics && Object.keys(state.genetics).length > 0,
  } as Parameters<typeof calculatePrecision>[0]);

  // Lab + genetics analysis (opcionales).
  const labPanel = state.lab && Object.keys(state.lab).length > 0
    ? analyzeLabPanel(state.lab)
    : null;
  const geneticProfile =
    state.genetics && Object.keys(state.genetics).length > 0
      ? analyzeGeneticProfile(state.genetics)
      : null;

  // PHQ-9 item 9 detection.
  const item9Triggered = (phq9Resp[8] ?? 0) >= 1;

  return {
    complete: true,
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
    precisionMissingNotes: precision.missingData,
  };
}
