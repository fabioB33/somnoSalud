/**
 * Despertar Precoz (Early Morning Awakening) — Algoritmo Diferencial
 * ===================================================================
 * Algoritmo de 7 pasos para diagnóstico diferencial y tratamiento
 * del despertar precoz persistente (EMA: despiertas ≥30 min antes
 * de lo deseado ≥3 noches/semana durante ≥4 semanas).
 *
 * CAUSAS A EVALUAR (algoritmo ICSD-3):
 * 1. Apnea obstructiva del sueño (SAHOS) — STOP-BANG
 * 2. ERGE nocturna — síntomas
 * 3. Nicturia — frecuencia miccional
 * 4. Depresión mayor — PHQ-9 ≥10 (signo temprano)
 * 5. Adelanto de fase circadiano (ASWPD) — cronograma
 * 6. Dolor crónico — localización
 * 7. Alcohol, hipnóticos — consumo
 * 8. Hiperactivación del eje HPA — cortisol
 * 9. Hipoglucemia nocturna — glucometría
 *
 * INTERVENCIONES TCC-I ESPECÍFICAS PARA EMA:
 * - Sleep Restriction (restricción de TIB)
 * - Stimulus Control (si despierta >15-20 min, levantarse)
 * - Reestructuración cognitiva (decatastrofización)
 * - Intensive Sleep Retraining (ISR)
 * - Cronoterapia (luz vespertina, bloqueo luz matutina)
 * - Intervenciones HPA (MBSR, yoga, HRV biofeedback)
 *
 * REFERENCIAS PRINCIPALES:
 * Auger RR et al. Recommended Light Exposure Strategy Addresses Circadian Misalignment
 * and Seasonal Affective Disorder: An American Academy of Sleep Medicine Position Statement.
 * J Clin Sleep Med. 2015;11(10):1232-1233. DOI: 10.5664/jcsm.5100
 *
 * Irish LA, Kline CE, Gunn HE, Buysse DJ, Hall MH. The role of sleep hygiene in promoting
 * public health. J Public Health Manag Pract. 2014;20(2):220-226. DOI: 10.1097/PHH.0000000000000018
 *
 * @version 1.0.0
 */

export type EMAClassification = 'pure_ema' | 'circadian_component' | 'secondary_to_comorbidity' | 'mixed' | 'uncertain';

export interface EMACause {
  code: string;
  name: string;
  description: string;
  screeningCriteria: string[];
  estimatedProbability: number; // 0-100
  recommendedAction: string;
  reference: string;
}

export interface EMADifferentialDiagnosis {
  classification: EMAClassification;
  likeliestCauses: EMACause[];
  sleepRestrictionParameters?: {
    targetBedtimeHours: number;
    minimumBedtimeHours: number;
    currentSleepEfficiency: number;
  };
  chronotherapyParameters?: {
    eveningLightLux: number;
    eveningLightDurationMinutes: number;
    blueBlockingStartHour: number;
    avoidEarlyMorningLightHours: string; // ej: "5:00-7:00"
  };
  hpaInterventions: string[];
  nocturnaProtocol: string[];
  reference: string;
}

/**
 * Estimar la causa más probable del EMA basado en datos clínicos.
 * Algoritmo de decisión con 9 causas.
 */
