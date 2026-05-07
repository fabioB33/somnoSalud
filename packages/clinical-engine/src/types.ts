/**
 * SomnoSalud Clinical Engine — Type Definitions
 * ================================================
 * Interfaces TypeScript para todo el motor clínico.
 * Cada tipo está documentado con su origen y propósito clínico.
 *
 * @version 1.0.0
 * @license MIT
 */

// ============================================================
// DATOS DEL PACIENTE
// ============================================================

export type BiologicalSex = 'male' | 'female' | 'prefer_not_to_say';

export interface PatientProfile {
  dateOfBirth: string;        // ISO 8601: YYYY-MM-DD
  biologicalSex: BiologicalSex;
  weightKg: number;
  heightCm: number;
  timezone?: string;
}

export interface SafetyScreening {
  pregnancyStatus: 'yes' | 'no' | 'not_applicable';
  isPregnant: boolean;
  pregnancyWeeks?: number;
  currentMedications: string[];
  anticoagulantFlag: boolean;
  medicalConditions: string[];
  allergies: string[];
  shiftWork: boolean;
  shiftType?: 'night_fixed' | 'rotating' | 'on_call';
}

export interface SleepData {
  sleepLatencyMinutes: number;
  nightAwakenings: number;
  earlyAwakening: 'never' | 'sometimes' | 'frequently' | 'always';
  earlyMorningAwakeningMinutes: number;  // minutos antes de lo deseado
  totalSleepHours: number;
  timeInBedHours: number;
  subjectiveQuality: number;  // 1-10
  bedtimeWeekday?: string;    // HH:MM
  waketimeWeekday?: string;   // HH:MM
  caffeineLastHour?: number;  // hora del último consumo (0-23)
  caffeineCupsDay?: number;
  screenBeforeBed?: 'always' | 'frequently' | 'sometimes' | 'never';
  exerciseFrequency?: number; // veces por semana
  exerciseTime?: string;      // HH:MM
  treatmentPreference?: 'natural_only' | 'open_to_supplements' | 'open_to_all';
}

// ============================================================
// RESPUESTAS A CUESTIONARIOS
// ============================================================

/** ISI: 7 ítems, cada uno 0-4 */
export type ISIResponses = [number, number, number, number, number, number, number];

/** ESS: 8 ítems, cada uno 0-3 */
export type ESSResponses = [number, number, number, number, number, number, number, number];

/** STOP-BANG: 5 preguntas manuales (S, T, O, P, N) como boolean */
export interface STOPBANGManualResponses {
  snoring: boolean;       // S: Ronquidos fuertes
  tired: boolean;         // T: Cansancio diurno
  observed: boolean;      // O: Observado dejar de respirar
  pressure: boolean;      // P: Presión arterial alta
  neckOver40cm: boolean;  // N: Cuello > 40cm
}

/** PHQ-9: 9 ítems, cada uno 0-3 */
export type PHQ9Responses = [number, number, number, number, number, number, number, number, number];

/** GAD-7: 7 ítems, cada uno 0-3 */
export type GAD7Responses = [number, number, number, number, number, number, number];

/** DASS-21: 21 ítems, cada uno 0-3 */
export type DASS21Responses = [
  number, number, number, number, number, number, number,
  number, number, number, number, number, number, number,
  number, number, number, number, number, number, number
];

// ============================================================
// RESULTADOS DE SCORING
// ============================================================

export type ISISeverity = 'no_insomnia' | 'subthreshold' | 'moderate' | 'severe';
export type ESSSeverity = 'normal' | 'mild' | 'moderate' | 'severe';
export type ApneaRisk = 'low' | 'intermediate' | 'high';
export type PHQ9Severity = 'minimal' | 'mild' | 'moderate' | 'moderately_severe' | 'severe';
export type GAD7Severity = 'minimal' | 'mild' | 'moderate' | 'severe';
export type DASS21Severity = 'normal' | 'mild' | 'moderate' | 'severe' | 'extremely_severe';

export interface ISIResult {
  totalScore: number;     // 0-28
  severity: ISISeverity;
  severityLabel: string;  // español
  itemScores: number[];
  reference: string;
}

export interface ESSResult {
  totalScore: number;     // 0-24
  severity: ESSSeverity;
  severityLabel: string;
  itemScores: number[];
  reference: string;
}

export interface STOPBANGResult {
  totalScore: number;     // 0-8
  risk: ApneaRisk;
  riskLabel: string;
  itemDetails: Record<string, boolean>;
  autoCalculated: {
    bmiOver35: boolean;
    ageOver50: boolean;
    isMale: boolean;
  };
  reference: string;
}

export interface PHQ9Result {
  totalScore: number;     // 0-27
  severity: PHQ9Severity;
  severityLabel: string;
  itemScores: number[];
  reference: string;
}

export interface GAD7Result {
  totalScore: number;     // 0-21
  severity: GAD7Severity;
  severityLabel: string;
  itemScores: number[];
  reference: string;
}

