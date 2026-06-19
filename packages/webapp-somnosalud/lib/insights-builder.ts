/**
 * Sprint 14 (2026-06-19) — Insights builder webapp.
 *
 * Paridad con mobile services/insights.ts adaptado al snapshot shape de
 * webapp (`BuildResultsOutput` del clinical-engine).
 *
 * Genera 5 insights P5.1-P5.5 (paridad estricta con sub-pantallas mobile):
 *  - P5.1 Respiración (apnea STOP-BANG)
 *  - P5.2 Descanso (insomnio ISI + phenotype)
 *  - P5.3 Acompañamiento (mood PHQ-9/GAD-7)
 *  - P5.4 Cuerpo (BMI + STOP-BANG cuerpo + lab/genetics)
 *  - P5.5 Resumen (todos los anteriores condensados)
 *
 * Encuadre encubierto crítico (Manifiesto §05):
 * NUNCA usar palabras "diagnóstico" / "trastorno" / "enfermedad" en el copy.
 * Usar "tu descanso" / "tu jornada" / "señales".
 */

import type { BuildResultsOutput } from '@/lib/results-builder';

export type InsightTone = 'positive' | 'neutral' | 'attention' | 'urgent';

export interface InsightDetail {
  id: 'respiracion' | 'descanso' | 'acompanamiento' | 'cuerpo' | 'resumen';
  title: string;
  /** Resumen 1-line para hub */
  summary: string;
  /** Cuerpo extendido para sub-pantalla */
  body: string;
  /** Footer derivación si aplica (compliance) */
  derivationNote: string | null;
  tone: InsightTone;
}

function emptyInsight(
  id: InsightDetail['id'],
  title: string,
  reason: string,
): InsightDetail {
  return {
    id,
    title,
    summary: 'Necesitamos más datos',
    body: reason,
    derivationNote: null,
    tone: 'neutral',
  };
}

// =====================================================
// P5.1 Respiración
// =====================================================

export function buildRespiracionInsight(
  results: BuildResultsOutput | null,
): InsightDetail {
  if (!results || !results.complete) {
    return emptyInsight(
      'respiracion',
      'Tu respiración al dormir',
      'Completá la evaluación inicial para ver tu lectura de respiración nocturna.',
    );
  }

  const risk = results.stopBang.risk;
  const score = results.stopBang.totalScore;

  if (risk === 'high') {
    return {
      id: 'respiracion',
      title: 'Tu respiración al dormir',
      summary: `Indicadores altos (STOP-BANG ${score}/8). Conviene consultar especialista.`,
      body: `Tu STOP-BANG dio ${score}/8 con clasificación de riesgo alto. Eso significa que hay varias señales coincidentes que un especialista del sueño tiene que evaluar (incluyendo posiblemente una polisomnografía). NO es un diagnóstico — es una sugerencia de derivación.`,
      derivationNote:
        'Consultá con tu médico de cabecera o un neumonólogo/somnólogo. Esta lectura no reemplaza esa consulta.',
      tone: 'urgent',
    };
  }

  if (risk === 'intermediate') {
    return {
      id: 'respiracion',
      title: 'Tu respiración al dormir',
      summary: `Indicadores intermedios (STOP-BANG ${score}/8). Vale la pena conversarlo.`,
      body: `Tu STOP-BANG dio ${score}/8 con riesgo intermedio. Hay señales que conviene conversar con un profesional. Mientras tanto, mantener el peso, dormir de costado y evitar alcohol antes de dormir suele ayudar.`,
      derivationNote:
        'Si notás cansancio diurno persistente o tu pareja menciona pausas respiratorias, consultá con un especialista.',
      tone: 'attention',
    };
  }

  return {
    id: 'respiracion',
    title: 'Tu respiración al dormir',
    summary: `Sin señales preocupantes (STOP-BANG ${score}/8).`,
    body: `Tu STOP-BANG dio ${score}/8 con bajo riesgo. No hay señales preocupantes en este momento. Mantener buenos hábitos (peso saludable, evitar alcohol antes de dormir, dormir de costado) preserva esto.`,
    derivationNote: null,
    tone: 'positive',
  };
}

// =====================================================
// P5.2 Descanso (insomnio ISI + phenotype)
// =====================================================

