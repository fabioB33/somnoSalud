/**
 * Parasomnias — Algoritmo de Screening y Recomendaciones
 * =========================================================
 * Screening de parasomnias NREM (sonambulismo, terrores nocturnos)
 * y REM (trastorno de conducta REM, pesadillas).
 *
 * PARA NREM:
 * - Generalmente en primera mitad de la noche (SWS)
 * - Herencia genética común (~80% hay familiar)
 * - Desencadenantes: privación sueño, alcohol, estrés, fiebre
 * - Intervenciones: higiene sueño, ambiente seguro, scheduled awakenings
 * - Tratar SAHOS/PLMS comorbidos
 *
 * RBD (Rapid Eye Movement Behaviour Disorder):
 * - Enactment de sueños, movimientos violentos
 * - CRITICAL: Screening para alfa-sinucleína
 * - Iranzo A et al. (Lancet Neurol 2013): >80% convierte a Parkinson/DLB/MSA en 10+ años
 * - Primera línea: Melatonina 3-12mg
 * - Modificación ambiental: seguridad
 * - Suspender/rotar SSRIs, SNRIs, beta-bloqueantes
 *
 * PESADILLAS:
 * - Diferente de RBD: sin movimientos
 * - En REM, segunda mitad de la noche
 * - Asociado a TEPT, ansiedad
 * - Intervención: Image Rehearsal Therapy (IRT)
 *
 * REFERENCIAS:
 * Iranzo A, Santamaría J, Tolosa E. Idiopathic REM sleep behaviour disorder: towards
 * an understanding of the neurobiological substrate. Sleep Med Rev. 2016;25:105-116.
 * DOI: 10.1016/j.smrv.2015.05.002
 *
 * Viallet F, Arnulf I. REM sleep behaviour disorder. Rev Neurol (Paris). 2022;178(6):640-654.
 * DOI: 10.1016/j.neurol.2021.08.008
 *
 * @version 1.0.0
 */

export type ParasomniaDiagnosis = 'sleepwalking' | 'night_terrors' | 'rbd' | 'nightmares' | 'unknown' | 'none';

export interface RBDRiskAssessment {
  hasRBD: boolean;
  dreamEnactmentScore: number; // 0-10
  movementViolenceScore: number; // 0-10
  alphasynucleinRisk: 'high' | 'intermediate' | 'low';
  conversionProbability10Years: number; // 0-100%
  recommendedScreening: string[];
  reference: string;
}

export interface ParasomniasRecommendation {
  diagnosis: ParasomniaDiagnosis;
  description: string;
  interventions: string[];
  environmentalModifications: string[];
  medicationConsiderations?: {
    firstLine?: string;
    dosage?: string;
    duration?: string;
  };
  reference: string;
}

/**
 * Screening de parasomnias con preguntas clínicas.
 */
export function screenParasomnias(inputs: {
  wakesDuringNightWithConfusion?: boolean;
  wantsToGetOutOfBedAtNight?: boolean;
  isConfusedAfterAwakening?: boolean;
  hasDreamEnactment?: boolean;
  hasViolentMovements?: boolean;
  nightmaresFrequency?: number; // 0-7 noches/semana
  familyHistoryParasomnias?: boolean;
  sleepPrivationRecent?: boolean;
  hasAlcoholConsumption?: boolean;
  hasStressfulEvent?: boolean;
}): { likelyParasomnias: ParasomniaDiagnosis[]; riskLevel: 'high' | 'intermediate' | 'low' } {
  const findings: ParasomniaDiagnosis[] = [];
  let riskLevel: 'high' | 'intermediate' | 'low' = 'low';

  // NREM Parasomnias (Sleepwalking / Night Terrors)
  if (
    (inputs.wakesDuringNightWithConfusion &&
      inputs.wantsToGetOutOfBedAtNight &&
      inputs.isConfusedAfterAwakening) ||
    inputs.familyHistoryParasomnias
  ) {
    findings.push('sleepwalking', 'night_terrors');
    riskLevel = 'intermediate';
  }

  // RBD
  if (inputs.hasDreamEnactment || inputs.hasViolentMovements) {
    findings.push('rbd');
    riskLevel = 'high';
  }

  // Pesadillas
  if (inputs.nightmaresFrequency !== undefined && inputs.nightmaresFrequency >= 2) {
    findings.push('nightmares');
    riskLevel = 'intermediate';
  }

  if (findings.length === 0) {
    findings.push('none');
    riskLevel = 'low';
  }

  return { likelyParasomnias: findings, riskLevel };
}

