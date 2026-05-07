/**
 * Motor de Recomendaciones Terapéuticas — SomnoSalud
 * =====================================================
 * Genera recomendaciones basadas en evidencia según el fenotipo
 * de insomnio, comorbilidades y perfil del paciente.
 *
 * CATEGORÍAS DE RECOMENDACIÓN:
 * 1. Conductuales (siempre disponibles)
 *    - Higiene del sueño
 *    - TCC-I (Terapia Cognitivo-Conductual para Insomnio)
 *    - Técnicas de relajación
 *
 * 2. Suplementos (sujetos a safety gates)
 *    - Melatonina
 *    - Magnesio (glicinato/bisglicinato)
 *    - L-Teanina
 *    - Glicina
 *
 * NIVELES DE EVIDENCIA:
 * A = Meta-análisis / Revisión sistemática con RCTs
 * B = RCT individual o estudios de cohorte grandes
 * C = Estudios observacionales / consenso de expertos
 *
 * REFERENCIAS PRINCIPALES:
 * - TCC-I: Trauer JM et al. Ann Intern Med. 2015;163(3):191-204.
 * - Higiene sueño: Irish LA et al. J Clin Sleep Med. 2015;11(6):665-670.
 * - Relajación: Manzoni GM et al. J Clin Psychol. 2008;64(2):134-143.
 * - Melatonina: Ferracioli-Oda E et al. PLoS One. 2013;8(5):e63773.
 * - Magnesio: Abbasi B et al. J Res Med Sci. 2012;17(12):1161-1169.
 * - L-Teanina: Hidese S et al. Nutrients. 2019;11(10):2362.
 * - Glicina: Bannai M et al. Sleep Biol Rhythms. 2012;10(1):75-81.
 *
 * @version 1.0.0
 */

import type { InsomniaPhenotype } from './phenotype';

// ─── Types ──────────────────────────────────────────────────────

export type EvidenceLevel = 'A' | 'B' | 'C';
export type RecommendationCategory = 'behavioral' | 'supplement';
export type RecommendationPriority = 'primary' | 'adjunctive' | 'optional';

export interface Recommendation {
  id: string;
  name: string;
  nameEs: string;
  category: RecommendationCategory;
  priority: RecommendationPriority;
  evidenceLevel: EvidenceLevel;
  description: string;
  dosage?: string;
  timing?: string;
  duration?: string;
  contraindications: string[];
  phenotypeMatch: InsomniaPhenotype[];
  /** Si true, esta recomendación NO aplica a insomnio general — solo a
   *  indicaciones específicas (ej: melatonina solo circadiano/jetlag). */
  excludeFromInsomniaProtocol?: boolean;
  reference: string;
  marketplaceKeywords?: string[];
}

export interface RecommendationSet {
  primary: Recommendation[];
  adjunctive: Recommendation[];
  optional: Recommendation[];
  blockedRecommendations: string[];
  clinicalNote: string;
}

// ─── Base de datos de tratamientos ──────────────────────────────