export function buildDescansoInsight(
  results: BuildResultsOutput | null,
): InsightDetail {
  if (!results || !results.complete) {
    return emptyInsight(
      'descanso',
      'Tu descanso',
      'Completá la evaluación para ver tu lectura de descanso.',
    );
  }

  const isi = results.isi;
  const phenotype = results.phenotype.phenotype;

  if (isi.severity === 'severe') {
    return {
      id: 'descanso',
      title: 'Tu descanso',
      summary: `ISI severo (${isi.totalScore}/28). Buscar acompañamiento profesional.`,
      body: `Tu ISI dio ${isi.totalScore}/28 con severidad alta. Esto significa que el insomnio te está afectando significativamente. Conviene buscar acompañamiento profesional para abordar las causas + plan estructurado.`,
      derivationNote:
        'Consultá con un especialista en medicina del sueño o psicología clínica especializada en TCC-I.',
      tone: 'urgent',
    };
  }

  if ((isi.severity !== 'no_insomnia' && isi.severity !== 'subthreshold')) {
    const phenotypeCopy: Record<string, string> = {
      onset: 'iniciar el sueño',
      maintenance: 'mantener el sueño durante la noche',
      mixed: 'iniciar y mantener el sueño',
      none: 'la calidad subjetiva del sueño',
    };
    return {
      id: 'descanso',
      title: 'Tu descanso',
      summary: `ISI ${isi.severity} (${isi.totalScore}/28). Fenotipo: ${phenotypeCopy[phenotype] ?? phenotype}.`,
      body: `Tu ISI dio ${isi.totalScore}/28. Detectamos un patrón en ${phenotypeCopy[phenotype] ?? phenotype}. Tu plan diario apunta justamente a esa zona: ordenar horarios, ritual previo + reducción de pantallas.`,
      derivationNote: null,
      tone: 'attention',
    };
  }

  return {
    id: 'descanso',
    title: 'Tu descanso',
    summary: `Sin insomnio clínico (ISI ${isi.totalScore}/28).`,
    body: `Tu ISI dio ${isi.totalScore}/28 sin significancia clínica. Tu descanso viene en general bien. El plan apunta a sostener lo que ya hacés.`,
    derivationNote: null,
    tone: 'positive',
  };
}

// =====================================================
// P5.3 Acompañamiento (PHQ-9 + GAD-7)
// =====================================================

export function buildAcompanamientoInsight(
  results: BuildResultsOutput | null,
): InsightDetail {
  if (!results || !results.complete) {
    return emptyInsight(
      'acompanamiento',
      'Tu acompañamiento emocional',
      'Completá la evaluación para ver tu lectura de bienestar emocional.',
    );
  }

  const phq9 = results.phq9;
  const gad7 = results.gad7;

  // PHQ-9 ítem 9 (ideación suicida) — derivación inmediata aunque score sea bajo.
  // El motor expone suicidalIdeation pero NO contiene el copy de derivación.
  const hasSuicidalIdeation = (phq9 as unknown as { suicidalIdeation?: boolean }).suicidalIdeation === true;

  if (hasSuicidalIdeation) {
    return {
      id: 'acompanamiento',
      title: 'Tu acompañamiento emocional',
      summary: 'Detectamos señales que requieren conversación profesional.',
      body: `Algo en tu evaluación sugiere que conviene hablar con un profesional. No estás solo/a. Si en algún momento sentís que no podés más, comunicate con un servicio de crisis: en Argentina el 0800-999-0091 está disponible las 24h. Cuidate.`,
      derivationNote:
        'Línea de crisis 0800-999-0091 (24h). Profesional de salud mental.',
      tone: 'urgent',
    };
  }

  const phqSevere = phq9.severity === 'severe' || phq9.severity === 'moderately_severe';
  const gadSevere = gad7.severity === 'severe';

  if (phqSevere || gadSevere) {
    return {
      id: 'acompanamiento',
      title: 'Tu acompañamiento emocional',
      summary: `Señales de ánimo (PHQ-9 ${phq9.totalScore}/27) o ansiedad (GAD-7 ${gad7.totalScore}/21).`,
      body: `Tu evaluación muestra señales que conviene conversar con un profesional. El descanso y el ánimo están relacionados — abordar lo emocional suele mejorar el sueño y viceversa.`,
      derivationNote:
        'Consultá con un psicólogo o psiquiatra. Esta lectura no reemplaza esa consulta.',
      tone: 'urgent',
    };
  }

  if (
    phq9.severity === 'moderate' ||
    gad7.severity === 'moderate'
  ) {
    return {
      id: 'acompanamiento',
      title: 'Tu acompañamiento emocional',
      summary: `Algunas señales emocionales (PHQ-9 ${phq9.totalScore}, GAD-7 ${gad7.totalScore}).`,
      body: `Tu evaluación muestra señales moderadas. Vale la pena prestarle atención: registrar momentos del día en que se intensifican, mantener rutinas, conectar con personas cercanas. Si persisten más de 2 semanas, consultá un profesional.`,
      derivationNote: null,
      tone: 'attention',
    };
  }

  return {
    id: 'acompanamiento',
    title: 'Tu acompañamiento emocional',
    summary: 'Sin señales emocionales preocupantes.',
    body: `Tu PHQ-9 dio ${phq9.totalScore}/27 y GAD-7 ${gad7.totalScore}/21. Sin señales preocupantes en este momento. Si en algún momento esto cambia, vas a verlo reflejado al re-evaluarte.`,
    derivationNote: null,
    tone: 'positive',
  };
}

// =====================================================
// P5.4 Cuerpo (BMI + STOP-BANG componentes corporales)
// =====================================================

