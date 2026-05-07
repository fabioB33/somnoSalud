/**
 * Parámetros de Laboratorio — SomnoSalud
 * =========================================
 * Rangos de referencia y análisis de valores de laboratorio
 * relevantes para trastornos del sueño.
 *
 * PARÁMETROS EVALUADOS:
 *
 * 1. Vitamina D (25-OH-D)
 *    - Deficiencia asociada a peor calidad de sueño y mayor latencia
 *    - Ref: Gao Q et al. Nutrients. 2018;10(10):1395.
 *
 * 2. Vitamina B12
 *    - Involucrada en síntesis de melatonina
 *    - Ref: Mayer G et al. J Clin Sleep Med. 2014;10(6):613-614.
 *
 * 3. Hierro sérico
 *    - Deficiencia asociada a síndrome de piernas inquietas
 *    - Ref: Allen RP et al. Sleep Med. 2003;4(2):101-119.
 *
 * 4. Ferritina
 *    - Ferritina <75 μg/L sugiere reservas bajas, puede afectar sueño
 *    - Ref: Allen RP et al. Sleep Med. 2003;4(2):101-119.
 *
 * 5. Magnesio sérico
 *    - Involucrado en regulación GABAérgica del sueño
 *    - Ref: Abbasi B et al. J Res Med Sci. 2012;17(12):1161-1169.
 *
 * 6. TSH (Hormona estimulante de tiroides)
 *    - Hipo/hipertiroidismo puede causar trastornos del sueño
 *    - Ref: Biondi B et al. Thyroid. 2019;29(1):10-58.
 *
 * 7. Glucemia en ayunas
 *    - Diabetes/resistencia a insulina afecta calidad del sueño
 *    - Ref: Reutrakul S et al. Chest. 2015;147(5):1387-1394.
 *
 * @version 1.0.0
 */

// ─── Types ──────────────────────────────────────────────────────

export type LabStatus = 'optimal' | 'normal' | 'suboptimal' | 'deficient' | 'elevated' | 'critical';

export interface LabRange {
  min?: number;
  max?: number;
  optimalMin?: number;
  optimalMax?: number;
}

export interface LabParameterDef {
  code: string;
  name: string;
  unit: string;
  ranges: {
    normal: LabRange;
    optimal?: LabRange;
  };
  sleepRelevance: string;
  reference: string;
}

export interface LabResult {
  parameterCode: string;
  parameterName: string;
  value: number;
  unit: string;
  status: LabStatus;
  statusLabel: string;
  interpretation: string;
  sleepImplication: string;
  reference: string;
}

export interface LabPanel {
  results: LabResult[];
  deficiencies: LabResult[];
  elevations: LabResult[];
  summary: string;
}

// ─── Definiciones de parámetros ─────────────────────────────────

const LAB_PARAMETERS: Record<string, LabParameterDef> = {
  vitD: {
    code: 'vitD',
    name: 'Vitamina D (25-OH-D)',
    unit: 'ng/mL',
    ranges: {
      normal: { min: 20, max: 100 },
      optimal: { min: 40, max: 60 },
    },
    sleepRelevance: 'Niveles bajos asociados a menor duración y peor calidad del sueño. Receptores de vitamina D presentes en áreas cerebrales reguladoras del sueño.',
    reference: 'Gao Q et al. Nutrients. 2018;10(10):1395.',
  },
  b12: {
    code: 'b12',
    name: 'Vitamina B12',
    unit: 'pg/mL',
    ranges: {
      normal: { min: 200, max: 900 },
      optimal: { min: 400, max: 700 },
    },
    sleepRelevance: 'Cofactor en la síntesis de melatonina vía SAM (S-adenosilmetionina). Deficiencia puede alterar ritmo circadiano.',
    reference: 'Mayer G et al. J Clin Sleep Med. 2014;10(6):613-614.',
  },
  iron: {
    code: 'iron',
    name: 'Hierro sérico',
    unit: 'μg/dL',
    ranges: {
      normal: { min: 60, max: 170 },
      optimal: { min: 80, max: 150 },
    },
    sleepRelevance: 'Deficiencia de hierro es la causa más común de síndrome de piernas inquietas, que interrumpe el sueño.',
    reference: 'Allen RP et al. Sleep Med. 2003;4(2):101-119.',
  },
  ferritin: {
    code: 'ferritin',
    name: 'Ferritina',
    unit: 'μg/L',
    ranges: {
      normal: { min: 12, max: 300 },
      optimal: { min: 75, max: 200 },
    },
    sleepRelevance: 'Ferritina <75 μg/L: considerar suplementación de hierro, especialmente si hay síntomas de piernas inquietas. Umbral terapéutico para RLS.',
    reference: 'Allen RP et al. Sleep Med. 2003;4(2):101-119.',
  },
  magnesium: {
    code: 'magnesium',
    name: 'Magnesio sérico',
    unit: 'mg/dL',
    ranges: {
      normal: { min: 1.7, max: 2.2 },
      optimal: { min: 2.0, max: 2.2 },
    },
    sleepRelevance: 'Magnesio regula receptores GABA-A y NMDA, implicados en la iniciación y mantenimiento del sueño.',
    reference: 'Abbasi B et al. J Res Med Sci. 2012;17(12):1161-1169.',
  },
  tsh: {
    code: 'tsh',
    name: 'TSH',
    unit: 'mUI/L',
    ranges: {
      normal: { min: 0.4, max: 4.0 },
      optimal: { min: 0.5, max: 2.5 },
    },
    sleepRelevance: 'Hipotiroidismo: somnolencia, apnea. Hipertiroidismo: insomnio, ansiedad. Ambos alteran arquitectura del sueño.',
    reference: 'Biondi B et al. Thyroid. 2019;29(1):10-58.',
  },
  glucose: {
    code: 'glucose',
    name: 'Glucemia en ayunas',
    unit: 'mg/dL',
    ranges: {
      normal: { min: 70, max: 100 },
      optimal: { min: 75, max: 95 },
    },
    sleepRelevance: 'Hiperglucemia y resistencia a insulina se asocian a fragmentación del sueño y mayor riesgo de AOS.',
    reference: 'Reutrakul S et al. Chest. 2015;147(5):1387-1394.',
  },
};

