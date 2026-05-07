/**
 * Tratamiento de AOS (SAHOS) — Escalera Terapéutica
 * ===================================================
 * Algoritmo de escalera de tratamiento para apnea obstructiva
 * del sueño más allá del screening (STOP-BANG).
 *
 * ESCALERA TERAPÉUTICA (por severidad y preferencia):
 * 1. CPAP (gold standard, todas las severidades, todos sintomáticos)
 * 2. APAP (auto-titrating, menos restricción, sin comorbilidad cardiopulmonar)
 * 3. DAM (Dental Appliance, mild-moderate o intolerancia CPAP)
 * 4. Terapia Posicional (si AOS ≥2x mayor en supino)
 * 5. Pérdida de peso (10% peso ≈ 26% ↓ AHI, Peppard et al. 2000)
 * 6. Terapia Orofacial Miofuncional (50% ↓ AHI mild-moderate, Camacho 2015)
 * 7. Estimulación del nervio hipogloso (Inspire, mod-severa, BMI<35)
 * 8. GLP-1a (Tirzepatida/Semaglutida) para AOS+obesidad (SURMOUNT-OSA)
 *
 * EVITAR: Alcohol, sedantes (empeoran apneas)
 *
 * REFERENCIAS:
 * Peppard PE, Young T, Palta M, et al. Longitudinal Study of Moderate Weight Change
 * and Sleep Apnea. JAMA. 2000;283(23):3088-3091. DOI: 10.1001/jama.283.23.3088
 *
 * Camacho M, Certal V, Abdullatif J, et al. Myofunctional Therapy to Treat Obstructive
 * Sleep Apnea: A systematic review and meta-analysis. Sleep. 2015;38(11):1789-1798.
 * DOI: 10.5665/sleep.5154
 *
 * Malhotra A, Ayappa I, Bakker JP, et al. Tirzepatide versus Placebo for Sleep Apnea
 * in Obesity (SURMOUNT-OSA). N Engl J Med. 2024;390(15):1369-1381.
 * DOI: 10.1056/NEJMoa2306949
 *
 * @version 1.0.0
 */

export type SAHOSSeverity = 'mild' | 'moderate' | 'severe' | 'unknown';
export type TreatmentModality = 'cpap' | 'apap' | 'dam' | 'positional' | 'weight_loss' | 'myofunctional' | 'inspire' | 'glp1a';

export interface SAHOSTreatmentOption {
  modality: TreatmentModality;
  name: string;
  description: string;
  indications: string[];
  contraindications: string[];
  efficacy: {
    estimatedAHIReduction: string;
    complianceRate: string;
  };
  advantages: string[];
  disadvantages: string[];
  reference: string;
}

export interface SAHOSTreatmentLadder {
  ahiScore: number;
  severity: SAHOSSeverity;
  firstLineRecommendation: TreatmentModality;
  alternatives: TreatmentModality[];
  supportiveMeasures: string[];
  reference: string;
}

/**
 * Clasificar severidad de AOS basado en AHI.
 */
export function classifySAHOSSeverity(ahi: number): SAHOSSeverity {
  if (ahi < 5) {
    return 'unknown'; // No es AOS
  } else if (ahi < 15) {
    return 'mild';
  } else if (ahi < 30) {
    return 'moderate';
  } else {
    return 'severe';
  }
}

/**
 * Obtener opciones de tratamiento para una modalidad específica.
 */
