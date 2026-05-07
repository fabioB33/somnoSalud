/**
 * Etapas del Sueño — Moduladores y Optimización
 * ==============================================
 * Para cada etapa del sueño (N1, N2, N3/SWS, REM):
 * - Porcentaje normal
 * - Factores que la potencian (suplementos, hábitos, dispositivos, actividades)
 * - Factores que la suprimen
 * - Relevancia clínica
 *
 * ARQUITECTURA NORMAL:
 * - N1: 2-5% (transición vigilia-sueño)
 * - N2: 50-55% (sueño ligero, consolidación memoria)
 * - N3/SWS: 15-25% (sueño profundo, restauración física/cognitiva)
 * - REM: 20-25% (sueño paradójico, consolidación emocional/procedimental)
 *
 * REFERENCIAS:
 * Walker MK. Why We Sleep: Unlocking the Power of Sleep and Dreams. Scribner; 2017.
 * Dang-Vu TT, Gais S, Dang-Vu DD, et al. Generalized spike-wave discharges promote sleep
 * depth and off-line catabolism. J Neurosci. 2008;28(30):7546-7552.
 * DOI: 10.1523/JNEUROSCI.1267-08.2008
 *
 * @version 1.0.0
 */

export type SleepStage = 'N1' | 'N2' | 'N3' | 'REM';

export interface SleepStageNorms {
  stage: SleepStage;
  percentageOfTotalSleep: {
    min: number;
    max: number;
    average: number;
  };
  clinicalSignificance: string;
}

export interface SleepStageModulator {
  category: 'supplement' | 'habit' | 'device' | 'activity';
  name: string;
  dosageOrDetails: string;
  mechanism: string;
  timeOfDay?: string;
  duration?: string;
  evidence: 'strong' | 'moderate' | 'limited';
  reference: string;
}

export interface SleepStageInfo {
  stage: SleepStage;
  norms: SleepStageNorms;
  potentiators: SleepStageModulator[];
  suppressors: SleepStageModulator[];
  clinicalRelevance: {
    deficit_consequences: string[];
    excess_consequences: string[];
  };
  reference: string;
}

/**
 * Obtener información normal de una etapa de sueño.
 */
export function getSleepStageNorms(stage: SleepStage): SleepStageNorms {
  const norms: Record<SleepStage, SleepStageNorms> = {
    N1: {
      stage: 'N1',
      percentageOfTotalSleep: { min: 2, max: 5, average: 3.5 },
      clinicalSignificance:
        'Transición vigilia-sueño. Breve. >5% sugiere sueño fragmentado o insomnia.',
    },
    N2: {
      stage: 'N2',
      percentageOfTotalSleep: { min: 45, max: 55, average: 50 },
      clinicalSignificance:
        'Sueño ligero. Consolidación memoria procedueral/declarativa. Tono muscular preservado.',
    },
    N3: {
      stage: 'N3',
      percentageOfTotalSleep: { min: 15, max: 25, average: 20 },
      clinicalSignificance:
        'Sueño profundo (SWS). Restauración fisica/cognitiva. Delta waves. Crecimiento óseo/muscular.',
    },
    REM: {
      stage: 'REM',
      percentageOfTotalSleep: { min: 20, max: 25, average: 22 },
      clinicalSignificance:
        'Sueño paradójico. Consolidación emocional/memoria procedueral. Sueños vívidos. Atonía muscular.',
    },
  };
  return norms[stage];
}

/**
 * Obtener moduladores (potenciadores y supresores) de una etapa.
 */