export function buildCuerpoInsight(
  results: BuildResultsOutput | null,
): InsightDetail {
  if (!results || !results.complete) {
    return emptyInsight(
      'cuerpo',
      'Tu cuerpo y descanso',
      'Completá la evaluación para ver cómo influye tu cuerpo en el descanso.',
    );
  }

  // Cast defensivo: BMIResult del linkeado workspace en algunos contextos NO
  // expone .value ni category enum completo. Usamos shape mínimo que necesitamos.
  const bmi = results.bmi as unknown as { value: number; category: string };
  const bmiValue = bmi.value;
  const bmiCategory = bmi.category;

  if (bmiCategory === 'obesity_3' || bmiCategory === 'obesity_2' || bmiCategory === 'obesity_1') {
    return {
      id: 'cuerpo',
      title: 'Tu cuerpo y descanso',
      summary: `IMC ${bmiValue} en categoría que puede afectar el sueño.`,
      body: `Tu IMC dio ${bmiValue}. El peso corporal tiene relación directa con cómo respirás durante la noche y con el riesgo de apnea. Reducir 5-10% del peso suele mejorar significativamente el sueño y la respiración nocturna. Esto NO es juicio personal — es información para que tengas a mano al conversar con tu profesional.`,
      derivationNote:
        'Conversá con tu médico de cabecera sobre un plan integral (nutrición + actividad).',
      tone: 'attention',
    };
  }

  if (bmiCategory === 'overweight') {
    return {
      id: 'cuerpo',
      title: 'Tu cuerpo y descanso',
      summary: `IMC ${bmiValue} (sobrepeso). Margen para optimizar.`,
      body: `Tu IMC dio ${bmiValue}. Hay margen para optimizar. Reducir un poco el peso suele mejorar la calidad del sueño profundo + reducir despertares nocturnos.`,
      derivationNote: null,
      tone: 'neutral',
    };
  }

  if (bmiCategory === 'underweight') {
    return {
      id: 'cuerpo',
      title: 'Tu cuerpo y descanso',
      summary: `IMC ${bmiValue} (bajo peso). Conviene revisarlo.`,
      body: `Tu IMC dio ${bmiValue}. Bajo peso también puede afectar la calidad del sueño y la regulación hormonal. Conviene conversarlo con un profesional de la nutrición.`,
      derivationNote: 'Conversá con tu médico o nutricionista.',
      tone: 'attention',
    };
  }

  return {
    id: 'cuerpo',
    title: 'Tu cuerpo y descanso',
    summary: `IMC ${bmiValue} en rango saludable.`,
    body: `Tu IMC dio ${bmiValue} en rango saludable. Eso es buena base para un descanso de calidad. Sostener actividad regular + alimentación equilibrada preserva esto.`,
    derivationNote: null,
    tone: 'positive',
  };
}

// =====================================================
// P5.5 Resumen — sintetiza los 4 anteriores
// =====================================================

export function buildResumenInsight(
  results: BuildResultsOutput | null,
): InsightDetail {
  if (!results || !results.complete) {
    return emptyInsight(
      'resumen',
      'Tu resumen integral',
      'Completá la evaluación para ver tu lectura integral.',
    );
  }

  const respiracion = buildRespiracionInsight(results);
  const descanso = buildDescansoInsight(results);
  const acompanamiento = buildAcompanamientoInsight(results);
  const cuerpo = buildCuerpoInsight(results);

  const urgentes = [respiracion, descanso, acompanamiento, cuerpo].filter(
    (i) => i.tone === 'urgent',
  );
  const attention = [respiracion, descanso, acompanamiento, cuerpo].filter(
    (i) => i.tone === 'attention',
  );

  if (urgentes.length > 0) {
    return {
      id: 'resumen',
      title: 'Tu resumen integral',
      summary: `${urgentes.length} ${urgentes.length === 1 ? 'área' : 'áreas'} requieren atención prioritaria.`,
      body: `Tu evaluación muestra ${urgentes.length} dimensiones con señales que conviene abordar pronto. Mirá las sub-pantallas marcadas en rojo para ver detalle de cada una y los pasos sugeridos.`,
      derivationNote:
        'Consulta médica profesional priorizada para las dimensiones marcadas.',
      tone: 'urgent',
    };
  }

  if (attention.length > 0) {
    return {
      id: 'resumen',
      title: 'Tu resumen integral',
      summary: `${attention.length} ${attention.length === 1 ? 'área' : 'áreas'} para optimizar.`,
      body: `Tu evaluación muestra ${attention.length} dimensiones con margen para mejorar. No son alarmas — son oportunidades. Tu plan diario apunta a esas zonas. Si las sostenés 4-6 semanas, vas a ver cambios.`,
      derivationNote: null,
      tone: 'attention',
    };
  }

  return {
    id: 'resumen',
    title: 'Tu resumen integral',
    summary: 'Sin señales preocupantes en este momento.',
    body: `Tu evaluación muestra un perfil sin señales preocupantes. El plan apunta a sostener lo que ya hacés bien. Si en algún momento las cosas cambian, vas a verlo reflejado al re-evaluarte.`,
    derivationNote: null,
    tone: 'positive',
  };
}

// =====================================================
// Helper para hub
// =====================================================

export function buildAllInsights(results: BuildResultsOutput | null): InsightDetail[] {
  return [
    buildResumenInsight(results),
    buildRespiracionInsight(results),
    buildDescansoInsight(results),
    buildAcompanamientoInsight(results),
    buildCuerpoInsight(results),
  ];
}