/**
 * Evaluación de riesgo de RBD y conversión a sinucleinopatía.
 */
export function getRBDRisk(inputs: {
  dreamEnactmentScore: number; // 0-10
  movementViolenceScore: number; // 0-10
  ageYears?: number;
  durationYears?: number;
}): RBDRiskAssessment {
  // Puntuación combinada
  const combinedScore = (inputs.dreamEnactmentScore + inputs.movementViolenceScore) / 2;

  // Riesgo de alfa-sinucleína basado en duración y edad
  let alphasynucleinRisk: 'high' | 'intermediate' | 'low';
  let conversionProbability10Years: number;

  if (inputs.durationYears && inputs.durationYears >= 10) {
    // Iranzo et al. 2013: >80% de RBD crónico convierte a sinucleinopatía
    alphasynucleinRisk = 'high';
    conversionProbability10Years = 85;
  } else if (inputs.durationYears && inputs.durationYears >= 5) {
    alphasynucleinRisk = 'intermediate';
    conversionProbability10Years = 60;
  } else if (inputs.ageYears && inputs.ageYears >= 65) {
    alphasynucleinRisk = 'intermediate';
    conversionProbability10Years = 50;
  } else {
    alphasynucleinRisk = 'low';
    conversionProbability10Years = 20;
  }

  return {
    hasRBD: combinedScore >= 4,
    dreamEnactmentScore: inputs.dreamEnactmentScore,
    movementViolenceScore: inputs.movementViolenceScore,
    alphasynucleinRisk,
    conversionProbability10Years,
    recommendedScreening: [
      'RBD Screening Questionnaire (RBDSQ) ≥5 sugiere RBD',
      'Polisomnografía con video: phasic EMG durante REM ≥5.5% de duración REM',
      'Screening para Parkinson: UPDRS, bradicinesia, rigidez',
      'Screening para DLB: fluctuaciones cognitivas, alucinaciones visuales',
      'Screening para MSA: disfunción autonómica, parkinsonismo, cerebelar',
      'Imagen cerebral si signos de sinucleinopatía',
    ],
    reference: 'Iranzo A et al. Lancet Neurol. 2013;12(5):443-453. DOI: 10.1016/S1474-4422(13)70038-8',
  };
}

/**
 * Generar recomendaciones específicas para cada parasomnia.
 */
