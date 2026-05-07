/**
 * SomnoSalud Clinical Engine — Módulo Principal
 * =================================================
 * Motor de lógica clínica verificable para evaluación
 * integral de trastornos del sueño.
 *
 * Este módulo es INDEPENDIENTE del front-end y puede ser
 * consumido por cualquier framework (Lovable, Next.js, etc.).
 *
 * Todos los algoritmos, puntos de corte y recomendaciones
 * están respaldados por publicaciones científicas indexadas
 * con DOI y PMID verificables.
 *
 * @author SomnoSalud Team
 * @version 1.0.0
 * @license Proprietary
 */

// ─── Scoring de instrumentos validados ──────────────────────────
export { scoreISI, ISI_ITEMS } from './scoring/isi';
export { scoreESS, ESS_ITEMS, ESS_OPTIONS } from './scoring/ess';
export { scoreSTOPBANG, STOPBANG_MANUAL_ITEMS, STOPBANG_AUTO_ITEMS } from './scoring/stop-bang';
export { scorePHQ9, PHQ9_ITEMS, PHQ9_OPTIONS, PHQ9_STEM } from './scoring/phq9';
export { scoreGAD7, GAD7_ITEMS, GAD7_OPTIONS, GAD7_STEM } from './scoring/gad7';
export { scoreDASS21, DASS21_ITEMS, DASS21_OPTIONS, DASS21_STEM } from './scoring/dass21';
export { calculateBMI } from './scoring/bmi';

// ─── Reglas de seguridad clínica ────────────────────────────────
export {
  evaluateAllSafetyRules,
  safe010_ageMinimum,
  safe020_pregnancy,
  safe040_melatoninAnticoagulant,
} from './safety/rules';

// ─── Motor de decisión clínica ──────────────────────────────────
export { classifyInsomniaPhenotype } from './engine/phenotype';
export { generateRecommendations, TREATMENT_DB } from './engine/recommendations';
export { assessRisk } from './engine/risk-integrator';
export { calculatePrecision } from './engine/precision';

// ─── Módulos especializados de diagnóstico ──────────────────
export { classifyEMA, getEMADifferentials, emaAlgorithm } from './engine/ema';
export { screenParasomnias, getRBDRisk, getParasomniasRecommendations } from './engine/parasomnias';
export { classifyCircadianDisorder, getCircadianRecommendations, differentiateInsomniaVsCircadian } from './engine/circadian-disorders';
export { screenRLS, assessIronStatus, getRLSRecommendations, assessAugmentationRisk, differentiatRLSMimics } from './engine/rls';
export { getSAHOSTreatmentLadder, getTreatmentOption, recommendSAHOSTreatment } from './engine/sahos-treatment';
export { getSleepStageInfo, getSleepStageNorms, getSleepStageModulators } from './engine/sleep-stages';
export { screenNarcolepsy, getNarcolepsyNonPharmRecommendations } from './engine/narcolepsy';
export { getSleepHygieneRecommendations, assessSleepHygieneCompliance } from './engine/sleep-hygiene';

// ─── Laboratorio y genética ─────────────────────────────────────
export { analyzeLabValue, analyzeLabPanel, LAB_PARAMETERS } from './lab/parameters';
export { analyzeVariant, analyzeGeneticProfile, VARIANT_DEFS } from './lab/genetics';

// ─── Referencias científicas ────────────────────────────────────
export {
  REFERENCES,
  getReference,
  getReferencesForModule,
  validateReferences,
} from './references';

// ─── Types (re-export) ──────────────────────────────────────────
export type * from './types';
export type { SafetyRuleResult, SafetyEvaluation, SafetySeverity } from './safety/rules';
export type { InsomniaPhenotype, PhenotypeResult } from './engine/phenotype';
export type { Recommendation, RecommendationSet, EvidenceLevel } from './engine/recommendations';
export type { RiskAssessment, RiskLevel, RiskFlag, RiskInputs } from './engine/risk-integrator';
export type { PrecisionResult, ConfidenceLevel, AvailableData } from './engine/precision';
export type { LabResult, LabPanel, LabStatus } from './lab/parameters';
export type { GeneVariant, GeneticProfile, GeneticImpact } from './lab/genetics';
export type { BMIResult, BMICategory } from './scoring/bmi';