export function getSleepStageModulators(stage: SleepStage): {
  potentiators: SleepStageModulator[];
  suppressors: SleepStageModulator[];
} {
  const modulators: Record<SleepStage, { potentiators: SleepStageModulator[]; suppressors: SleepStageModulator[] }> = {
    N1: {
      potentiators: [
        {
          category: 'habit',
          name: 'Relajación y desaceleración mental',
          dosageOrDetails: '10-20 minutos antes de dormir',
          mechanism: 'Reduce activación cortical, facilita transición a sueño',
          timeOfDay: 'Noche (prebed)',
          duration: 'Diaria',
          evidence: 'strong',
          reference: 'Trinder J et al. Sleep Med Rev. 2001;5(3):213-231.',
        },
      ],
      suppressors: [
        {
          category: 'habit',
          name: 'Estimulación mental/cognitiva',
          dosageOrDetails: 'Cualquier intensidad',
          mechanism: 'Evita transición a sueño, mantiene arousal',
          timeOfDay: 'Noche (última hora antes de dormir)',
          evidence: 'strong',
          reference: 'Hobson JA. Curr Opin Neurobiol. 1992;2(6):848-853.',
        },
        {
          category: 'habit',
          name: 'Luz azul (pantallas)',
          dosageOrDetails: 'Cualquier exposición <1h prebed',
          mechanism: 'Suprime melatonina, desplaza sleep onset',
          evidence: 'strong',
          reference: 'Chang AM et al. Proc Natl Acad Sci USA. 2015;112(1):124-129.',
        },
      ],
    },
    N2: {
      potentiators: [
        {
          category: 'activity',
          name: 'Aprendizaje motor/procedueral (antes de dormir)',
          dosageOrDetails: '30-60 minutos de práctica motora',
          mechanism: 'Activa corteza motora → demanda N2 para consolidación',
          timeOfDay: 'Tarde/noche (4-6h antes de dormir)',
          duration: 'Ocasional (durante aprendizaje)',
          evidence: 'strong',
          reference: 'Walker MK, Stickgold R. Annu Rev Neurosci. 2006;29:457-484.',
        },
        {
          category: 'device',
          name: 'tACS (Transcranial Alternating Current Stimulation)',
          dosageOrDetails: '12-15 Hz sobre área frontal',
          mechanism: 'Potencia oscilaciones sleep spindles en N2',
          timeOfDay: 'Durante sueño (requiere laboratorio sueño)',
          duration: 'Única sesión',
          evidence: 'moderate',
          reference: 'Lustenberger C et al. J Neurosci. 2016;36(27):7088-7100.',
        },
      ],
      suppressors: [
        {
          category: 'supplement',
          name: 'Alcohol',
          dosageOrDetails: 'Cualquier cantidad en noche',
          mechanism: 'Suprime N2/REM (rebrote acompañado de fragmentación)',
          evidence: 'strong',
          reference: 'Ebrahim IO et al. Sleep Med Rev. 2013;17(4):285-292.',
        },
      ],
    },
    N3: {
      potentiators: [
        {
          category: 'activity',
          name: 'Ejercicio aeróbico intenso',
          dosageOrDetails: '150+ min/semana, moderada-alta intensidad',
          mechanism: 'Aumento demanda restauración → ↑ SWS rebound',
          timeOfDay: 'Mañana/tarde (no <4h prebed)',
          duration: 'Regular (3-5x/semana)',
          evidence: 'strong',
          reference: 'Kredlow MA et al. Sleep Med Rev. 2015;24:1-12.',
        },
        {
          category: 'habit',
          name: 'Temperatura ambiental fresca',
          dosageOrDetails: '16-19°C (idealmente 18°C)',
          mechanism: 'Disminución Tcore facilita sueño profundo',
          timeOfDay: '24h',
          duration: 'Continua (noche)',
          evidence: 'strong',
          reference: 'Okamoto-Mizuno K, Mizuno K. Sleep Med Rev. 2012;16(4):415-425.',
        },
        {
          category: 'device',
          name: 'Colchón/almohada enfriada',
          dosageOrDetails: '32-35°C (OOLER, ChiliPad, etc.)',
          mechanism: 'Control de temperatura Tcore',
          timeOfDay: 'Noche (durante sueño)',
          duration: 'Continua',
          evidence: 'moderate',
          reference: 'Haghayegh S et al. Sleep Med Rev. 2019;47:60-80.',
        },
        {
          category: 'device',
          name: 'Estimulación acústica cerrada-loop',
          dosageOrDetails: 'Sonidos (<50dB) sincronizados con slow waves',
          mechanism: 'Amplifica oscilaciones SWS',
          timeOfDay: 'Durante N3',
          duration: 'Única sesión (laboratorio)',
          evidence: 'moderate',
          reference: 'Ngo HV et al. Nat Neurosci. 2013;16(11):1537-1544.',
        },
        {
          category: 'supplement',
          name: 'Glicina',
          dosageOrDetails: '3 g (dosis única)',
          mechanism: 'Agonista GlyR → ↓ Tcore, ↑ SWS',
          timeOfDay: '30-60 min prebed',
          duration: 'Nightly',
          evidence: 'moderate',
          reference: 'Bannai M et al. Sleep Biol Rhythms. 2012;10(1):75-81.',
        },
        {
          category: 'supplement',
          name: 'Magnesio glicinato',
          dosageOrDetails: '200-400 mg (Mg elemental)',
          mechanism: 'GABA modulation, ↑ SWS',
          timeOfDay: '30-60 min prebed',
          duration: 'Nightly',
          evidence: 'moderate',
          reference: 'Abbasi B et al. J Res Med Sci. 2012;17(12):1161-1169.',
        },
        {
          category: 'device',
          name: 'tDCS (Transcranial Direct Current Stimulation)',
          dosageOrDetails: '2mA anodal sobre área motor M1',
          mechanism: 'Depolariza neuronal, ↑ actividad delta',
          timeOfDay: 'Durante N3 (requiere laboratorio)',
          duration: 'Única sesión',
          evidence: 'limited',
          reference: 'Marshall L et al. Nat Neurosci. 2004;7(4):356-357.',
        },
      ],
      suppressors: [
        {
          category: 'habit',
          name: 'Privación de sueño',
          dosageOrDetails: 'Cualquier duración de privación',
          mechanism: 'Dormir demasiado poco → ↓ SWS (no hay demanda)',
          evidence: 'strong',
          reference: 'Walker MK. Why We Sleep. 2017.',
        },
        {
          category: 'habit',
          name: 'Calor ambiental',
          dosageOrDetails: '>22°C',
          mechanism: 'Aumento Tcore → suprime SWS',
          evidence: 'strong',
          reference: 'Okamoto-Mizuno K et al. Sleep. 2003;26(4):421-425.',
        },
        {
          category: 'habit',
          name: 'Cafeína',
          dosageOrDetails: 'Cualquier cantidad',
          mechanism: 'Bloqueo adenosina A1/A2a → reduce presión de sueño profundo',
          timeOfDay: '<6h prebed',
          evidence: 'strong',
          reference: 'Drake C et al. J Clin Sleep Med. 2013;9(11):1195-1200.',
        },
      ],
    },
    REM: {
      potentiators: [
        {
          category: 'habit',
          name: 'Extensión de tiempo en cama (sleep extension)',
          dosageOrDetails: '9+ horas de TIB',
          mechanism: 'REM predomina en última mitad de sueño → más TIB = más REM',
          timeOfDay: 'Noche (dormir más)',
          duration: '2-3 noches',
          evidence: 'strong',
          reference: 'Walker MK et al. J Neurosci. 2002;22(20):8807-8814.',
        },
        {
          category: 'supplement',
          name: 'Vitamina B6 (piridoxina)',
          dosageOrDetails: '240 mg (dosis altas para sueños vívidos)',
          mechanism: 'Aumento serotonina, potencia REM/sueños',
          timeOfDay: '30-60 min prebed',
          duration: '1-2 semanas (efecto limitado)',
          evidence: 'limited',
          reference: 'Aspy DJ et al. Percept Mot Skills. 2018;125(1):147-155.',
        },
      ],
      suppressors: [
        {
          category: 'supplement',
          name: 'Alcohol',
          dosageOrDetails: 'Cualquier cantidad',
          mechanism: 'Suprime REM primeras 4-5h, rebrote tardío → fragmentación',
          evidence: 'strong',
          reference: 'Ebrahim IO et al. Sleep Med Rev. 2013;17(4):285-292.',
        },
        {
          category: 'supplement',
          name: 'SSRIs/SNRIs',
          dosageOrDetails: 'Dosis terapéuticas',
          mechanism: 'Antagonismo receptores REM → supresión REM (paradoja terapéutica)',
          evidence: 'strong',
          reference: 'Riemann D et al. Nat Rev Dis Primers. 2020;6(1):9.',
        },
        {
          category: 'habit',
          name: 'Privación de sueño REM (rebote)',
          dosageOrDetails: 'Despertar selectivo durante REM',
          mechanism: 'Compensación: REM rebound en sueños posteriores',
          evidence: 'strong',
          reference: 'Dement W. Psychol Rev. 1960;67(6):500-526.',
        },
      ],
    },
  };

  return modulators[stage];
}