export interface DASS21Result {
  depressionScore: number;   // raw × 2
  anxietyScore: number;      // raw × 2
  stressScore: number;       // raw × 2
  depressionSeverity: DASS21Severity;
  anxietySeverity: DASS21Severity;
  stressSeverity: DASS21Severity;
  depressionLabel: string;
  anxietyLabel: string;
  stressLabel: string;
  reference: string;
}

export type BMICategory = 'underweight' | 'normal' | 'overweight' | 'obesity_1' | 'obesity_2' | 'obesity_3';

export interface BMIResult {
  value: number;
  category: BMICategory;
  categoryLabel: string;
  color: string;
}

// ============================================================
// FENOTIPO Y EVALUACIÓN INTEGRAL
// ============================================================

export type InsomniaPhenotype = 'onset' | 'maintenance' | 'mixed' | 'none';

export interface PhenotypeResult {
  phenotype: InsomniaPhenotype;
  label: string;
  description: string;
}

export type IntegralRiskLevel = 'severe' | 'intermediate' | 'clear';

export interface IntegralRiskResult {
  level: IntegralRiskLevel;
  label: string;
  canProceed: boolean;
  flags: RedFlag[];
  precautions: Precaution[];
  referralUrgency?: string;
}

export interface RedFlag {
  code: string;
  label: string;
  severity: 'high' | 'possible' | 'none';
  details: string;
}

export interface Precaution {
  code: string;
  message: string;
  action: string;
}

// ============================================================
// REGLAS DE SEGURIDAD
// ============================================================

export type SafetyRuleCode = 'SAFE-010' | 'SAFE-020' | 'SAFE-040';

export interface SafetyRuleResult {
  code: SafetyRuleCode;
  triggered: boolean;
  action: 'block' | 'restrict' | 'flag' | 'exclude';
  message: string;
  details: string;
}

// ============================================================
// RECOMENDACIONES
// ============================================================

export type EvidenceLevel = 'A' | 'B' | 'C';
export type TreatmentType = 'behavioral' | 'supplement';

export interface Treatment {
  id: string;
  name: string;
  type: TreatmentType;
  evidenceLevel: EvidenceLevel;
  isFirstLine: boolean;
  description: string;
  howTo: string;
  dosage?: string;
  timing?: string;
  effectiveness: string;
  timeToResults?: string;
  contraindications: string[];
  references: string[];
  marketplaceUrls?: {
    mercadolibre: string;
    googleShopping: string;
  };
}

export interface RecommendationResult {
  behavioral: Treatment[];
  supplements: Treatment[];
  excluded: Array<{ treatment: string; reason: string; safetyRule: SafetyRuleCode }>;
  protocolModifications: string[];
}

// ============================================================
// LABORATORIO Y GENÉTICA
// ============================================================

export type LabStatus = 'low' | 'normal' | 'high';

export interface LabParameter {
  id: string;
  name: string;
  unit: string;
  normalMin: number;
  normalMax: number;
  optimalRange: string;
  relevanceToSleep: string;
}

export interface LabResult {
  parameterId: string;
  value: number;
  status: LabStatus;
  statusLabel: string;
  isOptimal: boolean;
  recommendation?: string;
}

export type GeneticVariant = 'normal' | 'variant';

export interface GeneAnalysis {
  geneId: string;
  geneName: string;
  variant: GeneticVariant;
  variantLabel: string;
  impact: string;
  recommendations: string[];
  reference: string;
}

// ============================================================
// PRECISIÓN DEL ANÁLISIS
// ============================================================

export interface PrecisionResult {
  percentage: number;
  factors: Array<{ factor: string; added: number }>;
  maxPossible: number;
}

// ============================================================
// EVALUACIÓN COMPLETA
// ============================================================

export interface FullEvaluationInput {
  patient: PatientProfile;
  safety: SafetyScreening;
  sleep: SleepData;
  isi: ISIResponses;
  ess: ESSResponses;
  stopBangManual: STOPBANGManualResponses;
  phq9: PHQ9Responses;
  gad7: GAD7Responses;
  dass21: DASS21Responses;
  labValues?: Record<string, number>;
  geneticVariants?: Record<string, GeneticVariant>;
  selectedProtocols?: string[];
}

export interface FullEvaluationResult {
  bmi: BMIResult;
  isi: ISIResult;
  ess: ESSResult;
  stopBang: STOPBANGResult;
  phq9: PHQ9Result;
  gad7: GAD7Result;
  dass21: DASS21Result;
  phenotype: PhenotypeResult;
  safetyRules: SafetyRuleResult[];
  integralRisk: IntegralRiskResult;
  recommendations: RecommendationResult;
  precision: PrecisionResult;
  labAnalysis?: LabResult[];
  geneticAnalysis?: GeneAnalysis[];
  timestamp: string;
  engineVersion: string;
}
