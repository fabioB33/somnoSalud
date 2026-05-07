/**
 * Trastornos Circadianos — Algoritmo de Clasificación y Tratamiento
 * ==================================================================
 * Clasificación y manejo de trastornos del ritmo circadiano:
 * - DSWPD (Delayed Sleep-Wake Phase Disorder)
 * - ASWPD (Advanced Sleep-Wake Phase Disorder)
 * - Non-24-hour Sleep-Wake Rhythm Disorder
 * - Irregular Sleep-Wake Rhythm Disorder (ISWRD)
 *
 * DSWPD (Retraso de Fase):
 * - Duerme/despierta 2-3h más tarde de lo deseado
 * - Cronotipo vespertino extremo
 * - LUZ MATUTINA ≥10000 lux × 30 min (ANTES que melatonina)
 * - Melatonina 0.5-3mg × 5-7 horas ANTES de la hora deseada de sueño
 * - TIMING > DOSIS (Auger et al. 2015)
 *
 * ASWPD (Adelanto de Fase):
 * - Duerme/despierta 2-3h más temprano de lo deseado
 * - Cronotipo matinal extremo
 * - LUZ VESPERTINA 2500-10000 lux × 2-3h ANTES de dormir
 * - Evitar luz matutina temprana (<7:00)
 * - Actividad social vespertina
 *
 * Non-24 (Libre-Corriente):
 * - Ausencia de zeitgeber (luz estructurada, horarios)
 * - Dormir ~1h más tarde cada noche
 * - Tasimelteon 20mg (solo medicamento específico, requiere prescripción)
 * - Melatonina 0.5-10mg a la misma hora cada noche
 *
 * ISWRD (Sueño-Vigilia Irregular):
 * - Múltiples episodios de sueño dispersos durante 24h
 * - Luz diurna 10000 lux, actividades/comidas a horarios fijos
 * - Melatonina 2-5mg
 *
 * REFERENCIAS:
 * Auger RR, Burgess HJ, Emens JS, Dierkhising RA, Lee TM. Recommended light exposure
 * strategy addresses circadian misalignment. J Clin Sleep Med. 2015;11(10):1232-1233.
 * DOI: 10.5664/jcsm.5100
 *
 * Lockley SW, Arendt J, Skene DJ. Visual impairment and circadian rhythm disorders.
 * Lancet. 2007;369(9567):946-948. DOI: 10.1016/S0140-6736(07)60476-5
 *
 * @version 1.0.0
 */

export type CircadianDisorder = 'dswpd' | 'aswpd' | 'non24' | 'iswrd' | 'none';

export interface CircadianClassificationResult {
  disorder: CircadianDisorder;
  label: string;
  criteria: string[];
  likelyPhase: string; // ej: "Retraso de +2 a +3 horas"
  reference: string;
}

export interface CircadianTreatmentPlan {
  disorder: CircadianDisorder;
  description: string;
  lightTherapy: {
    type: string; // "morning", "evening"
    lux: number;
    durationMinutes: number;
    timing: string;
  };
  melatoninRegimen?: {
    dosage: string;
    timing: string;
    duration: string;
    notes: string;
  };
  otherInterventions: string[];
  expectedTimeToAdjustment: string;
  reference: string;
}

/**
 * Determinar si los síntomas son insomnio vs trastorno circadiano.
 */