const TREATMENT_DB: Recommendation[] = [
  // === CONDUCTUALES ===
  {
    id: 'sleep_hygiene',
    name: 'Sleep Hygiene Education',
    nameEs: 'Higiene del sueño',
    category: 'behavioral',
    priority: 'primary',
    evidenceLevel: 'A',
    description: 'Conjunto de hábitos y prácticas que promueven un sueño de calidad: horarios regulares, ambiente oscuro y fresco, evitar pantallas antes de dormir, limitar cafeína y alcohol.',
    duration: 'Continua (hábito permanente)',
    contraindications: [],
    phenotypeMatch: ['onset', 'maintenance', 'mixed'],
    reference: 'Irish LA et al. J Clin Sleep Med. 2015;11(6):665-670.',
  },
  {
    id: 'cbt_i',
    name: 'Cognitive Behavioral Therapy for Insomnia (CBT-I)',
    nameEs: 'Terapia Cognitivo-Conductual para Insomnio (TCC-I)',
    category: 'behavioral',
    priority: 'primary',
    evidenceLevel: 'A',
    description: 'Tratamiento de primera línea para insomnio crónico. Incluye restricción de sueño, control de estímulos, reestructuración cognitiva e higiene del sueño. Eficacia demostrada superior a farmacoterapia a largo plazo.',
    duration: '6-8 sesiones (puede ser presencial o digital)',
    contraindications: [],
    phenotypeMatch: ['onset', 'maintenance', 'mixed'],
    reference: 'Trauer JM et al. Ann Intern Med. 2015;163(3):191-204.',
  },
  {
    id: 'relaxation',
    name: 'Relaxation Techniques',
    nameEs: 'Técnicas de relajación',
    category: 'behavioral',
    priority: 'adjunctive',
    evidenceLevel: 'B',
    description: 'Relajación muscular progresiva, respiración diafragmática y/o meditación mindfulness. Especialmente útiles para insomnio de inicio con componente de ansiedad.',
    timing: '15-20 minutos antes de acostarse',
    duration: 'Práctica diaria continua',
    contraindications: [],
    phenotypeMatch: ['onset', 'mixed'],
    reference: 'Manzoni GM et al. J Clin Psychol. 2008;64(2):134-143.',
  },

  // === SUPLEMENTOS ===
  {
    id: 'melatonin',
    name: 'Melatonin',
    nameEs: 'Melatonina',
    category: 'supplement',
    priority: 'adjunctive',
    evidenceLevel: 'A',
    description: 'Hormona reguladora del ritmo circadiano. NO indicada para el tratamiento del insomnio. Su uso se reserva para: (1) adelantar el ritmo circadiano (fase de sueño retrasada) y (2) manejo del jet lag. Excepción: en mayores de 55 años, un médico puede prescribir melatonina de liberación prolongada (2 mg) a modo de prueba (Lemoine P et al. J Sleep Res. 2007;16(4):372-380).',
    dosage: '0.5-3 mg de liberación rápida (circadiano/jetlag) ó 2 mg de liberación prolongada (≥55 años, solo con prescripción médica)',
    timing: '30-60 minutos antes de la hora objetivo de sueño',
    duration: 'Circadiano: 2-4 semanas hasta ajuste. Jet lag: 3-5 días. LP ≥55 años: 13 semanas, luego reevaluar.',
    contraindications: ['anticoagulantes', 'embarazo', 'lactancia', 'enfermedades autoinmunes', 'insomnio primario (no circadiano)'],
    phenotypeMatch: ['onset', 'mixed'],
    excludeFromInsomniaProtocol: true,
    reference: 'Ferracioli-Oda E et al. PLoS One. 2013;8(5):e63773. / Lemoine P et al. J Sleep Res. 2007;16(4):372-380. / AASM Clinical Practice Guideline, Auger RR et al. J Clin Sleep Med. 2015;11(10):1199-1236.',
    marketplaceKeywords: ['melatonina', 'melatonin', 'suplemento sueño'],
  },
  {
    id: 'magnesium',
    name: 'Magnesium (Glycinate/Bisglycinate)',
    nameEs: 'Magnesio (glicinato/bisglicinato)',
    category: 'supplement',
    priority: 'adjunctive',
    evidenceLevel: 'B',
    description: 'El magnesio participa en la regulación de GABA y melatonina. La forma glicinato tiene mejor biodisponibilidad y tolerancia GI. Útil en insomnio de mantenimiento.',
    dosage: '200-400 mg de magnesio elemental',
    timing: '30-60 minutos antes de acostarse',
    duration: '8 semanas, luego reevaluar',
    contraindications: ['insuficiencia renal severa', 'embarazo'],
    phenotypeMatch: ['maintenance', 'mixed'],
    reference: 'Abbasi B et al. J Res Med Sci. 2012;17(12):1161-1169.',
    marketplaceKeywords: ['magnesio glicinato', 'magnesium glycinate', 'magnesio bisglicinato'],
  },
  {
    id: 'l_theanine',
    name: 'L-Theanine',
    nameEs: 'L-Teanina',
    category: 'supplement',
    priority: 'optional',
    evidenceLevel: 'B',
    description: 'Aminoácido del té verde que promueve relajación sin sedación. Aumenta actividad de ondas alfa. Útil cuando hay ansiedad concomitante.',
    dosage: '200-400 mg',
    timing: '30-60 minutos antes de acostarse',
    duration: '4-8 semanas',
    contraindications: ['embarazo'],
    phenotypeMatch: ['onset', 'mixed'],
    reference: 'Hidese S et al. Nutrients. 2019;11(10):2362.',
    marketplaceKeywords: ['l-teanina', 'l-theanine', 'teanina'],
  },
  {
    id: 'glycine',
    name: 'Glycine',
    nameEs: 'Glicina',
    category: 'supplement',
    priority: 'optional',
    evidenceLevel: 'B',
    description: 'Aminoácido que reduce la temperatura corporal central facilitando el inicio del sueño. Mejora calidad subjetiva de sueño.',
    dosage: '3 g',
    timing: '1 hora antes de acostarse',
    duration: '4-8 semanas',
    contraindications: ['embarazo'],
    phenotypeMatch: ['onset', 'maintenance', 'mixed'],
    reference: 'Bannai M et al. Sleep Biol Rhythms. 2012;10(1):75-81.',
    marketplaceKeywords: ['glicina', 'glycine', 'suplemento sueño'],
  },
];

