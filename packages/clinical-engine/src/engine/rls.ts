/**
 * Síndrome de Piernas Inquietas (RLS) — Screening y Manejo
 * ==========================================================
 * Algoritmo para screening, diagnóstico diferencial y tratamiento
 * del Restless Legs Syndrome (RLS) según criterios ICSD-3/IRLSSG.
 *
 * CRITERIOS DIAGNÓSTICOS ICSD-3/IRLSSG (TODOS deben estar presentes):
 * 1. URGE: Urgencia irresistible de mover las piernas
 * 2. WORSE-AT-REST: Empeora con reposo (sentado/acostado)
 * 3. RELIEF-WITH-MOVEMENT: Mejora con movimiento (caminar, estirar)
 * 4. TEMPORAL: Empeora por la tarde/noche
 * 5. DISTURBANCE: Interfiere con sueño/función diurna
 *
 * HIERRO SÉRICO — PASO 1 (Allen et al. 2018):
 * - Ferritina <75 µg/L es deficiencia de hierro y DEBE tratarse
 * - Objetivo de ferritina: >75, idealmente >100 µg/L
 * - Suplementación: Sulfato ferroso 325mg + vitamina C 100mg
 * - O: Bisglicinto de hierro (mejor tolerancia GI)
 * - IV si ferritina <100 y fallo oral (consultar hematología)
 *
 * GABAPENTINOIDES PRIMERA LÍNEA (menor riesgo de aumento):
 * - Pregabalina 150-600mg/día
 * - Gabapentina (enacarbil) 600-2400mg/día
 * - Menor riesgo de aumento vs dopaminérgicos (>50% a 10 años)
 *
 * CONCEPTO DE AUMENTO:
 * - Paradoja: RLS empeora CON dopaminérgicos crónicos
 * - Aumento: extensión del síntoma a otras extremidades, earlier onset
 * - Prevalencia: >50% con dopaminérgicos a los 10 años
 * - Mecanismo: sensibilización de receptores dopaminérgicos
 *
 * REFERENCIAS:
 * Allen RP, Chen JJ, Garcia-Borreguero D, et al. Severity of Restless Legs Syndrome
 * Correlated with Regional Blood Iron Levels. Sleep Med. 2018;47:1-7.
 * DOI: 10.1016/j.sleep.2018.03.006
 *
 * García-Borreguero D, Silber MH. Clinical aspects of restless legs syndrome.
 * Sleep Med Rev. 2018;41:58-73. DOI: 10.1016/j.smrv.2018.02.002
 *
 * @version 1.0.0
 */

export type RLSScreeningResult = 'probable_rls' | 'possible_rls' | 'unlikely_rls' | 'rls_mimics';

export interface RLSCriteria {
  hasUrgeToMove: boolean;
  worseAtRest: boolean;
  reliefWithMovement: boolean;
  worseEveningNight: boolean;
  sleepDisruption: boolean;
  durationMonths?: number;
}

export interface IronStatus {
  ferratin: number; // µg/L
  ironSerum: number; // µg/dL
  tibc: number; // µg/dL
  transferrinSaturation: number; // %
  deficient: boolean;
  recommendedIntervention: string;
}

export interface RLSAssessment {
  screening: RLSScreeningResult;
  criteriaScore: number; // 0-5
  ironDeficiency: boolean;
  ironInterventionNeeded: boolean;
  augmentationRisk: 'high' | 'moderate' | 'low';
  recommendedTreatment: string[];
  reference: string;
}

/**
 * Screening inicial de RLS con los 5 criterios ICSD-3/IRLSSG.
 */