// ─── Motor de análisis ──────────────────────────────────────────

function classifyValue(value: number, param: LabParameterDef): { status: LabStatus; label: string } {
  const { normal, optimal } = param.ranges;

  // Valores críticos
  if (normal.min !== undefined && value < normal.min * 0.5) {
    return { status: 'critical', label: 'Críticamente bajo' };
  }
  if (normal.max !== undefined && value > normal.max * 1.5) {
    return { status: 'critical', label: 'Críticamente elevado' };
  }

  // Fuera de rango normal
  if (normal.min !== undefined && value < normal.min) {
    return { status: 'deficient', label: 'Bajo / Deficiente' };
  }
  if (normal.max !== undefined && value > normal.max) {
    return { status: 'elevated', label: 'Elevado' };
  }

  // En rango normal pero subóptimo
  if (optimal) {
    if (optimal.min !== undefined && value < optimal.min) {
      return { status: 'suboptimal', label: 'Normal bajo (subóptimo para sueño)' };
    }
    if (optimal.max !== undefined && value > optimal.max) {
      return { status: 'normal', label: 'Normal alto' };
    }
    return { status: 'optimal', label: 'Óptimo' };
  }

  return { status: 'normal', label: 'Normal' };
}

export function analyzeLabValue(
  parameterCode: string,
  value: number
): LabResult {
  const param = LAB_PARAMETERS[parameterCode];
  if (!param) {
    throw new Error(`Parámetro de laboratorio desconocido: ${parameterCode}`);
  }

  const { status, label } = classifyValue(value, param);

  let interpretation = '';
  let sleepImplication = '';

  switch (status) {
    case 'critical':
    case 'deficient':
      interpretation = `${param.name} = ${value} ${param.unit}. ${label}. Requiere evaluación y probable corrección.`;
      sleepImplication = param.sleepRelevance;
      break;
    case 'suboptimal':
      interpretation = `${param.name} = ${value} ${param.unit}. ${label}. Dentro de rango normal pero por debajo del óptimo.`;
      sleepImplication = `Nivel subóptimo puede contribuir: ${param.sleepRelevance}`;
      break;
    case 'elevated':
      interpretation = `${param.name} = ${value} ${param.unit}. ${label}. Requiere seguimiento.`;
      sleepImplication = param.sleepRelevance;
      break;
    case 'optimal':
      interpretation = `${param.name} = ${value} ${param.unit}. ${label}. Sin corrección necesaria.`;
      sleepImplication = 'Sin impacto negativo esperado en el sueño.';
      break;
    default:
      interpretation = `${param.name} = ${value} ${param.unit}. ${label}.`;
      sleepImplication = 'Sin impacto significativo esperado.';
  }

  return {
    parameterCode: param.code,
    parameterName: param.name,
    value,
    unit: param.unit,
    status,
    statusLabel: label,
    interpretation,
    sleepImplication,
    reference: param.reference,
  };
}

export function analyzeLabPanel(
  values: Record<string, number>
): LabPanel {
  const results: LabResult[] = [];

  for (const [code, value] of Object.entries(values)) {
    if (LAB_PARAMETERS[code]) {
      results.push(analyzeLabValue(code, value));
    }
  }

  const deficiencies = results.filter(r =>
    r.status === 'deficient' || r.status === 'critical' || r.status === 'suboptimal'
  );
  const elevations = results.filter(r => r.status === 'elevated');

  let summary = `${results.length} parámetros analizados.`;
  if (deficiencies.length > 0) {
    summary += ` Deficiencias/subóptimos: ${deficiencies.map(d => d.parameterName).join(', ')}.`;
  }
  if (elevations.length > 0) {
    summary += ` Elevados: ${elevations.map(e => e.parameterName).join(', ')}.`;
  }
  if (deficiencies.length === 0 && elevations.length === 0) {
    summary += ' Todos los valores dentro de rango normal/óptimo.';
  }

  return { results, deficiencies, elevations, summary };
}

export { LAB_PARAMETERS };
