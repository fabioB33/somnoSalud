/**
 * Integrador de Riesgo — SomnoSalud
 * =====================================
 * Evalúa el nivel de riesgo integral del paciente combinando
 * resultados de todos los instrumentos y datos clínicos.
 *
 * NIVELES DE RIESGO:
 * - SEVERO (red flags): requiere derivación a especialista
 * - INTERMEDIO: requiere seguimiento cercano
 * - BAJO: manejo con recomendaciones estándar
 *
 * MATRIZ DE FLAGS:
 * Flag                              | Fuente           | Umbral
 * ----------------------------------|------------------|------------------
 * Insomnio severo                   | ISI              | ≥22
 * AOS riesgo alto                   | STOP-BANG        | ≥5
 * Somnolencia severa                | ESS              | ≥18
 * Depresión moderada+               | PHQ-9            | ≥10
 * Ansiedad moderada+                | GAD-7            | ≥10
 * Estrés severo+                    | DASS-21          | ≥26 (×2)
 * IMC obesidad                      | BMI              | ≥30
 * Eficiencia sueño muy baja         | Diario sueño     | <75%
 *
 * REFERENCIAS:
 * Los umbrales provienen de las publicaciones originales de cada
 * instrumento (ver módulos de scoring individuales).
 *
 * @version 1.0.0
 */

// ─── Types ──────────────────────────────────────────────────────

export type RiskLevel = 'severe' | 'intermediate' | 'low';

export interface RiskFlag {
  code: string;
  name: string;
  description: string;
  source: string;
  value: number | boolean;
  threshold: string;
  triggered: boolean;
  severity: 'high' | 'medium';
}

export interface RiskAssessment {
  overallRisk: RiskLevel;
  overallRiskLabel: string;
  flags: RiskFlag[];
  triggeredFlags: RiskFlag[];
  highSeverityCount: number;
  mediumSeverityCount: number;
  requiresSpecialistReferral: boolean;
  referralReasons: string[];
  summary: string;
}

// ─── Inputs ─────────────────────────────────────────────────────

export interface RiskInputs {
  isiTotal: number;
  essTotal: number;
  stopBangTotal: number;
  phq9Total: number;
  gad7Total: number;
  dass21StressScore: number; // ya multiplicado ×2
  bmi: number;
  sleepEfficiencyPercent: number;
}

// ─── Evaluación de flags ────────────────────────────────────────

function evaluateFlags(inputs: RiskInputs): RiskFlag[] {
  return [
    {
      code: 'RF-ISI',
      name: 'Insomnio severo',
      description: 'ISI ≥22 indica insomnio clínico severo',
      source: 'ISI',
      value: inputs.isiTotal,
      threshold: '≥22',
      triggered: inputs.isiTotal >= 22,
      severity: 'high',
    },
    {
      code: 'RF-AOS',
      name: 'Riesgo alto de apnea obstructiva',
      description: 'STOP-BANG ≥5 indica alto riesgo de AOS, requiere polisomnografía',
      source: 'STOP-BANG',
      value: inputs.stopBangTotal,
      threshold: '≥5',
      triggered: inputs.stopBangTotal >= 5,
      severity: 'high',
    },
    {
      code: 'RF-ESS',
      name: 'Somnolencia diurna severa',
      description: 'ESS ≥18 indica somnolencia severa, riesgo de accidentes',
      source: 'ESS',
      value: inputs.essTotal,
      threshold: '≥18',
      triggered: inputs.essTotal >= 18,
      severity: 'high',
    },
    {
      code: 'RF-DEP',
      name: 'Depresión moderada o mayor',
      description: 'PHQ-9 ≥10, requiere evaluación y posible tratamiento psiquiátrico',
      source: 'PHQ-9',
      value: inputs.phq9Total,
      threshold: '≥10',
      triggered: inputs.phq9Total >= 10,
      severity: 'medium',
    },
    {
      code: 'RF-ANX',
      name: 'Ansiedad moderada o mayor',
      description: 'GAD-7 ≥10, la ansiedad contribuye significativamente al insomnio',
      source: 'GAD-7',
      value: inputs.gad7Total,
      threshold: '≥10',
      triggered: inputs.gad7Total >= 10,
      severity: 'medium',
    },
    {
      code: 'RF-STRESS',
      name: 'Estrés severo',
      description: 'DASS-21 estrés ≥26 (×2) indica nivel severo o extremo',
      source: 'DASS-21',
      value: inputs.dass21StressScore,
      threshold: '≥26',
      triggered: inputs.dass21StressScore >= 26,
      severity: 'medium',
    },
    {
      code: 'RF-OBESITY',
      name: 'Obesidad',
      description: 'IMC ≥30, factor de riesgo para AOS y mala calidad del sueño',
      source: 'BMI',
      value: inputs.bmi,
      threshold: '≥30',
      triggered: inputs.bmi >= 30,
      severity: 'medium',
    },
    {
      code: 'RF-EFFICIENCY',
      name: 'Eficiencia del sueño muy baja',
      description: 'Eficiencia <75% indica disrupción severa del sueño',
      source: 'Diario sueño',
      value: inputs.sleepEfficiencyPercent,
      threshold: '<75%',
      triggered: inputs.sleepEfficiencyPercent < 75,
      severity: 'medium',
    },
  ];
}

// ─── Determinación del nivel de riesgo ──────────────────────────

export function assessRisk(inputs: RiskInputs): RiskAssessment {
  const flags = evaluateFlags(inputs);
  const triggered = flags.filter(f => f.triggered);
  const highCount = triggered.filter(f => f.severity === 'high').length;
  const mediumCount = triggered.filter(f => f.severity === 'medium').length;

  // Lógica de clasificación
  let overallRisk: RiskLevel;
  let overallRiskLabel: string;

  if (highCount >= 1 || (mediumCount >= 3)) {
    overallRisk = 'severe';
    overallRiskLabel = 'Riesgo severo — requiere derivación a especialista';
  } else if (mediumCount >= 1 || triggered.length >= 2) {
    overallRisk = 'intermediate';
    overallRiskLabel = 'Riesgo intermedio — seguimiento cercano recomendado';
  } else {
    overallRisk = 'low';
    overallRiskLabel = 'Riesgo bajo — manejo con recomendaciones estándar';
  }

  // Motivos de derivación
  const referralReasons: string[] = [];
  if (triggered.some(f => f.code === 'RF-AOS')) {
    referralReasons.push('Alto riesgo de AOS → derivar a medicina del sueño para polisomnografía');
  }
  if (triggered.some(f => f.code === 'RF-ISI')) {
    referralReasons.push('Insomnio severo → considerar derivación a especialista en sueño');
  }
  if (triggered.some(f => f.code === 'RF-ESS')) {
    referralReasons.push('Somnolencia severa → evaluar narcolepsia u otros trastornos de hipersomnia');
  }
  if (triggered.some(f => f.code === 'RF-DEP') && inputs.phq9Total >= 15) {
    referralReasons.push('Depresión moderadamente severa/severa → derivar a psiquiatría');
  }

  const summary = triggered.length === 0
    ? 'No se detectaron banderas de riesgo. Perfil de bajo riesgo.'
    : `${triggered.length} bandera(s) activa(s): ${triggered.map(f => f.name).join(', ')}. Nivel: ${overallRiskLabel}.`;

  return {
    overallRisk,
    overallRiskLabel,
    flags,
    triggeredFlags: triggered,
    highSeverityCount: highCount,
    mediumSeverityCount: mediumCount,
    requiresSpecialistReferral: referralReasons.length > 0,
    referralReasons,
    summary,
  };
}
