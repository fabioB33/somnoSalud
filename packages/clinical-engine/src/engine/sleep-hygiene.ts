/**
 * Higiene del Sueño — 13 Intervenciones Basadas en Evidencia
 * ============================================================
 * Compilación de 13 intervenciones recomendadas por Irish et al. 2015
 * y guidelines AASM.
 *
 * NOTA CRÍTICA (AASM 2017):
 * "Higiene del sueño sola NO es tratamiento efectivo para insomnio crónico.
 * Pero es COMPONENTE ESENCIAL de cualquier protocolo multifactorial."
 * Cuando se usa aislada, tiene efecto pequeño (0.16 effect size).
 * Combinada con CBT-I, muy efectiva.
 *
 * REFERENCES:
 * Irish LA, Kline CE, Gunn HE, Buysse DJ, Hall MH. The role of sleep hygiene
 * in promoting public health. J Public Health Manag Pract. 2014;20(2):220-226.
 * DOI: 10.1097/PHH.0000000000000018
 *
 * Huang Z, Liu Y, Yu Y, et al. Sleep irregularity and metabolic dysfunction:
 * meta-analysis. Sleep Med Rev. 2020;51:101274.
 *
 * Kredlow MA, Capozzoli MC, Hearon BA, et al. The effects of physical activity
 * on sleep quality: a systematic review. Sleep Med Rev. 2015;24:1-12.
 *
 * @version 1.0.0
 */

export interface SleepHygieneRecommendation {
  number: number;
  intervention: string;
  nameEs: string;
  description: string;
  mechanism: string;
  implementation: string;
  frequency?: string;
  evidence: 'strong' | 'moderate' | 'limited';
  reference: string;
}

export interface SleepHygieneAssessment {
  recommendations: SleepHygieneRecommendation[];
  complianceLevel: 'high' | 'moderate' | 'low';
  complianceScore: number; // 0-100
  prioritizedInterventions: number[]; // intervention numbers to prioritize
  generalNote: string;
  reference: string;
}

/**
 * Obtener las 13 intervenciones de higiene del sueño.
 */
