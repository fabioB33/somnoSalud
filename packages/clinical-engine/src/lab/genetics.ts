/**
 * Análisis de Variantes Genéticas — SomnoSalud
 * ================================================
 * Evaluación de polimorfismos genéticos relevantes para
 * cronobiología y respuesta a tratamientos del sueño.
 *
 * VARIANTES ANALIZADAS:
 *
 * 1. CLOCK 3111T/C (rs1801260)
 *    - Polimorfismo en el gen reloj circadiano principal
 *    - Alelo C: tendencia a vespertinidad (nocturnidad)
 *    - Ref: Katzenberg D et al. Sleep. 1998;21(6):569-576.
 *
 * 2. PER2 (rs2304672)
 *    - Gen período circadiano 2
 *    - Variante G: asociada a síndrome de fase avanzada del sueño
 *    - Ref: Toh KL et al. Science. 2001;291(5506):1040-1043.
 *
 * 3. ADORA2A (rs5751876)
 *    - Receptor de adenosina A2A
 *    - Alelo T: mayor sensibilidad a cafeína, peor sueño con cafeína
 *    - Ref: Rétey JV et al. Proc Natl Acad Sci. 2007;104(7):2699-2704.
 *
 * 4. COMT Val158Met (rs4680)
 *    - Catecol-O-metiltransferasa
 *    - Met/Met: degradación lenta de catecolaminas, mayor ansiedad,
 *      posible beneficio de magnesio
 *    - Ref: Lotta T et al. Biochemistry. 1995;34(13):4202-4210.
 *
 * 5. MTHFR C677T (rs1801133)
 *    - Metilentetrahidrofolato reductasa
 *    - T/T: actividad reducida, puede afectar síntesis de
 *      neurotransmisores (serotonina, melatonina)
 *    - Ref: Frosst P et al. Nat Genet. 1995;10(1):111-113.
 *
 * NOTA IMPORTANTE:
 * Los datos genéticos son informativos y complementarios.
 * No determinan diagnóstico ni tratamiento por sí solos.
 * Las recomendaciones basadas en genética tienen nivel de
 * evidencia C (observacional/consenso).
 *
 * @version 1.0.0
 */

// ─── Types ──────────────────────────────────────────────────────

export type Genotype = string; // ej: 'T/T', 'T/C', 'C/C'
export type GeneticImpact = 'significant' | 'moderate' | 'neutral';

export interface GeneVariant {
  gene: string;
  rsId: string;
  genotype: Genotype;
  impact: GeneticImpact;
  impactLabel: string;
  interpretation: string;
  clinicalImplication: string;
  reference: string;
}

export interface GeneticProfile {
  variants: GeneVariant[];
  chronotypeInfluence: string;
  caffeineAdvice: string;
  supplementNotes: string[];
  summary: string;
}

// ─── Definiciones de variantes ──────────────────────────────────

interface VariantDef {
  gene: string;
  rsId: string;
  genotypeInterpretations: Record<string, {
    impact: GeneticImpact;
    label: string;
    interpretation: string;
    implication: string;
  }>;
  reference: string;
}