export function screenRLS(criteria: RLSCriteria): {
  result: RLSScreeningResult;
  criteriaCount: number;
  reasoning: string;
} {
  const metCriteria = [
    criteria.hasUrgeToMove,
    criteria.worseAtRest,
    criteria.reliefWithMovement,
    criteria.worseEveningNight,
    criteria.sleepDisruption,
  ].filter(c => c).length;

  if (metCriteria === 5) {
    return {
      result: 'probable_rls',
      criteriaCount: 5,
      reasoning: 'Cumple los 5 criterios ICSD-3/IRLSSG. RLS probable.',
    };
  } else if (metCriteria === 4) {
    return {
      result: 'possible_rls',
      criteriaCount: 4,
      reasoning: 'Cumple 4 de 5 criterios. RLS posible. Requiere evaluación clínica adicional.',
    };
  } else if (metCriteria >= 2) {
    return {
      result: 'unlikely_rls',
      criteriaCount: metCriteria,
      reasoning: 'Cumple solo 2-3 criterios. RLS improbable. Considerar diagnósticos alternativos.',
    };
  } else {
    return {
      result: 'rls_mimics',
      criteriaCount: metCriteria,
      reasoning: 'No cumple criterios ICSD-3. Pensar en otros diagnósticos.',
    };
  }
}

/**
 * Evaluar estado de hierro del paciente.
 */
export function assessIronStatus(inputs: {
  ferritin: number; // µg/L
  ironSerum: number; // µg/dL
  tibc: number; // µg/dL
}): IronStatus {
  const transferrinSaturation = (inputs.ironSerum / inputs.tibc) * 100;

  const deficient = inputs.ferritin < 75;

  let recommendedIntervention = '';
  if (inputs.ferritin < 50) {
    recommendedIntervention = 'Deficiencia de hierro severa. Suplementación urgente: sulfato ferroso 325mg + vitamina C 100mg daily. Considerar IV si fallo oral.';
  } else if (inputs.ferritin < 75) {
    recommendedIntervention = 'Deficiencia de hierro moderada. Suplementación: sulfato ferroso 325mg + vitamina C 100mg daily. Meta: ferritina >100.';
  } else if (inputs.ferritin < 100) {
    recommendedIntervention = 'Hierro bajo-normal en RLS. Considerar suplementación para optimizar (meta >100). Monitoreo cada 3 meses.';
  } else {
    recommendedIntervention = 'Hierro normal. No requiere suplementación rutinaria. Monitoreo anual.';
  }

  return {
    ferratin: inputs.ferritin,
    ironSerum: inputs.ironSerum,
    tibc: inputs.tibc,
    transferrinSaturation,
    deficient,
    recommendedIntervention,
  };
}

/**
 * Evaluar riesgo de aumento (augmentation) con tratamiento dopaminérgico.
 */
export function assessAugmentationRisk(inputs: {
  durationYears?: number;
  previousDopaminergicTreatment?: boolean;
  symptomProgression?: 'stable' | 'progressive' | 'unknown';
  currentAge?: number;
}): 'high' | 'moderate' | 'low' {
  let riskLevel: 'high' | 'moderate' | 'low' = 'low';

  if (inputs.previousDopaminergicTreatment) {
    riskLevel = 'high';
  } else if (inputs.durationYears !== undefined && inputs.durationYears > 10) {
    riskLevel = inputs.symptomProgression === 'progressive' ? 'high' : 'moderate';
  } else if (inputs.durationYears !== undefined && inputs.durationYears > 5) {
    riskLevel = 'moderate';
  }

  if (inputs.currentAge !== undefined && inputs.currentAge < 40) {
    // Edad joven + RLS = mayor riesgo de exposición dopaminérgica crónica
    if (riskLevel === 'low') riskLevel = 'moderate';
  }

  return riskLevel;
}

/**
 * Generar recomendaciones de tratamiento para RLS.
 */