// ─── Motor de recomendaciones ───────────────────────────────────

/**
 * Genera set de recomendaciones personalizadas.
 *
 * @param phenotype - Fenotipo de insomnio clasificado
 * @param blockedIds - IDs bloqueados por safety rules (ej: ['melatonin', 'ALL_SUPPLEMENTS'])
 * @param hasAnxiety - GAD-7 ≥10 o DASS-21 ansiedad moderada+
 * @param hasDepression - PHQ-9 ≥10 o DASS-21 depresión moderada+
 */
export function generateRecommendations(
  phenotype: InsomniaPhenotype,
  blockedIds: string[],
  hasAnxiety: boolean = false,
  hasDepression: boolean = false
): RecommendationSet {
  if (phenotype === 'none') {
    return {
      primary: [],
      adjunctive: [],
      optional: [],
      blockedRecommendations: [],
      clinicalNote: 'Sin insomnio clínico. No se generan recomendaciones terapéuticas específicas. Se sugiere mantener buenos hábitos de sueño.',
    };
  }

  const blockAllSupplements = blockedIds.includes('ALL_SUPPLEMENTS') || blockedIds.includes('ALL');
  const blockAll = blockedIds.includes('ALL');

  // Filtrar tratamientos aplicables
  let applicable = TREATMENT_DB.filter(t => {
    // Match por fenotipo
    if (!t.phenotypeMatch.includes(phenotype)) return false;

    // Excluir tratamientos que NO aplican al protocolo de insomnio
    // (ej: melatonina → solo circadiano/jetlag, no insomnio general)
    if (t.excludeFromInsomniaProtocol) return false;

    // Bloqueos
    if (blockAll) return false;
    if (blockAllSupplements && t.category === 'supplement') return false;
    if (blockedIds.includes(t.id)) return false;

    return true;
  });

  // Boost de relajación si hay ansiedad
  if (hasAnxiety) {
    applicable = applicable.map(t => {
      if (t.id === 'relaxation') {
        return { ...t, priority: 'primary' as RecommendationPriority };
      }
      if (t.id === 'l_theanine' && !blockAllSupplements) {
        return { ...t, priority: 'adjunctive' as RecommendationPriority };
      }
      return t;
    });
  }

  // Nota clínica sobre depresión
  const depNote = hasDepression
    ? ' Se detecta depresión moderada o mayor: la TCC-I tiene evidencia de eficacia también en depresión comórbida (Cunningham JEA, Shapiro CM. J Clin Sleep Med. 2018;14(7):1249-1258).'
    : '';

  const blocked = TREATMENT_DB
    .filter(t => blockedIds.includes(t.id) || (blockAllSupplements && t.category === 'supplement'))
    .map(t => t.nameEs);

  return {
    primary: applicable.filter(t => t.priority === 'primary'),
    adjunctive: applicable.filter(t => t.priority === 'adjunctive'),
    optional: applicable.filter(t => t.priority === 'optional'),
    blockedRecommendations: blocked,
    clinicalNote: `Recomendaciones para fenotipo "${phenotype}". ${applicable.length} intervenciones sugeridas.${depNote}${blocked.length > 0 ? ` Bloqueados por seguridad: ${blocked.join(', ')}.` : ''}`,
  };
}

// Exportar la DB para consulta
export { TREATMENT_DB };