const VARIANT_DEFS: Record<string, VariantDef> = {
  CLOCK: {
    gene: 'CLOCK',
    rsId: 'rs1801260',
    genotypeInterpretations: {
      'T/T': {
        impact: 'neutral',
        label: 'Sin efecto significativo',
        interpretation: 'Genotipo más común. Sin tendencia particular hacia vespertinidad.',
        implication: 'Cronotipo probablemente determinado por otros factores.',
      },
      'T/C': {
        impact: 'moderate',
        label: 'Tendencia a vespertinidad leve',
        interpretation: 'Portador heterocigoto del alelo C. Posible tendencia a acostarse más tarde.',
        implication: 'Considerar horarios de sueño flexibles. La melatonina exógena puede ser especialmente útil para adelantar fase.',
      },
      'C/C': {
        impact: 'significant',
        label: 'Cronotipo vespertino marcado',
        interpretation: 'Homocigoto para alelo C. Fuerte tendencia a ser "búho" (vespertino). Dificultad para dormirse temprano.',
        implication: 'Melatonina exógena en dosis baja 3-4h antes del horario deseado de sueño. Terapia de luz matutina. Evitar exigir horarios muy matutinos.',
      },
    },
    reference: 'Katzenberg D et al. Sleep. 1998;21(6):569-576.',
  },
  PER2: {
    gene: 'PER2',
    rsId: 'rs2304672',
    genotypeInterpretations: {
      'C/C': {
        impact: 'neutral',
        label: 'Sin efecto significativo',
        interpretation: 'Genotipo más común. Fase de sueño normal.',
        implication: 'Sin implicaciones cronobiológicas específicas.',
      },
      'C/G': {
        impact: 'moderate',
        label: 'Posible tendencia a matutinidad',
        interpretation: 'Portador heterocigoto. Posible tendencia a despertarse temprano.',
        implication: 'Monitorear despertar precoz matutino como patrón de mantenimiento.',
      },
      'G/G': {
        impact: 'significant',
        label: 'Síndrome de fase avanzada',
        interpretation: 'Homocigoto para variante asociada a fase avanzada. Tendencia a dormirse y despertarse muy temprano.',
        implication: 'Terapia de luz vespertina. Evitar luz azul matutina. Melatonina matutina cronobiológica (off-label, solo bajo supervisión).',
      },
    },
    reference: 'Toh KL et al. Science. 2001;291(5506):1040-1043.',
  },
  ADORA2A: {
    gene: 'ADORA2A',
    rsId: 'rs5751876',
    genotypeInterpretations: {
      'C/C': {
        impact: 'neutral',
        label: 'Sensibilidad normal a cafeína',
        interpretation: 'Metabolismo y respuesta a cafeína estándar.',
        implication: 'Recomendación estándar: evitar cafeína 6-8h antes de acostarse.',
      },
      'C/T': {
        impact: 'moderate',
        label: 'Sensibilidad aumentada a cafeína',
        interpretation: 'Portador heterocigoto. Mayor disrución del sueño por cafeína.',
        implication: 'Cortar cafeína al menos 8-10h antes de acostarse. Limitar a 1-2 tazas matutinas.',
      },
      'T/T': {
        impact: 'significant',
        label: 'Alta sensibilidad a cafeína',
        interpretation: 'Homocigoto T. La cafeína afecta significativamente la calidad y latencia del sueño.',
        implication: 'Considerar eliminación completa de cafeína o limitarla estrictamente a las mañanas (antes de 10:00). Pequeñas cantidades pueden causar insomnio.',
      },
    },
    reference: 'Rétey JV et al. Proc Natl Acad Sci. 2007;104(7):2699-2704.',
  },
  COMT: {
    gene: 'COMT',
    rsId: 'rs4680',
    genotypeInterpretations: {
      'Val/Val': {
        impact: 'neutral',
        label: 'Degradación rápida de catecolaminas',
        interpretation: 'Actividad alta de COMT. Menor tendencia a ansiedad por acumulación de catecolaminas.',
        implication: 'Menor beneficio esperado del magnesio para ansiedad nocturna.',
      },
      'Val/Met': {
        impact: 'moderate',
        label: 'Actividad intermedia de COMT',
        interpretation: 'Actividad intermedia. Perfil equilibrado.',
        implication: 'Puede beneficiarse de técnicas de relajación. Magnesio puede ser útil como coadyuvante.',
      },
      'Met/Met': {
        impact: 'significant',
        label: 'Degradación lenta — tendencia a ansiedad',
        interpretation: 'Actividad baja de COMT. Acumulación de dopamina/noradrenalina. Mayor tendencia a ansiedad, rumiación nocturna.',
        implication: 'Priorizar técnicas de relajación y TCC-I. Magnesio glicinato especialmente recomendado. L-teanina como coadyuvante.',
      },
    },
    reference: 'Lotta T et al. Biochemistry. 1995;34(13):4202-4210.',
  },
  MTHFR: {
    gene: 'MTHFR',
    rsId: 'rs1801133',
    genotypeInterpretations: {
      'C/C': {
        impact: 'neutral',
        label: 'Actividad enzimática normal',
        interpretation: 'Sin reducción de actividad MTHFR. Metabolismo de folato normal.',
        implication: 'Sin implicaciones específicas para suplementación.',
      },
      'C/T': {
        impact: 'moderate',
        label: 'Actividad reducida ~35%',
        interpretation: 'Heterocigoto. Actividad MTHFR reducida aproximadamente 35%.',
        implication: 'Considerar suplementación con metilfolato (no ácido fólico). Monitorear B12 y homocisteína.',
      },
      'T/T': {
        impact: 'significant',
        label: 'Actividad reducida ~70%',
        interpretation: 'Homocigoto T. Actividad MTHFR reducida ~70%. Puede afectar síntesis de serotonina → melatonina.',
        implication: 'Suplementar con L-metilfolato (5-MTHF). Asegurar niveles óptimos de B12. La vía de síntesis de melatonina puede estar comprometida.',
      },
    },
    reference: 'Frosst P et al. Nat Genet. 1995;10(1):111-113.',
  },
};