export function getRLSRecommendations(inputs: {
  ironStatus: ReturnType<typeof assessIronStatus>;
  augmentationRisk: 'high' | 'moderate' | 'low';
  previousTreatmentResponse?: string[];
}): RLSAssessment {
  const recommendations: string[] = [];

  // PASO 1: Hierro
  if (inputs.ironStatus.deficient) {
    recommendations.push(
      '1. HIERRO (PASO 1 — OBLIGATORIO): ' + inputs.ironStatus.recommendedIntervention
    );
  } else {
    recommendations.push(
      '1. Hierro normal (ferritina ' +
        inputs.ironStatus.ferratin +
        '). Monitoreo periódico.'
    );
  }

  // PASO 2: Gabapentinoides PRIMERA LÍNEA
  recommendations.push(
    '2. GABAPENTINOIDES (PRIMERA LÍNEA — menor riesgo de aumento): Pregabalina 150-600mg/día O Gabapentina (enacarbil) 600-2400mg/día. Iniciar bajo, titular gradual.'
  );

  // PASO 3: Alternativas si gabapentinoides fallan
  recommendations.push(
    '3. ALTERNATIVAS si gabapentinoides inefectivos: L-DOPA (precaución: alto riesgo aumento), dopaminérgicos (requiere monitoreo aumento), opioides (última línea).'
  );

  // PASO 4: Monitoreo de aumento
  if (inputs.augmentationRisk === 'high') {
    recommendations.push(
      '4. ALTO RIESGO DE AUMENTO: Si usa dopaminérgicos, monitoreo trimestral. Cambiar a gabapentinoide si hay evidencia de aumento (síntomas en brazos, earlier onset).'
    );
  }

  // PASO 5: Medidas no farmacológicas
  recommendations.push(
    '5. MEDIDAS NO FARMACOLÓGICAS: Evitar cafeína/alcohol, ejercicio regular, masajes, duchas calientes, dormir lo suficiente.'
  );

  return {
    screening: 'probable_rls',
    criteriaScore: 5,
    ironDeficiency: inputs.ironStatus.deficient,
    ironInterventionNeeded: inputs.ironStatus.deficient,
    augmentationRisk: inputs.augmentationRisk,
    recommendedTreatment: recommendations,
    reference: 'Allen RP et al. Sleep Med. 2018;47:1-7. / García-Borreguero D et al. Sleep Med Rev. 2018;41:58-73.',
  };
}

/**
 * Diferenciar RLS de otros diagnósticos que pueden simular RLS.
 */
export function differentiatRLSMimics(inputs: {
  symptomLocation: string; // ej: "piernas", "brazos", "todo el cuerpo"
  triggerFactors?: string[];
  reliefFactors?: string[];
  qualityOfSensation?: string; // ej: "hormigueo", "dolor", "inquietud"
}): {
  likelyDiagnosis: string[];
  reasoning: string;
  nextSteps: string[];
} {
  const mimics: string[] = [];
  const nextSteps: string[] = [];

  // Si es solo hormigueo → polineuropatía
  if (inputs.qualityOfSensation?.includes('hormigueo')) {
    mimics.push('Polineuropatía (diabética, tóxica)');
    nextSteps.push('Evaluación neurológica. Velocidad de conducción nerviosa (NCV).');
  }

  // Si es dolor → artralgia/mialgía
  if (inputs.qualityOfSensation?.includes('dolor')) {
    mimics.push('Artralgia/Mialgía');
    nextSteps.push('Radiografía de articulaciones. Evaluación reumatológica si es indicado.');
  }

  // Si afecta brazos/tronco → no es RLS típico
  if (inputs.symptomLocation.includes('brazos') || inputs.symptomLocation.includes('tronco')) {
    mimics.push('Síntomas de RLS atípicos o diagnóstico alternativo');
    nextSteps.push('Confirmación con polisomnografía + movimientos periódicos de piernas (PLM).');
  }

  // Si mejora con sedantes → ansiolítico vs RLS
  if (inputs.reliefFactors?.includes('sedantes')) {
    mimics.push('Ansiedad');
    nextSteps.push('GAD-7 screening. Considerar intervención psicológica.');
  }

  if (mimics.length === 0) {
    return {
      likelyDiagnosis: ['RLS probable'],
      reasoning: 'Síntomas compatibles con RLS. Proceder con screening formal.',
      nextSteps: ['Polisomnografía con índice de movimientos periódicos.', 'Evaluación de hierro.'],
    };
  }

  return {
    likelyDiagnosis: mimics,
    reasoning: 'Síntomas sugieren diagnóstico alternativo o RLS atípico.',
    nextSteps,
  };
}
