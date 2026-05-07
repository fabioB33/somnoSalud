/**
 * Narcolepsia — Screening y Recomendaciones No-Farmacológicas
 * =============================================================
 * Algoritmo para screening de narcolepsia y manejo conductual
 * sin medicamentos.
 *
 * NARCOLEPSIA TIPO 1 (con cataplejía):
 * - Deficiencia de orexina (hipocretina) en CSF (<110 pg/mL)
 * - Excesiva somnolencia diurna (ESS ≥15)
 * - Cataplejía: pérdida tono muscular breve (segundos-minutos)
 * - MSLT (Multiple Sleep Latency Test) diagnóstico: latencia media <8 min, ≥2 SOREMs
 *
 * NARCOLEPSIA TIPO 2 (sin cataplejía):
 * - Orexina normal o borderline
 * - ESS elevada
 * - MSLT similar pero sin cataplejía
 *
 * MANEJO NO-FARMACOLÓGICO:
 * - Siestas cortas (15-20 min, 2-3/día) potencian estado de alerta
 * - Horarios de sueño regulares (SUPER importante)
 * - Evitar alcohol y sedantes
 * - Evitar comidas pesadas (triggering factor)
 * - Ejercicio regular pero no exhaustivo
 *
 * REFERENCIA PRINCIPAL:
 * Mullington JM, Broughton R. Scheduled naps in the management of daytime sleepiness
 * in narcolepsy-cataplexy. Sleep. 1994;17(8 Suppl):S52-S55. PMID: 7701205
 *
 * @version 1.0.0
 */

export type NarcolepsyType = 'type1_with_cataplexy' | 'type2_without_cataplexy' | 'suspected' | 'unlikely' | 'unknown';

export interface NarcolepsyScreeningResult {
  likelihood: NarcolepsyType;
  essScore: number;
  hasCataplexySuspicion: boolean;
  recommendedNextSteps: string[];
  reference: string;
}

export interface NarcolepsyNonPharmRecommendations {
  type: NarcolepsyType;
  scheduledNaps: {
    durationMinutes: number;
    frequencyPerDay: number;
    timing: string;
    purpose: string;
  };
  behaviors: string[];
  avoidances: string[];
  lifeStyleOptimizations: string[];
  reference: string;
}

/**
 * Screening inicial de narcolepsia.
 * Si ESS ≥15 + sospechas de cataplejía → MSLT urgente.
 */
export function screenNarcolepsy(inputs: {
  essTotal: number;
  excessiveDaytimeSleepiness: boolean;
  episodesOfSuddenMuscleWeakness?: boolean;
  cataplexyDescription?: string;
  hypnagogicHallucinations?: boolean;
  sleepParalysis?: boolean;
  durationSymptoms?: string;
}): NarcolepsyScreeningResult {
  const nextSteps: string[] = [];

  // Red flags
  const hasSuspiciousCataplexy = inputs.episodesOfSuddenMuscleWeakness === true;
  const hasHallucinations = inputs.hypnagogicHallucinations === true;
  const hasSleepParalysis = inputs.sleepParalysis === true;

  // ESS ≥15 es marker principal
  const isESSHigh = inputs.essTotal >= 15;

  let likelihood: NarcolepsyType = 'unlikely';

  if (isESSHigh && (hasSuspiciousCataplexy || (hasHallucinations && hasSleepParalysis))) {
    likelihood = 'type1_with_cataplexy';
    nextSteps.push(
      'URGENTE: Referir neuroimmunología para orexina en CSF + MSLT (diagnóstico confirma tipo 1)'
    );
    nextSteps.push('Suspender alcohol completamente');
    nextSteps.push('Iniciar programa siestas estructuradas (15-20 min × 2-3/día)');
  } else if (isESSHigh && !hasSuspiciousCataplexy && (hasHallucinations || hasSleepParalysis)) {
    likelihood = 'type2_without_cataplexy';
    nextSteps.push(
      'Probable narcolepsia tipo 2: MSLT para confirmar (latencia <8 min, ≥2 SOREMs sin cataplejía)'
    );
    nextSteps.push('Programa siestas 15-20 min × 2-3/día');
  } else if (isESSHigh && inputs.excessiveDaytimeSleepiness) {
    likelihood = 'suspected';
    nextSteps.push(
      'Somnolencia excesiva significativa: Descartar apnea (STOP-BANG), depresión (PHQ-9), otro trastorno del sueño'
    );
    nextSteps.push('Si persiste tras investigación: MSLT');
  } else {
    likelihood = 'unlikely';
    nextSteps.push('ESS <15. Evaluar otro trastorno del sueño o somnolencia secundaria.');
  }

  return {
    likelihood,
    essScore: inputs.essTotal,
    hasCataplexySuspicion: hasSuspiciousCataplexy,
    recommendedNextSteps: nextSteps,
    reference: 'American Academy of Sleep Medicine. International Classification of Sleep Disorders. 3rd ed. (ICSD-3). 2014.',
  };
}

/**
 * Recomendaciones no-farmacológicas para narcolepsia confirmada.
 */
export function getNarcolepsyNonPharmRecommendations(
  type: NarcolepsyType
): NarcolepsyNonPharmRecommendations {
  // Siestas estructuradas Mullington & Broughton 1994
  const scheduledNaps = {
    durationMinutes: 15, // ±5 min, no >20 (riesgo inercia del sueño)
    frequencyPerDay: 2, // o 3 si severidad alta
    timing: 'Mid-morning (~10:00) y early afternoon (~14:00). Evitar última siesta <6h prebed.',
    purpose:
      'Recuperación homeostática focal. Siestas cortas mejoran alerta 1-2h. Mejor que cafeína sin dependencia.',
  };

  return {
    type,
    scheduledNaps,
    behaviors: [
      'Consistencia ABSOLUTA de horarios sueño-vigilia (incluso fines de semana)',
      'Dormir 7-9h cada noche (base sólida)',
      'Siestas estructuradas: 15-20 min × 2-3/día (timing consistente)',
      'Evitar conducción >2h sin pausa/siesta',
      'Avisar a empleador/escuela: documentar narcolepsia (ajustes razonables)',
      'Registrar síntomas en diario: cataplejía, siestas, EDS progresión',
    ],
    avoidances: [
      'ALCOHOL: Precipita cataplejía, fragmenta sueño nocturno',
      'SEDANTES/HIPNÓTICOS: Agravan fragmentación, no indicados',
      'Comidas pesadas (especialmente carb altos): triggering para somnolencia',
      'Conducción en horas de riesgo (2-4pm, post-lunch dip)',
      'Estrés emocional: trigger de cataplejía',
    ],
    lifeStyleOptimizations: [
      'Ejercicio regular (200-300 min/semana): mejora calidad sueño nocturno',
      'NO ejercicio exhaustivo: empeora fatiga',
      'Luz matutina 30+ min: regulariza ritmo circadiano',
      'Grupo de soporte (narcolepsy associations): crucial para coping',
      'Evaluación psicológica: aceptación diagnóstico, manejo vida social',
      'Adaptación laboral: flexibilidad horarios, acceso siestas',
    ],
    reference: 'Mullington JM, Broughton R. Sleep. 1994;17(8 Suppl):S52-S55. PMID: 7701205',
  };
}