export function getEMADifferentials(inputs: {
  stopBangScore?: number;
  hasGERDSymptoms?: boolean;
  micturitionsPerNight?: number;
  phq9Total?: number;
  waketimeWeekday?: string; // HH:MM
  bedtimeWeekday?: string;  // HH:MM
  hasChronicPain?: boolean;
  painLocation?: string;
  alcoholConsumption?: string;
  sleepEfficiency?: number;
  cortisol?: { morning: number; evening: number; ratio: number };
  glucemia?: number;
}): EMADifferentialDiagnosis {
  const causes: EMACause[] = [];

  // 1. SAHOS
  if (inputs.stopBangScore !== undefined && inputs.stopBangScore >= 5) {
    causes.push({
      code: 'EMA-SAHOS',
      name: 'Apnea obstructiva del sueño',
      description: 'Despertares fragmentados por eventos apneicos',
      screeningCriteria: ['STOP-BANG ≥5', 'Ronquidos', 'Cansancio diurno (ESS ≥11)'],
      estimatedProbability: 70,
      recommendedAction: 'Referir polisomnografía urgente. Considerar CPAP trial.',
      reference: 'Chung F et al. Anesthesiology. 2008;108(5):812-821.',
    });
  }

  // 2. ERGE nocturna
  if (inputs.hasGERDSymptoms) {
    causes.push({
      code: 'EMA-GERD',
      name: 'Enfermedad por reflujo gastroesofágico nocturna',
      description: 'Reflujo ácido que causa microdespertares',
      screeningCriteria: ['Ardor retroesternal nocturno', 'Regurgitación', 'Tos nocturna'],
      estimatedProbability: 40,
      recommendedAction: 'Consulta gastroenterología. Elevar cabecera, evitar comidas tardías.',
      reference: 'Kinoshita Y et al. Sleep Med Rev. 2017;36:134-140.',
    });
  }

  // 3. Nicturia
  if (inputs.micturitionsPerNight !== undefined && inputs.micturitionsPerNight >= 2) {
    causes.push({
      code: 'EMA-NICTURIA',
      name: 'Nicturia (despertares por necesidad de orinar)',
      description: 'Fragmentación de sueño por micciones nocturnas',
      screeningCriteria: ['≥2 despertares por necesidad de orinar', 'Volumen urinario adecuado'],
      estimatedProbability: 60,
      recommendedAction: 'Evaluar diuresis (diabtes, insuficiencia cardíaca). Restricción de líquidos <3h antes.',
      reference: 'Cornu JN et al. Eur Urol. 2012;61(1):78-85.',
    });
  }

  // 4. Depresión mayor (signo temprano de EMA)
  if (inputs.phq9Total !== undefined && inputs.phq9Total >= 10) {
    causes.push({
      code: 'EMA-DEPRESSION',
      name: 'Depresión mayor (despertar precoz como signo temprano)',
      description: 'En depresión, el despertar precoz es un signo cardinal previo a cambios en latencia',
      screeningCriteria: ['PHQ-9 ≥10', 'Anhedonia', 'Culpa/autorrecrimina', 'Ideación suicida'],
      estimatedProbability: 75,
      recommendedAction: 'Psiquiatría urgente. Psicoterapia + farmacoterapia antidepresiva.',
      reference: 'American Psychiatric Association. Diagnostic and Statistical Manual of Mental Disorders, Fifth Edition. Arlington, VA: American Psychiatric Publishing; 2013.',
    });
  }

  // 5. Adelanto de fase circadiano (ASWPD)
  if (inputs.bedtimeWeekday && inputs.waketimeWeekday) {
    const bedHour = parseInt(inputs.bedtimeWeekday.split(':')[0]);
    const wakeHour = parseInt(inputs.waketimeWeekday.split(':')[0]);
    // Si se duerme muy temprano (antes de las 20:00) y despierta muy temprano (antes de las 6:00)
    if (bedHour <= 20 && wakeHour <= 6) {
      causes.push({
        code: 'EMA-ASWPD',
        name: 'Adelanto de la fase del sueño (ASWPD, Advanced Sleep-Wake Phase Disorder)',
        description: 'Reloj circadiano adelantado. Despierta 2-3h antes de lo deseado.',
        screeningCriteria: ['Bedtime ≤20:00', 'Waketime ≤6:00', 'Cronotipo matinal extremo'],
        estimatedProbability: 65,
        recommendedAction: 'Luz vespertina 2500-10000 lux 2-3h antes de dormir. Evitar luz matutina temprana.',
        reference: 'Auger RR et al. J Clin Sleep Med. 2015;11(10):1199-1236.',
      });
    }
  }

  // 6. Dolor crónico
  if (inputs.hasChronicPain) {
    causes.push({
      code: 'EMA-PAIN',
      name: 'Dolor crónico (despertares por incomodidad)',
      description: 'Dolor que empeora con ciertos posiciones durante el sueño profundo',
      screeningCriteria: ['Dolor persistente', 'Relación temporal con despertares', 'Localización consistente'],
      estimatedProbability: 50,
      recommendedAction: `Analgesia optimizada. Fisioterapia. Si dolor ${inputs.painLocation || 'sin especificar'}.`,
      reference: 'Finan PH et al. Sleep Med Rev. 2013;17(4):285-294.',
    });
  }

  // 7. Alcohol
  if (inputs.alcoholConsumption && inputs.alcoholConsumption !== 'none') {
    causes.push({
      code: 'EMA-ALCOHOL',
      name: 'Alcohol (disrución de arquitectura de sueño)',
      description: 'Alcohol suprime REM y SWS; rebrote REM en 2-3h causa despertares',
      screeningCriteria: ['Consumo ≥3 tragos/día o ≥7/semana', 'EMA temporalmente relacionada'],
      estimatedProbability: 45,
      recommendedAction: 'Reducción o eliminación de alcohol. Si dependencia, referir adicciones.',
      reference: 'Ebrahim IO et al. Sleep Med Rev. 2013;17(4):285-292.',
    });
  }

  // 8. HPA hyperactivation (estrés crónico)
  if (
    inputs.cortisol?.ratio !== undefined &&
    inputs.cortisol.ratio > 3 // Relación cortisol mañana/tarde >3 sugiere hiperfunción
  ) {
    causes.push({
      code: 'EMA-HPA',
      name: 'Hiperactivación del eje hipotálamo-hipófiso-adrenal (estrés crónico)',
      description: 'Cortisol elevado a la mañana causa despertar precoz y vigilia matutina',
      screeningCriteria: ['Cortisol matinal >15 µg/dL', 'Ratio mañana/tarde >3', 'Ansiedad/estrés crónico'],
      estimatedProbability: 55,
      recommendedAction: 'MBSR, yoga, tai-chi. HRV biofeedback. Fosfatidilserina 100-300mg, L-teanina 200mg.',
      reference: 'Czeisler CA, Gooley JJ. Sleep and circadian rhythms in humans. Cold Spring Harb Symp Quant Biol. 2007;72:579-597.',
    });
  }

  // 9. Hipoglucemia nocturna
  if (inputs.glucemia !== undefined && inputs.glucemia < 70) {
    causes.push({
      code: 'EMA-HYPOGLYCEMIA',
      name: 'Hipoglucemia nocturna',
      description: 'Glucosa <70 mg/dL despierta al paciente y evita sueño profundo',
      screeningCriteria: ['Glucometría <70 mg/dL nocturna', 'Diabetes tipo 1 o 2 insulinizado'],
      estimatedProbability: 80,
      recommendedAction: 'Ajuste insulina nocturna. Glucómetro continuo. Educación diabetes.',
      reference: 'Banarer SR, Cryer PE. Sleep-related hypoglycemia-associated autonomic failure in type 1 diabetes. Diabetes. 2003;52(5):1195-1203.',
    });
  }

  // Ordenar por probabilidad
  causes.sort((a, b) => b.estimatedProbability - a.estimatedProbability);

  // Determinar clasificación
  let classification: EMAClassification = 'uncertain';
  if (causes.length === 0) {
    classification = 'uncertain';
  } else if (
    causes[0].code === 'EMA-ASWPD' &&
    !causes.some(c => c.estimatedProbability > 60 && c.code !== 'EMA-ASWPD')
  ) {
    classification = 'circadian_component';
  } else if (
    causes[0].code === 'EMA-DEPRESSION' ||
    causes[0].code === 'EMA-SAHOS'
  ) {
    classification = 'secondary_to_comorbidity';
  } else if (
    !causes[0].code.includes('ASWPD') &&
    !causes[0].code.includes('DEPRESSION') &&
    !causes[0].code.includes('SAHOS')
  ) {
    classification = 'pure_ema';
  } else {
    classification = 'mixed';
  }

  // Parámetros de restricción de sueño (si aplica)
  let sleepRestrictionParameters;
  if (inputs.sleepEfficiency !== undefined && inputs.sleepEfficiency < 85) {
    sleepRestrictionParameters = {
      targetBedtimeHours: Math.max(5, inputs.sleepEfficiency / 100), // Ej: SE=80% → TIB=5h
      minimumBedtimeHours: 5,
      currentSleepEfficiency: inputs.sleepEfficiency,
    };
  }

  // Parámetros de cronoterapia (si ASWPD parece probable)
  let chronotherapyParameters;
  if (
    inputs.bedtimeWeekday &&
    inputs.waketimeWeekday &&
    causes.some(c => c.code === 'EMA-ASWPD')
  ) {
    chronotherapyParameters = {
      eveningLightLux: 5000,
      eveningLightDurationMinutes: 30,
      blueBlockingStartHour: parseInt(inputs.waketimeWeekday.split(':')[0]) - 1,
      avoidEarlyMorningLightHours: '5:00-7:00',
    };
  }

  return {
    classification,
    likeliestCauses: causes,
    sleepRestrictionParameters,
    chronotherapyParameters,
    hpaInterventions: [
      'Mindfulness-Based Stress Reduction (MBSR)',
      'Yoga o Tai-Chi (30 min/día)',
      'HRV Biofeedback',
      'Fosfatidilserina 100-300mg + L-teanina 200mg',
      'Magnesio glicinato 200-400mg',
    ],
    nocturnaProtocol: [
      'Sin reloj a la vista (no clock-watching)',
      '100% oscuridad (máx 1 lux)',
      'Sin pantallas si despierta (luz azul ↑ vigilia)',
      'Técnicas de relajación: respiración 4-7-8, body scan',
      'ACT: aceptar vigilia, no luchar contra ella',
    ],
    reference: 'Algoritmo diferencial propietario SomnoSalud v1.0',
  };
}

/**
 * Función principal: algoritmo de 7 pasos para EMA.
 */
export function emaAlgorithm(inputs: Parameters<typeof getEMADifferentials>[0]): EMADifferentialDiagnosis {
  return getEMADifferentials(inputs);
}

/**
 * Clasificación simple de EMA.
 */
export function classifyEMA(inputs: {
  earlyMorningAwakeningMinutes: number;
  frequencyPerWeek: number;
  durationWeeks: number;
}): { hasEMA: boolean; reason: string } {
  if (
    inputs.earlyMorningAwakeningMinutes >= 30 &&
    inputs.frequencyPerWeek >= 3 &&
    inputs.durationWeeks >= 4
  ) {
    return {
      hasEMA: true,
      reason: `Despertar precoz ≥30 min, ≥3 noches/semana durante ${inputs.durationWeeks} semanas.`,
    };
  }
  return {
    hasEMA: false,
    reason: 'No cumple criterios ICSD-3 para despertar precoz clínicamente significativo.',
  };
}
