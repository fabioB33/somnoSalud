/**
 * Reglas de Seguridad Clínica — SomnoSalud
 * ===========================================
 * Módulo de safety gates que evalúa condiciones críticas ANTES
 * de generar cualquier recomendación terapéutica.
 *
 * REGLAS IMPLEMENTADAS:
 *
 * SAFE-010 — Edad mínima
 *   Menores de 18 años: bloqueo total, derivar a pediatría.
 *   Ref: American Academy of Pediatrics guidelines.
 *
 * SAFE-020 — Embarazo
 *   Embarazo detectado: bloqueo de suplementos, solo recomendaciones
 *   conductuales (higiene del sueño, relajación).
 *   Ref: Oyiengo D et al. Sleep Med Rev. 2014;18(4):293-307.
 *   Ref: Andersen ML et al. Sleep Med Rev. 2018;38:28-39.
 *
 * SAFE-040 — Interacción melatonina + anticoagulantes
 *   Si paciente toma anticoagulantes (warfarina, acenocumarol,
 *   heparina, rivaroxabán, apixabán, dabigatrán, edoxabán):
 *   bloquear recomendación de melatonina.
 *   Ref: Hosseinzadeh A et al. Biomed Pharmacother. 2021;141:111902.
 *
 * DISEÑO:
 * - Cada regla retorna un SafetyRuleResult con: triggered, ruleCode,
 *   severity, message, action, y references.
 * - La función principal evaluateAllSafetyRules() corre todas las
 *   reglas y retorna un resumen con el máximo nivel de severidad.
 *
 * @version 1.0.0
 */

import type { PatientProfile, SafetyScreening } from '../types';

// ─── Types ──────────────────────────────────────────────────────

export type SafetySeverity = 'block' | 'restrict' | 'warn' | 'clear';

export interface SafetyRuleResult {
  ruleCode: string;
  ruleName: string;
  triggered: boolean;
  severity: SafetySeverity;
  message: string;
  action: string;
  blockedRecommendations: string[];
  references: string[];
}

export interface SafetyEvaluation {
  rules: SafetyRuleResult[];
  maxSeverity: SafetySeverity;
  anyBlocking: boolean;
  anyRestricting: boolean;
  blockedCategories: string[];
  summary: string;
}

// ─── SAFE-010: Edad mínima (< 18 años) ─────────────────────────

function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function safe010_ageMinimum(patient: PatientProfile): SafetyRuleResult {
  const age = calculateAge(patient.dateOfBirth);
  const triggered = age < 18;

  return {
    ruleCode: 'SAFE-010',
    ruleName: 'Edad mínima',
    triggered,
    severity: triggered ? 'block' : 'clear',
    message: triggered
      ? `Paciente de ${age} años. SomnoSalud está diseñado para adultos (≥18 años). Los trastornos del sueño en menores requieren evaluación pediátrica especializada.`
      : `Paciente de ${age} años. Cumple requisito de edad mínima.`,
    action: triggered
      ? 'BLOQUEAR evaluación completa. Derivar a pediatría/medicina del sueño pediátrica.'
      : 'Continuar con evaluación.',
    blockedRecommendations: triggered ? ['ALL'] : [],
    references: [
      'American Academy of Pediatrics. Pediatrics. 2016;138(6):e20162940.',
    ],
  };
}

// ─── SAFE-020: Embarazo ─────────────────────────────────────────

export function safe020_pregnancy(screening: SafetyScreening): SafetyRuleResult {
  const triggered = screening.isPregnant === true;

  return {
    ruleCode: 'SAFE-020',
    ruleName: 'Embarazo',
    triggered,
    severity: triggered ? 'restrict' : 'clear',
    message: triggered
      ? 'Embarazo detectado. Se bloquean todos los suplementos. Solo se permiten intervenciones conductuales (higiene del sueño, técnicas de relajación, TCC-I adaptada).'
      : 'Sin embarazo reportado.',
    action: triggered
      ? 'RESTRINGIR: solo recomendaciones conductuales. Bloquear melatonina, magnesio, L-teanina, glicina y cualquier suplemento.'
      : 'Continuar sin restricción.',
    blockedRecommendations: triggered
      ? ['melatonin', 'magnesium', 'l-theanine', 'glycine', 'ALL_SUPPLEMENTS']
      : [],
    references: [
      'Oyiengo D et al. Sleep Med Rev. 2014;18(4):293-307.',
      'Andersen ML et al. Sleep Med Rev. 2018;38:28-39.',
    ],
  };
}