// ─── Motor de análisis genético ─────────────────────────────────

export function analyzeVariant(
  geneName: string,
  genotype: Genotype
): GeneVariant {
  const def = VARIANT_DEFS[geneName];
  if (!def) {
    throw new Error(`Gen no reconocido: ${geneName}. Genes soportados: ${Object.keys(VARIANT_DEFS).join(', ')}`);
  }

  const interp = def.genotypeInterpretations[genotype];
  if (!interp) {
    throw new Error(
      `Genotipo ${genotype} no reconocido para ${geneName}. ` +
      `Genotipos soportados: ${Object.keys(def.genotypeInterpretations).join(', ')}`
    );
  }

  return {
    gene: def.gene,
    rsId: def.rsId,
    genotype,
    impact: interp.impact,
    impactLabel: interp.label,
    interpretation: interp.interpretation,
    clinicalImplication: interp.implication,
    reference: def.reference,
  };
}

export function analyzeGeneticProfile(
  variants: Record<string, Genotype>
): GeneticProfile {
  const results: GeneVariant[] = [];

  for (const [gene, genotype] of Object.entries(variants)) {
    results.push(analyzeVariant(gene, genotype));
  }

  // Cronotipo
  const clockResult = results.find(r => r.gene === 'CLOCK');
  const per2Result = results.find(r => r.gene === 'PER2');
  let chronotype = 'No evaluado (sin datos CLOCK/PER2).';
  if (clockResult && clockResult.impact === 'significant') {
    chronotype = 'Tendencia genética a vespertinidad marcada (CLOCK C/C).';
  } else if (per2Result && per2Result.impact === 'significant') {
    chronotype = 'Tendencia genética a matutinidad marcada (PER2 G/G).';
  } else if (clockResult || per2Result) {
    chronotype = 'Sin tendencia cronobiológica fuerte por genética.';
  }

  // Cafeína
  const adora = results.find(r => r.gene === 'ADORA2A');
  let caffeine = 'Recomendación estándar: evitar cafeína 6-8h antes de acostarse.';
  if (adora?.impact === 'significant') {
    caffeine = 'ALTA sensibilidad genética a cafeína. Considerar eliminación o restricción estricta a mañanas.';
  } else if (adora?.impact === 'moderate') {
    caffeine = 'Sensibilidad aumentada a cafeína. Cortar al menos 8-10h antes de dormir.';
  }

  // Suplementos
  const suppNotes: string[] = [];
  const comt = results.find(r => r.gene === 'COMT');
  const mthfr = results.find(r => r.gene === 'MTHFR');

  if (comt?.impact === 'significant') {
    suppNotes.push('COMT Met/Met: magnesio glicinato y L-teanina especialmente indicados para manejo de ansiedad nocturna.');
  }
  if (mthfr?.impact === 'significant') {
    suppNotes.push('MTHFR T/T: suplementar con L-metilfolato. Verificar B12 y homocisteína. La síntesis de melatonina puede estar comprometida.');
  } else if (mthfr?.impact === 'moderate') {
    suppNotes.push('MTHFR C/T: considerar metilfolato. Monitorear niveles de B12.');
  }

  const significant = results.filter(r => r.impact === 'significant');
  const summary = significant.length === 0
    ? `${results.length} variantes analizadas. Sin hallazgos genéticos de alto impacto.`
    : `${results.length} variantes analizadas. ${significant.length} hallazgo(s) significativo(s): ${significant.map(r => `${r.gene} (${r.genotype})`).join(', ')}.`;

  return {
    variants: results,
    chronotypeInfluence: chronotype,
    caffeineAdvice: caffeine,
    supplementNotes: suppNotes,
    summary,
  };
}

export { VARIANT_DEFS };