/**
 * Información completa de una etapa de sueño.
 */
export function getSleepStageInfo(stage: SleepStage): SleepStageInfo {
  const norms = getSleepStageNorms(stage);
  const { potentiators, suppressors } = getSleepStageModulators(stage);

  const clinicalRelevance: Record<SleepStage, { deficit_consequences: string[]; excess_consequences: string[] }> = {
    N1: {
      deficit_consequences: ['Dificultad para transición a sueño', 'Mayor arousal nocturno'],
      excess_consequences: ['Sueño fragmentado', 'Insomnia (mucha N1 en vez de N2/N3)'],
    },
    N2: {
      deficit_consequences: ['Memoria procedueral débil', 'Consolidación cognitiva reducida'],
      excess_consequences: ['Poco sueño profundo/restorador', 'Fatiga persistente'],
    },
    N3: {
      deficit_consequences: [
        'Fatiga física/cognitiva',
        'Recuperación lenta de ejercicio',
        'Mayor inflamación',
        'Inmunidad debilitada',
      ],
      excess_consequences: ['Inusual en adultos jóvenes (sugiere sleep debt)'],
    },
    REM: {
      deficit_consequences: [
        'Memoria emocional pobre',
        'Regulación emocional alterada',
        'Creatividad reducida',
        'Riesgo depresión',
      ],
      excess_consequences: ['Pesadillas frecuentes (REM mayormente REM)', 'Vigilia con alucinaciones'],
    },
  };

  const refs: Record<SleepStage, string> = {
    N1: 'Trinder J et al. Sleep Med Rev. 2001;5(3):213-231.',
    N2: 'Walker MK, Stickgold R. Annu Rev Neurosci. 2006;29:457-484.',
    N3: 'Dang-Vu TT et al. J Neurosci. 2008;28(30):7546-7552.',
    REM: 'Hobson JA. Curr Opin Neurobiol. 1992;2(6):848-853.',
  };

  return {
    stage,
    norms,
    potentiators,
    suppressors,
    clinicalRelevance: clinicalRelevance[stage],
    reference: refs[stage],
  };
}