export function differentiateInsomniaVsCircadian(inputs: {
  canFallAsleepWhenDesired?: boolean;
  canMaintainSleep?: boolean;
  sleepQualityWhenAsleep?: number; // 1-10
  bedtimeWeekday?: string; // HH:MM
  waketimeWeekday?: string; // HH:MM
  desiredBedtime?: string; // HH:MM
  desiredWaketime?: string; // HH:MM
  sleepLatencyMinutes?: number;
  nightAwakenings?: number;
}): {
  isInsomnia: boolean;
  isCircadian: boolean;
  reason: string;
} {
  const hasInsomniaFeatures =
    (inputs.canFallAsleepWhenDesired === false ||
      inputs.canMaintainSleep === false ||
      (inputs.sleepQualityWhenAsleep !== undefined && inputs.sleepQualityWhenAsleep < 5)) &&
    (inputs.sleepLatencyMinutes !== undefined && inputs.sleepLatencyMinutes > 30 ||
      inputs.nightAwakenings !== undefined && inputs.nightAwakenings >= 2);

  const hasCircadianFeatures =
    inputs.bedtimeWeekday &&
    inputs.waketimeWeekday &&
    inputs.desiredBedtime &&
    inputs.desiredWaketime &&
    inputs.canFallAsleepWhenDesired !== false &&
    inputs.canMaintainSleep !== false &&
    (inputs.sleepQualityWhenAsleep === undefined || inputs.sleepQualityWhenAsleep >= 6);

  if (hasInsomniaFeatures && !hasCircadianFeatures) {
    return {
      isInsomnia: true,
      isCircadian: false,
      reason: 'Dificultad para conciliar/mantener sueño incluso con oportunidad de sueño. Criterios de insomnio.',
    };
  }

  if (hasCircadianFeatures && !hasInsomniaFeatures) {
    return {
      isInsomnia: false,
      isCircadian: true,
      reason: 'Sueño de buena calidad pero desalineado con horario deseado. Trastorno circadiano.',
    };
  }

  return {
    isInsomnia: false,
    isCircadian: false,
    reason: 'Patrón no concluyente. Requiere evaluación adicional.',
  };
}

/**
 * Clasificar el trastorno circadiano específico.
 */
export function classifyCircadianDisorder(inputs: {
  bedtimeWeekday?: string; // HH:MM
  waketimeWeekday?: string; // HH:MM
  desiredBedtime?: string; // HH:MM
  desiredWaketime?: string; // HH:MM
  durationWeeks?: number;
  hasBlindness?: boolean;
  hasMultipleSleepepisodes?: boolean;
}): CircadianClassificationResult {
  // Si paciente es ciego o no tiene zeitgeber claro → Non-24
  if (inputs.hasBlindness) {
    return {
      disorder: 'non24',
      label: 'Non-24-hour Sleep-Wake Rhythm Disorder',
      criteria: ['Ceguera total o deficiencia severa de luz'],
      likelyPhase: 'Ritmo libre-corriente (~24.5h)',
      reference: 'Lockley SW et al. Lancet. 2007;369(9567):946-948.',
    };
  }

  // Si múltiples episodios de sueño dispersos → ISWRD
  if (inputs.hasMultipleSleepepisodes) {
    return {
      disorder: 'iswrd',
      label: 'Irregular Sleep-Wake Rhythm Disorder',
      criteria: ['Múltiples episodios de sueño dispersos durante 24h', 'Pérdida de consolidación'],
      likelyPhase: 'Sueño fragmentado sin patrón consolidado',
      reference: 'ICSD-3. American Academy of Sleep Medicine. 2014.',
    };
  }

  if (!inputs.bedtimeWeekday || !inputs.waketimeWeekday) {
    return {
      disorder: 'none',
      label: 'Sin trastorno circadiano evidente',
      criteria: ['Datos insuficientes'],
      likelyPhase: 'N/A',
      reference: 'N/A',
    };
  }

  const actualBedHour = parseInt(inputs.bedtimeWeekday.split(':')[0]);
  const actualWakeHour = parseInt(inputs.waketimeWeekday.split(':')[0]);
  const desiredBedHour = inputs.desiredBedtime ? parseInt(inputs.desiredBedtime.split(':')[0]) : 23;
  const desiredWakeHour = inputs.desiredWaketime ? parseInt(inputs.desiredWaketime.split(':')[0]) : 7;

  const bedtimeDelayHours = (actualBedHour - desiredBedHour + 24) % 24;
  const waketimeDelayHours = (actualWakeHour - desiredWakeHour + 24) % 24;

  // Si duerme/despierta más TARDE de lo deseado → DSWPD
  if (bedtimeDelayHours >= 2 && bedtimeDelayHours <= 11) {
    return {
      disorder: 'dswpd',
      label: 'Delayed Sleep-Wake Phase Disorder (DSWPD)',
      criteria: [
        `Hora de sueño actual: ${inputs.bedtimeWeekday} (deseado: ${inputs.desiredBedtime})`,
        `Retraso aproximado: +${Math.round(bedtimeDelayHours)} horas`,
        'Cronotipo vespertino extremo',
      ],
      likelyPhase: `Retraso de +${Math.round(bedtimeDelayHours)} a +${Math.round((bedtimeDelayHours + waketimeDelayHours) / 2)} horas`,
      reference: 'Auger RR et al. J Clin Sleep Med. 2015;11(10):1199-1236.',
    };
  }

  // Si duerme/despierta más TEMPRANO de lo deseado → ASWPD
  if (bedtimeDelayHours > 11 && bedtimeDelayHours <= 22) {
    const advanceHours = 24 - bedtimeDelayHours;
    return {
      disorder: 'aswpd',
      label: 'Advanced Sleep-Wake Phase Disorder (ASWPD)',
      criteria: [
        `Hora de sueño actual: ${inputs.bedtimeWeekday} (deseado: ${inputs.desiredBedtime})`,
        `Adelanto aproximado: -${Math.round(advanceHours)} horas`,
        'Cronotipo matinal extremo',
      ],
      likelyPhase: `Adelanto de -${Math.round(advanceHours)} a -${Math.round((advanceHours + (24 - waketimeDelayHours)) / 2)} horas`,
      reference: 'Auger RR et al. J Clin Sleep Med. 2015;11(10):1199-1236.',
    };
  }

  return {
    disorder: 'none',
    label: 'Sin trastorno circadiano',
    criteria: ['Horarios dentro de rango esperable'],
    likelyPhase: 'Ritmo circadiano alineado',
    reference: 'N/A',
  };
}