export function getSleepHygieneRecommendations(): SleepHygieneRecommendation[] {
  return [
    {
      number: 1,
      intervention: 'Regular Sleep-Wake Schedule',
      nameEs: 'Horarios regulares de sueño-vigilia',
      description: 'Acostarse y levantarse a la misma hora cada día (incluso fines de semana).',
      mechanism:
        'Regulariza el ritmo circadiano. Zeitgeber social/ambiental ancla el reloj interno a ciclo 24h.',
      implementation: 'Fijar bedtime y waketime. Variación máxima: ±30 min. Aplicar consistencia >2 semanas.',
      frequency: 'Diaria (7 días/semana)',
      evidence: 'strong',
      reference: 'Huang Z et al. Sci Rep. 2020;10:840. DOI: 10.1038/s41598-020-57620-8',
    },
    {
      number: 2,
      intervention: 'Restrict Time in Bed to Actual Sleep',
      nameEs: 'Restringir el tiempo en cama al tiempo de sueño real',
      description: 'Si pasa 8h en cama pero duerme 6h, reducir TIB a 6.5h hasta lograr eficiencia >85%.',
      mechanism:
        'Presión de sueño (homeostasis): menos tiempo disponible → sueño más consolidado. Base de Sleep Restriction Therapy (Spielman).',
      implementation:
        'TST / TIB ×100 = SE%. Si SE <85%, ↓ TIB en 30 min cada semana hasta SE >85%. Mínimo 5h TIB.',
      frequency: 'Diaria',
      evidence: 'strong',
      reference: 'Spielman AJ et al. Psychosom Med. 1987;49(4):405-421.',
    },
    {
      number: 3,
      intervention: 'Aerobic Exercise ≥150 min/week',
      nameEs: 'Ejercicio aeróbico ≥150 min/semana',
      description: 'Actividad cardiovascular moderada-vigorosa (caminar rápido, correr, ciclismo, natación).',
      mechanism:
        'Aumenta presión de sueño, mejora calidad SWS, regula ritmo circadiano, ↓ ansiedad. TIMING: no <3h prebed.',
      implementation: '30 min × 5 días/semana. O 20 min intenso × 3 días. Aeróbico puro (no resistencia sola).',
      frequency: '5-7 días/semana',
      evidence: 'strong',
      reference: 'Kredlow MA et al. Sleep Med Rev. 2015;24:1-12.',
    },
    {
      number: 4,
      intervention: 'Cool Room Temperature (18-20°C)',
      nameEs: 'Temperatura de habitación fresca (18-20°C)',
      description: 'Ambiento dormitorio entre 18-20°C (65-68°F). Ideal: 18°C.',
      mechanism: 'Descenso Tcore facilita inicio sueño. Temperatura elevada = latencia prolongada.',
      implementation: 'Ajustar termostato. Ropa de cama apropiada (duvets regulables). Máx 1-2 noches adaptación.',
      frequency: 'Nightly',
      evidence: 'strong',
      reference: 'Okamoto-Mizuno K, Mizuno K. Sleep Med Rev. 2012;16(4):415-425.',
    },
    {
      number: 5,
      intervention: 'Avoid Caffeine ≥6 hours Before Bed',
      nameEs: 'Evitar cafeína ≥6h antes de acostarse',
      description: 'Cafeína tiene vida media 5-6h. Consumo post-14:00 interfiere con sueño nocturno.',
      mechanism: 'Antagonismo adenosina A1/A2a → ↓ presión de sueño, latencia prolongada.',
      implementation:
        'Última taza café antes de las 14:00 (2pm). Incluir té, chocolate, bebidas cola, pre-entrenamiento.',
      frequency: 'Diaria',
      evidence: 'strong',
      reference: 'Drake C et al. J Clin Sleep Med. 2013;9(11):1195-1200.',
    },
    {
      number: 6,
      intervention: 'Avoid Alcohol ≥4 hours Before Bed',
      nameEs: 'Evitar alcohol ≥4h antes de acostarse',
      description: 'Alcohol fragmenta sueño REM/NREM, causa despertares, reduce calidad global.',
      mechanism:
        'Metabolismo alcohólico causa rebrote REM (2-3h post-alcohol) → desperares. Suprime SWS inicial.',
      implementation: 'Si consume, última bebida >4h prebed. Ideal: eliminar alcohol completamente.',
      frequency: 'Diaria',
      evidence: 'strong',
      reference: 'Ebrahim IO et al. Sleep Med Rev. 2013;17(4):285-292.',
    },
    {
      number: 7,
      intervention: 'Restrict Artificial Light ≥2h Before Bed',
      nameEs: 'Restringir luz artificial ≥2h antes de acostarse',
      description: 'Luz azul (<50 lux) 2h antes de dormir. Apagar pantallas, lámparas brillantes.',
      mechanism:
        'Luz azul suprime melatonina vía ganglion retinal RGC-ipRGC. Desplaza sleep onset 1-2h.',
      implementation:
        'Usar gafas bloqueadoras azules a partir de las 20:00 (si bedtime 22:00). O: eliminar pantallas/TV.',
      frequency: 'Nightly',
      evidence: 'strong',
      reference: 'Chang AM et al. Proc Natl Acad Sci USA. 2015;112(1):124-129.',
    },
    {
      number: 8,
      intervention: 'Morning Bright Light Exposure',
      nameEs: 'Exposición a luz brillante por la mañana',
      description: 'Luz brillante >1000 lux (idealmente 5000-10000) en primera 30 min después de despertar.',
      mechanism: 'Phase-shifting: ancora ritmo circadiano a ciclo 24h. Mejora regulación sueño-vigilia.',
      implementation:
        'Ventanas abiertas o luz SAD 10000 lux × 30 min. Timing crucial: primeros 30-60 min post-waketime.',
      frequency: 'Diaria (especialmente útil en invierno/depresión estacional)',
      evidence: 'strong',
      reference: 'Figueiro MG, Rea MS. Sleep Health. 2016;2(3):166-171.',
    },
    {
      number: 9,
      intervention: 'Warm Bath 40-42°C Before Bed',
      nameEs: 'Baño/ducha caliente 40-42°C antes de dormir',
      description: '30-120 minutos antes de acostarse. Temperatura agua 40-42°C (105-107°F).',
      mechanism:
        'Vasodilatación periférica → flujo sanguíneo piel ↑ → Tcore disminuye. Paradoja: calor INICIAL facilita después descenso.',
      implementation: 'Ducha/baño 10-20 min. Temperatura 40-42°C. Timing: 60-120 min prebed (para que Tcore baje).',
      frequency: 'Nightly (o 3-4 noches/semana mínimo)',
      evidence: 'strong',
      reference: 'Haghayegh S et al. Sleep Med Rev. 2019;47:60-80.',
    },
    {
      number: 10,
      intervention: 'Avoid Nicotine Before Bed',
      nameEs: 'Evitar nicotina antes de acostarse',
      description: 'Nicotina es estimulante. Evitar cigarrillos, vape, nicotina oral ≥4h prebed.',
      mechanism: 'Agonista nicotínico acetilcolina → arousal, latencia prolongada, sueño fragmentado.',
      implementation: 'Última exposición nicotina antes de las 18:00-19:00 (si bedtime 22:00-23:00).',
      frequency: 'Diaria',
      evidence: 'moderate',
      reference: 'Zhang L et al. Sleep Med Rev. 2006;10(5):323-337.',
    },
    {
      number: 11,
      intervention: 'Dark and Quiet Environment',
      nameEs: 'Ambiente oscuro y silencioso',
      description: 'Dormitorio completamente oscuro (<1 lux). Ruido máximo 30 dB (silencio background).',
      mechanism:
        'Oscuridad → melatonina no suprimida. Silencio → evita microdespertares. Ambos optimizan arquitectura sueño.',
      implementation:
        'Blackout curtains, antifaz si es necesario. Tapones auditivos si ruido externo. Temperatura de habitación constante.',
      frequency: 'Nightly',
      evidence: 'strong',
      reference: 'Hu RF et al. Crit Care Nurs Q. 2015;38(2):183-189.',
    },
    {
      number: 12,
      intervention: 'Avoid Heavy Meals <3h Before Bed',
      nameEs: 'Evitar comidas pesadas <3h antes de acostarse',
      description: 'Comidas copiosas, grasosas, especiadas interfieren con sueño.',
      mechanism:
        'Digestión activa → arousal parasimpático. GERD nocturno si posturas supinas. Glucosa post-comida empeora latencia.',
      implementation:
        'Última comida principal 3h prebed. Snacks ligeros (yogur, fruta) OK si necesario. Agua sí, café/alcohol no.',
      frequency: 'Nightly',
      evidence: 'moderate',
      reference: 'Crispim CA et al. Sleep Health. 2011;34(4):461-467.',
    },
    {
      number: 13,
      intervention: 'Use Bed Only for Sleep and Sex',
      nameEs: 'Usar la cama solo para sueño y sexo',
      description: 'NO trabajo, NO TV, NO estudiar EN CAMA. Asociación cama-sueño crítica.',
      mechanism:
        'Stimulus Control (Bootzin 1972): cama = solo sueño. Otros estímulos (luz TV, estrés laboral) crean asociaciones ansiógenas.',
      implementation:
        'Si despierta >15-20 min, SALIR de cama. Ir a otra habitación, actividad relajante, volver cuando somnolencia.',
      frequency: 'Nightly',
      evidence: 'strong',
      reference: 'Bootzin RR, Epstein D. Cognit Behav Pract. 2011;18(4):553-562.',
    },
  ];
}