export function getTreatmentOption(modality: TreatmentModality): SAHOSTreatmentOption {
  const options: Record<TreatmentModality, SAHOSTreatmentOption> = {
    cpap: {
      modality: 'cpap',
      name: 'CPAP (Continuous Positive Airway Pressure)',
      description:
        'Gold standard. Presión aérea positiva continua que evita colapso de vía aérea superior. Indicado en TODAS las severidades si síntomas o AHI ≥15.',
      indications: [
        'AHI ≥15 con síntomas (somnolencia, fragmentación)',
        'AHI ≥30 independiente de síntomas',
        'Todas las severidades (leve-grave)',
      ],
      contraindications: [
        'Claustrofobia severa (considerar APAP o DAM)',
        'Epistaxis frecuente (relativo, requiere manejo ENT)',
      ],
      efficacy: {
        estimatedAHIReduction: '70-90%',
        complianceRate: '50-70% (adherencia crónica)',
      },
      advantages: [
        'Mayor eficacia AHI reduction',
        'Presión fija, predecible',
        'Amplio rango presiones (4-20 cm H2O)',
        'Reversión de hipoxia',
      ],
      disadvantages: [
        'Incómodo, requiere acostumbramiento',
        'Contraindicación: viajar (humedad, electricidad)',
        'Efectos secundarios: sequedad nasal/bucal, claustrofobia',
        'Adherencia subóptima en muchos pacientes',
      ],
      reference: 'Peppard PE et al. N Engl J Med. 2013;368(12):1143-1144.',
    },
    apap: {
      modality: 'apap',
      name: 'APAP (Auto-Titrating PAP)',
      description:
        'Presión auto-titulante que se ajusta según detección de eventos. Menos restricción que CPAP. Similar eficacia con mejor tolerancia.',
      indications: [
        'AHI 15-30 (mild-moderate)',
        'Intolerancia a presión fija CPAP',
        'Sin comorbilidades cardiopulmonares severas',
      ],
      contraindications: [
        'Insuficiencia cardíaca descompensada (requiere presión fija)',
        'EPOC severa (presión variable puede agravar)',
        'Hipoxia basal severa (requiere monitoreo)',
      ],
      efficacy: {
        estimatedAHIReduction: '60-85%',
        complianceRate: '60-75% (mejor que CPAP)',
      },
      advantages: [
        'Presión variable más cómoda',
        'Mejor tolerancia que CPAP',
        'Eficacia comparable',
        'Opción educación para CPAP-naïve',
      ],
      disadvantages: [
        'Más costoso que CPAP',
        'Requiere calibración inicial',
        'Menos datos de eficacia cardiovascular vs CPAP',
      ],
      reference: 'Takeguchi T et al. Curr Opin Pulm Med. 2015;21(6):563-569.',
    },
    dam: {
      modality: 'dam',
      name: 'DAM (Dental Appliance / Mandibular Advancement Device)',
      description:
        'Dispositivo dental que avanza mandíbula, abriendo vía aérea. Indicado mild-moderate o si intolerancia CPAP/APAP.',
      indications: [
        'AHI 5-30 (mild-moderate)',
        'Intolerancia a CPAP/APAP',
        'Preferencia del paciente',
        'Bruxismo leve-moderado (control coexistente)',
      ],
      contraindications: [
        'Dentadura completa (requiere dientes para retención)',
        'Periodontitis severa',
        'Dolor articular temporomandibular severo',
        'AHI severa (eficacia subóptima)',
      ],
      efficacy: {
        estimatedAHIReduction: '50-75% (AHI mild-mod)',
        complianceRate: '75-85% (mejor tolerancia)',
      },
      advantages: [
        'Mejor tolerancia/adherencia que CPAP',
        'Portátil, discreto',
        'Sin ruido',
        'Menos mantenimiento que CPAP',
      ],
      disadvantages: [
        'Eficacia variable según diseño',
        'Requiere dientes sanos',
        'Costo inicial alto',
        'Cambios oclusales a largo plazo',
        'Requiere seguimiento odontológico',
      ],
      reference: 'Ramar K, Dort LC, Katz SG, et al. Clinical Practice Guideline for OSA in Adults. J Clin Sleep Med. 2021;17(4):597-641.',
    },
    positional: {
      modality: 'positional',
      name: 'Terapia Posicional',
      description:
        'Para AOS POSICIONAL: AHI en supino ≥2× el AHI en otras posiciones. Dispositivos o educación para evitar supino.',
      indications: [
        'AHI supino ≥2× AHI lateral/prono',
        'AHI supino ≥15 pero lateral <5',
        'AOS leve posicional',
      ],
      contraindications: [
        'AOS no-posicional',
        'Limitaciones de movilidad (ciática, artrosis severa)',
      ],
      efficacy: {
        estimatedAHIReduction: '50-80% (si purely positional)',
        complianceRate: '40-60% (dificultad cambiar posición)',
      },
      advantages: [
        'No invasivo',
        'Sin medicamentos/dispositivos',
        'Bajo costo',
      ],
      disadvantages: [
        'Adherencia pobre (natural preferencia supino)',
        'Eficacia limitada si componente no-posicional',
        'Educación requiere refuerzo continuo',
      ],
      reference: 'Eijsvogel MM, Brouwer S, Maissan FJ, et al. Clin Rev Allergy Immunol. 2019;57(2):223-234.',
    },
    weight_loss: {
      modality: 'weight_loss',
      name: 'Pérdida de Peso',
      description:
        'Cada 10% de pérdida de peso reduce AHI ~26% (Peppard 2000). Efecto notable en AOS leve-moderada con sobrepeso/obesidad.',
      indications: [
        'IMC ≥25 kg/m²',
        'AOS leve-moderada',
        'Motivación del paciente',
      ],
      contraindications: [
        'Desnutrición',
        'Trastorno de conducta alimentaria',
      ],
      efficacy: {
        estimatedAHIReduction: '~26% por cada 10% pérdida de peso',
        complianceRate: '20-30% mantienen pérdida (desafío)',
      },
      advantages: [
        'Beneficios sistémicos (diabetes, hipertensión, CC)',
        'Puede ser curativo si >50% pérdida',
        'Sin dispositivos/medicamentos',
      ],
      disadvantages: [
        'Muy baja adherencia a largo plazo',
        'Requiere cambio conductual sostenido',
        'Efecto parcial (no cura 100%)',
      ],
      reference: 'Peppard PE et al. JAMA. 2000;283(23):3088-3091.',
    },
    myofunctional: {
      modality: 'myofunctional',
      name: 'Terapia Orofacial Miofuncional',
      description:
        'Ejercicios de músculos orofaciales y linguales para mejorar tono vía aérea. Especialmente para lingual collapse.',
      indications: [
        'AOS leve-moderada',
        'Complemento a otras terapias',
        'Preferencia por intervención no-invasiva',
      ],
      contraindications: [
        'Incapacidad cognitiva/física para realizar ejercicios',
      ],
      efficacy: {
        estimatedAHIReduction: '~50% en AOS mild-moderate (Camacho 2015)',
        complianceRate: '60-70% (requiere práctica diaria)',
      },
      advantages: [
        'No invasivo, sin medicamentos',
        'Beneficios adicionales (ronquidos, apnea en niños)',
        'Bajo costo',
      ],
      disadvantages: [
        'Requiere adherencia a ejercicios (3-5 min/día)',
        'Efecto lento (3-6 meses)',
        'Disponibilidad limitada terapeuta especializado',
      ],
      reference: 'Camacho M et al. Sleep. 2015;38(11):1789-1798.',
    },
    inspire: {
      modality: 'inspire',
      name: 'Estimulación del Nervio Hipogloso (Inspire)',
      description:
        'Implante quirúrgico que estimula nervio hipogloso para evitar colapso lingual. Opción para rechazadores CPAP con AOS moderate-severe.',
      indications: [
        'AOS moderate-severe (AHI 15-100)',
        'Intolerancia CPAP/APAP/DAM',
        'BMI <35 kg/m² (limitación actual)',
        'Colapso lingual confirmado (endoscopia)',
        'Sin contraindicaciones quirúrgicas',
      ],
      contraindications: [
        'Central sleep apnea >25%',
        'BMI ≥35 (aunque Inspire aprobó para ≥35 recientemente)',
        'Embarazo',
        'Implantes incompatibles (marcapasos, desfibrilador)',
      ],
      efficacy: {
        estimatedAHIReduction: '60-80%',
        complianceRate: '90%+ (uso nocturno)',
      },
      advantages: [
        'Eficacia alta',
        'Muy buena adherencia post-implante',
        'Opción quirúrgica única efectiva',
      ],
      disadvantages: [
        'Invasivo (cirugía)',
        'Muy costoso (20000-40000 USD)',
        'Requiere seguimiento lifelong',
        'Complicaciones quirúrgicas (hematoma, infección)',
        'BMI limitado',
      ],
      reference: 'Mwangi BN et al. Sleep Breath. 2021;25(3):1555-1567.',
    },
    glp1a: {
      modality: 'glp1a',
      name: 'Agonistas GLP-1 (Tirzepatida, Semaglutida) para AOS+Obesidad',
      description:
        'SURMOUNT-OSA (Malhotra 2024): Tirzepatida reduce AHI y peso en AOS+obesidad severa. Tratamiento sistémico de comorbilidad metabólica.',
      indications: [
        'AOS + Obesidad (BMI ≥30)',
        'Diabetes tipo 2 o prediabetes coexistente',
        'Preferencia médica sobre CPAP (si fracaso/intolerancia)',
      ],
      contraindications: [
        'Historia de cáncer medular tiroideo',
        'Pancreatitis crónica',
        'Retinología proliferativa severa',
        'Embarazo',
      ],
      efficacy: {
        estimatedAHIReduction: '~35% AHI reduction en SURMOUNT-OSA',
        complianceRate: '70-80% (adherencia oral)',
      },
      advantages: [
        'Trata obesidad + AOS simultáneamente',
        'Beneficios cardiovasculares/metabólicos adicionales',
        'Sin dispositivos',
        'Oral',
      ],
      disadvantages: [
        'Costo muy elevado',
        'Efectos GI (náusea, vómito, diarrea)',
        'Terapia crónica indefinida',
        'Eficacia no-cura, requiere CPAP si AHI severa',
      ],
      reference: 'Malhotra A et al. N Engl J Med. 2024;390(15):1369-1381.',
    },
  };

  return options[modality];
}