/**
 * Generar plan de tratamiento para trastorno circadiano.
 */
export function getCircadianRecommendations(
  disorder: CircadianDisorder
): CircadianTreatmentPlan {
  const plans: Record<CircadianDisorder, CircadianTreatmentPlan> = {
    dswpd: {
      disorder: 'dswpd',
      description:
        'Retraso de fase 2-3+ horas. Reloj circadiano corre más lento que período de 24h. Luz matutina es la intervención más potente.',
      lightTherapy: {
        type: 'morning light (bright light)',
        lux: 10000,
        durationMinutes: 30,
        timing: 'En el momento de despertar (o 30 min después) — ANTES de melatonina',
      },
      melatoninRegimen: {
        dosage: '0.5-3 mg (dosis bajas más efectivas que altas)',
        timing: '5-7 horas ANTES de la hora deseada de sueño',
        duration: '2-4 semanas hasta ajuste completo',
        notes: 'TIMING > DOSIS. Ejemplo: Si desea dormir a 23:00, tomar a las 16:00-18:00.',
      },
      otherInterventions: [
        'Evitar luz brillante por la tarde/noche (gafas bloqueadoras azules desde las 18:00)',
        'Mantener consistencia de horarios incluso en fines de semana',
        'Actividad física matutina (potencia efecto luz matutina)',
        'Evitar siestas',
        'Tablas de avance gradual si el cambio es muy drástico (7-10 días para ±2h)',
      ],
      expectedTimeToAdjustment: '2-4 semanas (puede ser más si retraso es muy severo)',
      reference: 'Auger RR et al. J Clin Sleep Med. 2015;11(10):1199-1236.',
    },
    aswpd: {
      disorder: 'aswpd',
      description:
        'Adelanto de fase 2-3+ horas. Reloj circadiano corre más rápido que período de 24h. Luz vespertina es la intervención clave.',
      lightTherapy: {
        type: 'evening light',
        lux: 2500, // Menos que DSWPD (evita hipersensibilidad)
        durationMinutes: 180, // 2-3 horas
        timing: '2-3 horas ANTES de la hora actual de acostarse',
      },
      melatoninRegimen: {
        dosage: '0.5-3 mg',
        timing: 'A la hora actual de acostarse (para mantener regularidad)',
        duration: 'Continua',
        notes: 'En ASWPD, melatonina sostiene fase pero no la atrasa significativamente. Luz vespertina es protagonista.',
      },
      otherInterventions: [
        'Evitar luz matutina temprana: usar cortinas oscuras (bloquea luz antes de las 7:00)',
        'Usar bloqueadores azules desde el momento de despertar (potencia efecto)',
        'Actividad social/recreación vespertina (Zeitgeber social)',
        'Comida principal a hora vespertina',
        'Ejercicio por la tarde (no matutino)',
        'Tablas de retraso gradual si es necesario',
      ],
      expectedTimeToAdjustment: '1-3 semanas (puede ser más rápido que DSWPD)',
      reference: 'Auger RR et al. J Clin Sleep Med. 2015;11(10):1199-1236.',
    },
    non24: {
      disorder: 'non24',
      description:
        'Ritmo libre-corriente (~24.5h). Sin zeitgeber claro (ej: ceguera). Duerme ~1h más tarde cada noche.',
      lightTherapy: {
        type: 'bright light (structured schedule)',
        lux: 10000,
        durationMinutes: 120, // Más tiempo que DSWPD para estimular ajuste
        timing: 'Cada día a la MISMA hora (preferentemente matutina)',
      },
      melatoninRegimen: {
        dosage: '0.5-10 mg (rango amplio)',
        timing: 'Exactamente a la misma hora cada noche (ej: 21:00)',
        duration: 'Indefinida',
        notes: 'Melatonina actúa como zeitgeber artificial. Consistencia horaria es crítica.',
      },
      otherInterventions: [
        'Tasimelteon 20mg (único fármaco específico aprobado, si disponible — requiere prescripción)',
        'Estructura de comidas a horarios fijos',
        'Estructura de actividades a horarios fijos',
        'Para ciegos: luz actínica de intensidad variable según período circadiano esperado',
        'Monitoreo con actigrafía cada 4 semanas',
      ],
      expectedTimeToAdjustment: 'Días a semanas (requiere esfuerzo mantenido)',
      reference: 'Lockley SW et al. Lancet. 2007;369(9567):946-948.',
    },
    iswrd: {
      disorder: 'iswrd',
      description:
        'Sueño irregular fragmentado en múltiples episodios durante 24h. Pérdida de consolidación circadiana.',
      lightTherapy: {
        type: 'bright light (daytime schedule)',
        lux: 10000,
        durationMinutes: 120,
        timing: 'Consistentemente entre 8:00-10:00 cada mañana',
      },
      melatoninRegimen: {
        dosage: '2-5 mg',
        timing: '20:00-21:00 (antes de hora de acostarse deseada)',
        duration: 'Continua',
        notes: 'Objetivo: consolidar sueño nocturno y vigilia diurna.',
      },
      otherInterventions: [
        'Estructura MUY consistente: despertar a la misma hora cada día',
        'Comidas a horarios fijos (desayuno, almuerzo, cena)',
        'Actividad física matutina (~30-45 min de ejercicio)',
        'Evitar siestas (incluso si somnolencia)',
        'Ambiente nocturno completamente oscuro (≤1 lux)',
        'Monitoreo con actigrafía para evaluar consolidación progresiva',
      ],
      expectedTimeToAdjustment: '4-8 semanas para consolidación notable',
      reference: 'ICSD-3. American Academy of Sleep Medicine. 2014.',
    },
    none: {
      disorder: 'none',
      description: 'Sin trastorno circadiano significativo.',
      lightTherapy: {
        type: 'none',
        lux: 0,
        durationMinutes: 0,
        timing: 'N/A',
      },
      otherInterventions: ['Mantener higiene del sueño. Monitoreo continuo.'],
      expectedTimeToAdjustment: 'N/A',
      reference: 'N/A',
    },
  };

  return plans[disorder];
}