/**
 * Evaluar cumplimiento de higiene del sueño.
 */
export function assessSleepHygieneCompliance(inputs: {
  regularSchedule?: boolean;
  restrictedTIB?: boolean;
  exerciseFrequency?: number; // veces/semana
  roomTemperature?: number; // °C
  noCaffeineAfter?: number; // hora (0-23)
  noAlcoholPrebed?: boolean;
  limitScreensBeforeBed?: boolean;
  morningLightExposure?: boolean;
  warmBathPrebed?: boolean;
  noNicotinePrebed?: boolean;
  darkQuietRoom?: boolean;
  noHeavyMealsPrebed?: boolean;
  bedUsageStrictly?: boolean;
}): SleepHygieneAssessment {
  const allRecommendations = getSleepHygieneRecommendations();

  let complianceScore = 0;
  const prioritized: number[] = [];

  // Evaluar cada intervención
  if (inputs.regularSchedule === true) complianceScore += 8;
  else prioritized.push(1);

  if (inputs.restrictedTIB === true) complianceScore += 8;
  else prioritized.push(2);

  if ((inputs.exerciseFrequency ?? 0) >= 5) complianceScore += 8;
  else prioritized.push(3);

  if ((inputs.roomTemperature ?? 25) >= 18 && (inputs.roomTemperature ?? 25) <= 20)
    complianceScore += 7;
  else prioritized.push(4);

  if ((inputs.noCaffeineAfter ?? 0) <= 14) complianceScore += 7;
  else prioritized.push(5);

  if (inputs.noAlcoholPrebed === true) complianceScore += 7;
  else prioritized.push(6);

  if (inputs.limitScreensBeforeBed === true) complianceScore += 8;
  else prioritized.push(7);

  if (inputs.morningLightExposure === true) complianceScore += 7;
  else prioritized.push(8);

  if (inputs.warmBathPrebed === true) complianceScore += 6;
  else prioritized.push(9);

  if (inputs.noNicotinePrebed === true) complianceScore += 6;
  else prioritized.push(10);

  if (inputs.darkQuietRoom === true) complianceScore += 8;
  else prioritized.push(11);

  if (inputs.noHeavyMealsPrebed === true) complianceScore += 6;
  else prioritized.push(12);

  if (inputs.bedUsageStrictly === true) complianceScore += 8;
  else prioritized.push(13);

  let complianceLevel: 'high' | 'moderate' | 'low';
  if (complianceScore >= 80) {
    complianceLevel = 'high';
  } else if (complianceScore >= 50) {
    complianceLevel = 'moderate';
  } else {
    complianceLevel = 'low';
  }

  const generalNote =
    complianceLevel === 'high'
      ? 'Excelente cumplimiento de higiene. Si insomnio persiste, considerar CBT-I estructurada (restricción sueño, reestructuración cognitiva, mindfulness).'
      : complianceLevel === 'moderate'
        ? 'Cumplimiento moderado. Priorizar intervenciones faltantes: especialmente horarios regulares, restricción TIB y luz azul. Combinar con CBT-I si insomnio severo.'
        : 'Cumplimiento bajo. Higiene del sueño sola es INSUFICIENTE. Necesario: CBT-I estructurada + terapia psicológica si comorbididades (ansiedad, depresión).';

  return {
    recommendations: allRecommendations,
    complianceLevel,
    complianceScore,
    prioritizedInterventions: prioritized,
    generalNote,
    reference: 'Irish LA et al. J Public Health Manag Pract. 2014;20(2):220-226. / AASM Guidelines 2017.',
  };
}