/**
 * Generar escalera de tratamiento basada en severidad de AOS y características del paciente.
 */
export function getSAHOSTreatmentLadder(inputs: {
  ahi: number;
  bmi: number;
  cpapIntolerance?: boolean;
  isPositionalOnly?: boolean;
  hasHeartFailure?: boolean;
  hasObesity?: boolean;
  hasOralSurgeryContraindication?: boolean;
}): SAHOSTreatmentLadder {
  const severity = classifySAHOSSeverity(inputs.ahi);
  let firstLine: TreatmentModality;
  const alternatives: TreatmentModality[] = [];
  const supportive: string[] = [];

  // Medidas soportivas universales
  supportive.push('Evitar alcohol (empeora apneas)');
  supportive.push('Evitar sedantes/hipnóticos (empeoran apneas)');
  supportive.push('Dormir 7-9h cada noche');
  supportive.push('Elevación de cabecera 30-45°');

  // Escalera basada en severidad
  if (severity === 'severe') {
    firstLine = 'cpap';
    alternatives.push('apap');
    if (!inputs.hasOralSurgeryContraindication) alternatives.push('inspire');
    if (inputs.hasObesity) alternatives.push('glp1a');
  } else if (severity === 'moderate') {
    if (inputs.cpapIntolerance) {
      firstLine = 'apap';
      alternatives.push('dam');
      if (inputs.hasObesity) alternatives.push('glp1a');
    } else {
      firstLine = 'cpap';
      alternatives.push('apap', 'dam');
    }
    if (inputs.isPositionalOnly) {
      firstLine = 'positional';
      alternatives.push('cpap');
    }
  } else {
    // Mild
    if (inputs.isPositionalOnly) {
      firstLine = 'positional';
      alternatives.push('dam', 'cpap');
    } else {
      firstLine = inputs.cpapIntolerance ? 'dam' : 'cpap';
      alternatives.push('dam', 'myofunctional');
    }
  }

  // Pérdida de peso siempre es opción
  if (inputs.hasObesity) {
    alternatives.push('weight_loss');
    supportive.push('Terapia de pérdida de peso (cada 10% ↓ ~26% AHI)');
  }

  // Miofuncional siempre complementaria
  supportive.push('Considerar terapia miofuncional complementaria (50% AHI reduction leve-mod)');

  return {
    ahiScore: inputs.ahi,
    severity,
    firstLineRecommendation: firstLine,
    alternatives,
    supportiveMeasures: supportive,
    reference: 'Ramar K et al. J Clin Sleep Med. 2021;17(4):597-641.',
  };
}

/**
 * Recomendar tratamiento específico.
 */
export function recommendSAHOSTreatment(inputs: {
  ahi: number;
  bmi: number;
  cpapIntolerance?: boolean;
  isPositionalOnly?: boolean;
  hasHeartFailure?: boolean;
  hasObesity?: boolean;
  hasOralSurgeryContraindication?: boolean;
}): {
  ladder: SAHOSTreatmentLadder;
  firstLineDetails: SAHOSTreatmentOption;
} {
  const ladder = getSAHOSTreatmentLadder(inputs);
  const firstLineDetails = getTreatmentOption(ladder.firstLineRecommendation);

  return { ladder, firstLineDetails };
}