// ─── SAFE-040: Interacción melatonina + anticoagulantes ─────────

const ANTICOAGULANTS = [
  'warfarina', 'acenocumarol', 'heparina',
  'enoxaparina', 'rivaroxabán', 'rivaroxaban',
  'apixabán', 'apixaban', 'dabigatrán', 'dabigatran',
  'edoxabán', 'edoxaban',
  // Nombres comerciales comunes en LATAM
  'coumadin', 'sintrom', 'xarelto', 'eliquis', 'pradaxa', 'lixiana',
];

export function safe040_melatoninAnticoagulant(
  medications: string[]
): SafetyRuleResult {
  const normalizedMeds = medications.map(m => m.toLowerCase().trim());
  const foundAnticoagulants = normalizedMeds.filter(m =>
    ANTICOAGULANTS.some(ac => m.includes(ac))
  );
  const triggered = foundAnticoagulants.length > 0;

  return {
    ruleCode: 'SAFE-040',
    ruleName: 'Interacción melatonina-anticoagulantes',
    triggered,
    severity: triggered ? 'restrict' : 'clear',
    message: triggered
      ? `Paciente toma anticoagulante(s): ${foundAnticoagulants.join(', ')}. La melatonina puede potenciar el efecto anticoagulante e incrementar riesgo de sangrado. Se bloquea recomendación de melatonina.`
      : 'Sin anticoagulantes reportados.',
    action: triggered
      ? 'RESTRINGIR: bloquear melatonina. Otros suplementos y conductuales permitidos (verificar individualmente).'
      : 'Continuar sin restricción de melatonina.',
    blockedRecommendations: triggered ? ['melatonin'] : [],
    references: [
      'Hosseinzadeh A et al. Biomed Pharmacother. 2021;141:111902.',
    ],
  };
}

// ─── Evaluación integral de seguridad ───────────────────────────

const SEVERITY_ORDER: SafetySeverity[] = ['clear', 'warn', 'restrict', 'block'];

function maxSeverityOf(results: SafetyRuleResult[]): SafetySeverity {
  let max: SafetySeverity = 'clear';
  for (const r of results) {
    if (SEVERITY_ORDER.indexOf(r.severity) > SEVERITY_ORDER.indexOf(max)) {
      max = r.severity;
    }
  }
  return max;
}

export function evaluateAllSafetyRules(
  patient: PatientProfile,
  screening: SafetyScreening,
  medications: string[]
): SafetyEvaluation {
  const rules: SafetyRuleResult[] = [
    safe010_ageMinimum(patient),
    safe020_pregnancy(screening),
    safe040_melatoninAnticoagulant(medications),
  ];

  const triggered = rules.filter(r => r.triggered);
  const maxSev = maxSeverityOf(rules);
  const anyBlocking = rules.some(r => r.severity === 'block' && r.triggered);
  const anyRestricting = rules.some(r => r.severity === 'restrict' && r.triggered);

  const blockedCategories = [
    ...new Set(triggered.flatMap(r => r.blockedRecommendations)),
  ];

  let summary: string;
  if (triggered.length === 0) {
    summary = 'Todas las reglas de seguridad superadas. Proceder con evaluación completa.';
  } else if (anyBlocking) {
    const blockingRules = triggered.filter(r => r.severity === 'block');
    summary = `BLOQUEO ACTIVO por ${blockingRules.map(r => r.ruleCode).join(', ')}. ${blockingRules[0].action}`;
  } else {
    summary = `Restricciones activas: ${triggered.map(r => r.ruleCode).join(', ')}. Evaluación permitida con limitaciones en recomendaciones.`;
  }

  return {
    rules,
    maxSeverity: maxSev,
    anyBlocking,
    anyRestricting,
    blockedCategories,
    summary,
  };
}