export function getParasomniasRecommendations(
  diagnosis: ParasomniaDiagnosis
): ParasomniasRecommendation {
  const recommendations: Record<ParasomniaDiagnosis, ParasomniasRecommendation> = {
    sleepwalking: {
      diagnosis: 'sleepwalking',
      description:
        'Episodios de actividad motora compleja durante sueño NREM (fase SWS), usualmente en primera mitad de la noche. Existe amnesia del episodio. Predisposición genética fuerte (~80% tiene familiar).',
      interventions: [
        'Mantener higiene del sueño óptima (reduce desencadenantes)',
        'Evitar privación de sueño',
        'Evitar alcohol y sedantes',
        'Técnicas de relajación antes de dormir',
        'Scheduled awakenings: despertar 15-20 min antes del horario usual de episodios',
        'Si síntomas persisten: melatonina 3-5mg o benzodiazepinas (solo prescripción)',
      ],
      environmentalModifications: [
        'Ambiente seguro: cerrar puertas con llave',
        'Remover objetos peligrosos de la habitación',
        'Colocar alerta en puertas/ventanas',
        'Cama baja o colchón en el piso',
        'Tener compañero de cuarto si es posible',
        'No despertar violentamente al paciente (puede causar confusión/agresión)',
      ],
      reference: 'Howell MJ. Sleep Med Rev. 2012;16(4):319-335. DOI: 10.1016/j.smrv.2011.08.002',
    },
    night_terrors: {
      diagnosis: 'night_terrors',
      description:
        'Episodios de miedo intenso durante sueño NREM SWS (primeras 1-3h). Despierta parcial con gritos, movimientos defensivos, vegetativismo (sudoración, taquicardia). Amnesia completa. Más común en niños.',
      interventions: [
        'Garantizar dormir lo suficiente (reduce desencadenantes)',
        'Evitar privación de sueño, estrés',
        'Mantener temperatura ambiental óptima',
        'Scheduled awakenings: despertar 15 min antes del episodio esperado',
        'Psicopsicologo: trabajar sobre miedos subyacentes',
        'Si severos: melatonina 5mg o tricíclicos (prescripción)',
      ],
      environmentalModifications: [
        'Ambiente calmado y seguro',
        'Habitación con baja iluminación (evitar luz repentina)',
        'Temperatura fresca (18-20°C)',
        'Remover peligros (vidrio, objetos afilados)',
        'Confort para acompañante (sin despertar violentamente)',
      ],
      reference: 'Petit D et al. Sleep Med Rev. 2015;22:39-49. DOI: 10.1016/j.smrv.2014.10.005',
    },
    rbd: {
      diagnosis: 'rbd',
      description:
        'Trastorno de Conducta REM: enactment de sueños (movimientos violentos, gritos, patadas) durante REM. CRÍTICO: >80% de RBD convierte a Parkinson/DLB/MSA en 10+ años (Iranzo 2013). Requiere screening para sinucleinopatía.',
      interventions: [
        'PRIMERA LÍNEA: Melatonina 3-12mg antes de dormir (eficacia 70-80% en RBD)',
        'Alternativa: Prazosina 1-5mg si melatonina no tolera (principalmente para TEPT+RBD)',
        'Evaluar y tratar comorbidos: SAHOS, depresión, ansiedad',
        'SUSPENDER/ROTAR: SSRIs, SNRIs, beta-bloqueantes (pueden precipitar RBD)',
        'Screening urgente para sinucleinopatía: Parkinson, DLB, MSA',
      ],
      environmentalModifications: [
        'Ambiente seguro: colchón firme, barandillas en cama',
        'Remover todos los objetos que podrían causar lesión',
        'Separar de compañero de cuarto si es posible',
        'Usar protección (almohadas alrededor de la cama)',
        'Evitar posiciones que podrían causar caídas',
      ],
      medicationConsiderations: {
        firstLine: 'Melatonina (suplemento)',
        dosage: '3-12 mg antes de dormir',
        duration: 'Continua; reevaluar cada 3-6 meses',
      },
      reference: 'Iranzo A et al. Lancet Neurol. 2013;12(5):443-453. DOI: 10.1016/S1474-4422(13)70038-8',
    },
    nightmares: {
      diagnosis: 'nightmares',
      description:
        'Sueños extensos, aterradores durante REM (segunda mitad de la noche). A diferencia de night terrors, SÍ hay recuerdo al despertar. Común en TEPT, ansiedad. Sin movimientos violentos como en RBD.',
      interventions: [
        'Image Rehearsal Therapy (IRT): rescenificar el sueño despierto durante el día, modificando la narrativa',
        'Técnicas de relajación y mindfulness',
        'Tratar comorbidas: TEPT, depresión, ansiedad',
        'Evitar alcohol y sedantes (pueden agravar pesadillas)',
        'Higiene sueño: consistencia de horarios',
        'Apoyo psicoterapéutico: traumas subyacentes',
      ],
      environmentalModifications: [
        'Ambiente de sueño cómodo y seguro',
        'Luz suave disponible si despierta assustado',
        'Compañero de cuarto si es tolerable',
        'Rutina relajante pre-sueño',
      ],
      reference: 'Schreuders B et al. J Trauma Stress. 2016;29(1):28-37. DOI: 10.1002/jts.22073',
    },
    unknown: {
      diagnosis: 'unknown',
      description: 'Síntomas compatibles con parasomnia pero clasificación incierta. Requiere evaluación más profunda.',
      interventions: [
        'Polisomnografía con video y audio para clasificación',
        'Diario de sueño detallado por 2 semanas',
        'Consulta con especialista en sueño',
      ],
      environmentalModifications: [
        'Medidas de seguridad generales',
        'Ambiente cómodo',
      ],
      reference: 'ICSD-3. American Academy of Sleep Medicine. 2014.',
    },
    none: {
      diagnosis: 'none',
      description: 'No hay evidencia de parasomnia significativa.',
      interventions: ['Continuar monitoreo. Mantener higiene del sueño.'],
      environmentalModifications: [],
      reference: 'N/A',
    },
  };

  return recommendations[diagnosis];
}
