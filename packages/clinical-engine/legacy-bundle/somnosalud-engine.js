"use strict";
var SomnoSalud = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.ts
  var index_exports = {};
  __export(index_exports, {
    DASS21_ITEMS: () => DASS21_ITEMS,
    DASS21_OPTIONS: () => DASS21_OPTIONS,
    DASS21_STEM: () => DASS21_STEM,
    EMQ_ITEMS: () => EMQ_ITEMS,
    EMQ_OPTIONS: () => EMQ_OPTIONS,
    EMQ_STEM: () => EMQ_STEM,
    ESS_ITEMS: () => ESS_ITEMS,
    ESS_OPTIONS: () => ESS_OPTIONS,
    GAD7_ITEMS: () => GAD7_ITEMS,
    GAD7_OPTIONS: () => GAD7_OPTIONS,
    GAD7_STEM: () => GAD7_STEM,
    ISQ_ITEMS: () => ISQ_ITEMS,
    ISQ_OPTIONS: () => ISQ_OPTIONS,
    LAB_PARAMETERS: () => LAB_PARAMETERS,
    REFERENCES: () => REFERENCES,
    STOPBANG_AUTO_ITEMS: () => STOPBANG_AUTO_ITEMS,
    STOPBANG_MANUAL_ITEMS: () => STOPBANG_MANUAL_ITEMS,
    TREATMENT_DB: () => TREATMENT_DB,
    VARIANT_DEFS: () => VARIANT_DEFS,
    analyzeGeneticProfile: () => analyzeGeneticProfile,
    analyzeLabPanel: () => analyzeLabPanel,
    analyzeLabValue: () => analyzeLabValue,
    analyzeVariant: () => analyzeVariant,
    assessRisk: () => assessRisk,
    calculateBMI: () => calculateBMI2,
    calculatePrecision: () => calculatePrecision,
    classifyInsomniaPhenotype: () => classifyInsomniaPhenotype,
    evaluateAllSafetyRules: () => evaluateAllSafetyRules,
    generateRecommendations: () => generateRecommendations,
    getReference: () => getReference,
    getReferencesForModule: () => getReferencesForModule,
    safe010_ageMinimum: () => safe010_ageMinimum,
    safe020_pregnancy: () => safe020_pregnancy,
    safe021_breastfeeding: () => safe021_breastfeeding,
    safe040_melatoninAnticoagulant: () => safe040_melatoninAnticoagulant,
    scoreDASS21: () => scoreDASS21,
    scoreEMQ: () => scoreEMQ,
    scoreESS: () => scoreESS,
    scoreGAD7: () => scoreGAD7,
    scoreISQ: () => scoreISQ,
    scoreSTOPBANG: () => scoreSTOPBANG,
    validateReferences: () => validateReferences
  });

  // [REMOVED: función y datos de scoring legacy — reemplazados por ISQ]

  // src/scoring/ess.ts
  var MIN_ITEM2 = 0;
  var MAX_ITEM2 = 3;
  var NUM_ITEMS2 = 8;
  var CUTOFFS2 = [
    { max: 10, severity: "normal", label: "Somnolencia diurna normal" },
    { max: 14, severity: "mild", label: "Somnolencia diurna leve" },
    { max: 17, severity: "moderate", label: "Somnolencia diurna moderada" },
    { max: 24, severity: "severe", label: "Somnolencia diurna severa" }
  ];
  function scoreESS(responses) {
    if (responses.length !== NUM_ITEMS2) {
      throw new Error(`ESS requiere exactamente ${NUM_ITEMS2} respuestas, recibidas: ${responses.length}`);
    }
    for (let i = 0; i < NUM_ITEMS2; i++) {
      const val = responses[i];
      if (!Number.isInteger(val) || val < MIN_ITEM2 || val > MAX_ITEM2) {
        throw new Error(`ESS \xEDtem ${i + 1}: valor ${val} fuera de rango [${MIN_ITEM2}-${MAX_ITEM2}]`);
      }
    }
    const totalScore = responses.reduce((sum, val) => sum + val, 0);
    const classification = CUTOFFS2.find((c) => totalScore <= c.max);
    return {
      totalScore,
      severity: classification.severity,
      severityLabel: classification.label,
      itemScores: [...responses],
      reference: "Johns MW. Sleep. 1991;14(6):540-545."
    };
  }
  var ESS_ITEMS = [
    { number: 1, text: "Sentado/a leyendo" },
    { number: 2, text: "Viendo televisi\xF3n" },
    { number: 3, text: "Sentado/a, inactivo/a, en un lugar p\xFAblico (ej: teatro, reuni\xF3n)" },
    { number: 4, text: "Como pasajero/a en un auto durante 1 hora sin parar" },
    { number: 5, text: "Descansando acostado/a por la tarde cuando las circunstancias lo permiten" },
    { number: 6, text: "Sentado/a hablando con alguien" },
    { number: 7, text: "Sentado/a tranquilo/a despu\xE9s del almuerzo (sin haber tomado alcohol)" },
    { number: 8, text: "En un auto, mientras est\xE1 detenido unos minutos en el tr\xE1fico" }
  ];
  var ESS_OPTIONS = [
    { value: 0, label: "Nunca me dormir\xEDa" },
    { value: 1, label: "Escasa probabilidad de dormirme" },
    { value: 2, label: "Moderada probabilidad de dormirme" },
    { value: 3, label: "Alta probabilidad de dormirme" }
  ];

  // src/scoring/stop-bang.ts
  var CUTOFFS3 = [
    { max: 2, risk: "low", label: "Riesgo bajo de apnea obstructiva del sue\xF1o" },
    { max: 4, risk: "intermediate", label: "Riesgo intermedio de apnea obstructiva del sue\xF1o" },
    { max: 8, risk: "high", label: "Riesgo alto de apnea obstructiva del sue\xF1o \u2014 derivar a polisomnograf\xEDa" }
  ];
  function calculateAge(dateOfBirth) {
    const today = /* @__PURE__ */ new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || monthDiff === 0 && today.getDate() < birth.getDate()) {
      age--;
    }
    return age;
  }
  function calculateBMI(weightKg, heightCm) {
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
  }
  function scoreSTOPBANG(manual, patient) {
    const bmi = calculateBMI(patient.weightKg, patient.heightCm);
    const age = calculateAge(patient.dateOfBirth);
    const bmiOver35 = bmi > 35;
    const ageOver50 = age > 50;
    const isMale = patient.biologicalSex === "male";
    const items = {
      S_snoring: manual.snoring,
      T_tired: manual.tired,
      O_observed: manual.observed,
      P_pressure: manual.pressure,
      B_bmi: bmiOver35,
      A_age: ageOver50,
      N_neck: manual.neckOver40cm,
      G_gender: isMale
    };
    const totalScore = Object.values(items).filter(Boolean).length;
    const classification = CUTOFFS3.find((c) => totalScore <= c.max);
    return {
      totalScore,
      risk: classification.risk,
      riskLabel: classification.label,
      itemDetails: items,
      autoCalculated: { bmiOver35, ageOver50, isMale },
      reference: "Chung F et al. Anesthesiology. 2008;108(5):812-821."
    };
  }
  var STOPBANG_MANUAL_ITEMS = [
    {
      code: "S",
      text: "\xBFRonc\xE1s fuerte? (lo suficiente para escucharse a trav\xE9s de una puerta cerrada)",
      field: "snoring"
    },
    {
      code: "T",
      text: "\xBFTe sent\xEDs cansado/a, fatigado/a o somnoliento/a durante el d\xEDa?",
      field: "tired"
    },
    {
      code: "O",
      text: "\xBFAlguien observ\xF3 que dej\xE1s de respirar o te ahog\xE1s/sofoc\xE1s mientras dorm\xEDs?",
      field: "observed"
    },
    {
      code: "P",
      text: "\xBFTen\xE9s o te trataron por presi\xF3n arterial alta?",
      field: "pressure"
    },
    {
      code: "N",
      text: "\xBFTu circunferencia de cuello es mayor a 40 cm?",
      field: "neckOver40cm"
    }
  ];
  var STOPBANG_AUTO_ITEMS = [
    { code: "B", text: "IMC > 35", field: "bmiOver35" },
    { code: "A", text: "Edad > 50 a\xF1os", field: "ageOver50" },
    { code: "G", text: "Sexo masculino", field: "isMale" }
  ];

  // [REMOVED: función y datos de screening emocional legacy — reemplazados por EMQ]

  // src/scoring/isq.ts — SomnoSalud Insomnia Screening Questionnaire
  // Basado en criterios ICSD-3 para trastorno de insomnio
  var MIN_ITEM_ISQ = 0;
  var MAX_ITEM_ISQ = 4;
  var NUM_ITEMS_ISQ = 7;
  var CUTOFFS_ISQ = [
    { max: 7, severity: "no_insomnia", label: "Sin insomnio clínicamente significativo" },
    { max: 14, severity: "mild", label: "Insomnio leve" },
    { max: 21, severity: "moderate", label: "Insomnio moderado" },
    { max: 28, severity: "severe", label: "Insomnio severo" }
  ];
  function scoreISQ(responses) {
    if (responses.length !== NUM_ITEMS_ISQ) {
      throw new Error(`ISQ requiere exactamente ${NUM_ITEMS_ISQ} respuestas, recibidas: ${responses.length}`);
    }
    for (let i = 0; i < NUM_ITEMS_ISQ; i++) {
      const val = responses[i];
      if (!Number.isInteger(val) || val < MIN_ITEM_ISQ || val > MAX_ITEM_ISQ) {
        throw new Error(`ISQ ítem ${i + 1}: valor ${val} fuera de rango [${MIN_ITEM_ISQ}-${MAX_ITEM_ISQ}]`);
      }
    }
    const totalScore = responses.reduce((sum, val) => sum + val, 0);
    const classification = CUTOFFS_ISQ.find((c) => totalScore <= c.max);
    return {
      totalScore,
      severity: classification.severity,
      severityLabel: classification.label,
      itemScores: [...responses],
      reference: "American Academy of Sleep Medicine. International Classification of Sleep Disorders, 3rd ed. 2014."
    };
  }
  var ISQ_ITEMS = [
    {
      number: 1,
      text: "¿Cuán difícil le ha resultado iniciar el sueño cuando se acuesta?"
    },
    {
      number: 2,
      text: "¿Cuán difícil le ha resultado permanecer dormido/a durante toda la noche?"
    },
    {
      number: 3,
      text: "¿Con qué frecuencia se despierta muy temprano por la mañana, antes de su hora deseada?"
    },
    {
      number: 4,
      text: "¿Cuán satisfecho/a se siente con la cantidad y calidad de su sueño actual?"
    },
    {
      number: 5,
      text: "¿En qué medida su patrón de sueño afecta su capacidad para funcionar durante el día?"
    },
    {
      number: 6,
      text: "¿Cuánta preocupación o angustia le causa su situación actual de sueño?"
    },
    {
      number: 7,
      text: "¿Qué tan notorio o evidente es su problema de sueño para las personas a su alrededor?"
    }
  ];
  var ISQ_OPTIONS = [
    { value: 0, label: "Nada / Muy satisfecho" },
    { value: 1, label: "Leve" },
    { value: 2, label: "Moderado" },
    { value: 3, label: "Considerable" },
    { value: 4, label: "Severo / Muy insatisfecho" }
  ];

  // src/scoring/emq.ts — SomnoSalud Emotional Mood Questionnaire
  // Instrumento original basado en criterios DSM-5 para Trastorno Depresivo Mayor
  // IMPORTANTE: Excluye completamente ítems de ideación suicida por solicitud clínica
  var MIN_ITEM_EMQ = 0;
  var MAX_ITEM_EMQ = 3;
  var NUM_ITEMS_EMQ = 9;
  var CUTOFFS_EMQ = [
    { max: 4, severity: "minimal", label: "Síntomas depresivos mínimos" },
    { max: 9, severity: "mild", label: "Síntomas depresivos leves" },
    { max: 14, severity: "moderate", label: "Síntomas depresivos moderados" },
    { max: 19, severity: "moderately_severe", label: "Síntomas depresivos moderadamente severos" },
    { max: 27, severity: "severe", label: "Síntomas depresivos severos" }
  ];
  function scoreEMQ(responses) {
    if (responses.length !== NUM_ITEMS_EMQ) {
      throw new Error(`EMQ requiere exactamente ${NUM_ITEMS_EMQ} respuestas, recibidas: ${responses.length}`);
    }
    for (let i = 0; i < NUM_ITEMS_EMQ; i++) {
      const val = responses[i];
      if (!Number.isInteger(val) || val < MIN_ITEM_EMQ || val > MAX_ITEM_EMQ) {
        throw new Error(`EMQ ítem ${i + 1}: valor ${val} fuera de rango [${MIN_ITEM_EMQ}-${MAX_ITEM_EMQ}]`);
      }
    }
    const totalScore = responses.reduce((sum, val) => sum + val, 0);
    const classification = CUTOFFS_EMQ.find((c) => totalScore <= c.max);
    return {
      totalScore,
      severity: classification.severity,
      severityLabel: classification.label,
      itemScores: [...responses],
      reference: "American Psychiatric Association. Diagnostic and Statistical Manual of Mental Disorders, 5th ed. 2013."
    };
  }
  var EMQ_ITEMS = [
    { number: 1, text: "Falta de interés o entusiasmo en las actividades que normalmente le resultan placenteras" },
    { number: 2, text: "Sensación de tristeza, melancolía o vacío emocional" },
    { number: 3, text: "Cambios en sus patrones de sueño (dormir más o menos de lo habitual)" },
    { number: 4, text: "Agotamiento físico o falta de energía para realizar sus actividades diarias" },
    { number: 5, text: "Cambios en el apetito (comer más o menos de lo acostumbrado)" },
    { number: 6, text: "Sentimientos de culpa, autocrítica o sensación de ser un fracaso" },
    { number: 7, text: "Dificultad para concentrarse, tomar decisiones o realizar tareas que requieren atención" },
    { number: 8, text: "Lentitud en sus movimientos o velocidad del habla, o agitación motora notable" },
    { number: 9, text: "Sensación de desesperanza o pesimismo sobre el futuro" }
  ];
  var EMQ_OPTIONS = [
    { value: 0, label: "Nunca o casi nunca" },
    { value: 1, label: "Varios días en la última semana" },
    { value: 2, label: "Más de la mitad de los días" },
    { value: 3, label: "Casi todos los días" }
  ];
  var EMQ_STEM = "Durante la última semana, indique con qué frecuencia ha experimentado los siguientes síntomas:";

  // src/scoring/gad7.ts
  var MIN_ITEM4 = 0;
  var MAX_ITEM4 = 3;
  var NUM_ITEMS4 = 7;
  var CUTOFFS5 = [
    { max: 4, severity: "minimal", label: "Ansiedad m\xEDnima" },
    { max: 9, severity: "mild", label: "Ansiedad leve" },
    { max: 14, severity: "moderate", label: "Ansiedad moderada" },
    { max: 21, severity: "severe", label: "Ansiedad severa" }
  ];
  function scoreGAD7(responses) {
    if (responses.length !== NUM_ITEMS4) {
      throw new Error(`GAD-7 requiere exactamente ${NUM_ITEMS4} respuestas, recibidas: ${responses.length}`);
    }
    for (let i = 0; i < NUM_ITEMS4; i++) {
      const val = responses[i];
      if (!Number.isInteger(val) || val < MIN_ITEM4 || val > MAX_ITEM4) {
        throw new Error(`GAD-7 \xEDtem ${i + 1}: valor ${val} fuera de rango [${MIN_ITEM4}-${MAX_ITEM4}]`);
      }
    }
    const totalScore = responses.reduce((sum, val) => sum + val, 0);
    const classification = CUTOFFS5.find((c) => totalScore <= c.max);
    return {
      totalScore,
      severity: classification.severity,
      severityLabel: classification.label,
      itemScores: [...responses],
      reference: "Spitzer RL et al. Arch Intern Med. 2006;166(10):1092-1097."
    };
  }
  var GAD7_ITEMS = [
    { number: 1, text: "Sentirme nervioso/a, ansioso/a o con los nervios de punta" },
    { number: 2, text: "No poder dejar de preocuparme o no poder controlar la preocupaci\xF3n" },
    { number: 3, text: "Preocuparme demasiado por diferentes cosas" },
    { number: 4, text: "Dificultad para relajarme" },
    { number: 5, text: "Estar tan inquieto/a que es dif\xEDcil quedarme quieto/a" },
    { number: 6, text: "Molestarme o irritarme f\xE1cilmente" },
    { number: 7, text: "Sentir miedo como si algo terrible pudiera pasar" }
  ];
  var GAD7_OPTIONS = [
    { value: 0, label: "Nunca" },
    { value: 1, label: "Varios d\xEDas" },
    { value: 2, label: "M\xE1s de la mitad de los d\xEDas" },
    { value: 3, label: "Casi todos los d\xEDas" }
  ];
  var GAD7_STEM = "En las \xFAltimas 2 semanas, \xBFcon qu\xE9 frecuencia te han molestado los siguientes problemas?";

  // src/scoring/dass21.ts
  var NUM_ITEMS5 = 21;
  var MIN_ITEM5 = 0;
  var MAX_ITEM5 = 3;
  var DEPRESSION_INDICES = [2, 4, 9, 12, 15, 16, 20];
  var ANXIETY_INDICES = [1, 3, 6, 8, 14, 18, 19];
  var STRESS_INDICES = [0, 5, 7, 10, 11, 13, 17];
  var DEPRESSION_CUTOFFS = [
    { max: 9, severity: "normal", label: "Normal" },
    { max: 13, severity: "mild", label: "Leve" },
    { max: 20, severity: "moderate", label: "Moderada" },
    { max: 27, severity: "severe", label: "Severa" },
    { max: 42, severity: "extremely_severe", label: "Extremadamente severa" }
  ];
  var ANXIETY_CUTOFFS = [
    { max: 7, severity: "normal", label: "Normal" },
    { max: 9, severity: "mild", label: "Leve" },
    { max: 14, severity: "moderate", label: "Moderada" },
    { max: 19, severity: "severe", label: "Severa" },
    { max: 42, severity: "extremely_severe", label: "Extremadamente severa" }
  ];
  var STRESS_CUTOFFS = [
    { max: 14, severity: "normal", label: "Normal" },
    { max: 18, severity: "mild", label: "Leve" },
    { max: 25, severity: "moderate", label: "Moderado" },
    { max: 33, severity: "severe", label: "Severo" },
    { max: 42, severity: "extremely_severe", label: "Extremadamente severo" }
  ];
  function classify(score, cutoffs) {
    return cutoffs.find((c) => score <= c.max);
  }
  function sumIndices(responses, indices) {
    return indices.reduce((sum, idx) => sum + responses[idx], 0);
  }
  function scoreDASS21(responses) {
    if (responses.length !== NUM_ITEMS5) {
      throw new Error(`DASS-21 requiere exactamente ${NUM_ITEMS5} respuestas, recibidas: ${responses.length}`);
    }
    for (let i = 0; i < NUM_ITEMS5; i++) {
      const val = responses[i];
      if (!Number.isInteger(val) || val < MIN_ITEM5 || val > MAX_ITEM5) {
        throw new Error(`DASS-21 \xEDtem ${i + 1}: valor ${val} fuera de rango [${MIN_ITEM5}-${MAX_ITEM5}]`);
      }
    }
    const depressionRaw = sumIndices(responses, DEPRESSION_INDICES);
    const anxietyRaw = sumIndices(responses, ANXIETY_INDICES);
    const stressRaw = sumIndices(responses, STRESS_INDICES);
    const depressionScore = depressionRaw * 2;
    const anxietyScore = anxietyRaw * 2;
    const stressScore = stressRaw * 2;
    const depClass = classify(depressionScore, DEPRESSION_CUTOFFS);
    const anxClass = classify(anxietyScore, ANXIETY_CUTOFFS);
    const strClass = classify(stressScore, STRESS_CUTOFFS);
    return {
      depressionScore,
      anxietyScore,
      stressScore,
      depressionSeverity: depClass.severity,
      anxietySeverity: anxClass.severity,
      stressSeverity: strClass.severity,
      depressionLabel: `Depresi\xF3n: ${depClass.label}`,
      anxietyLabel: `Ansiedad: ${anxClass.label}`,
      stressLabel: `Estr\xE9s: ${strClass.label}`,
      reference: "Lovibond SH & Lovibond PF. Manual for the DASS. 2nd ed. 1995."
    };
  }
  var DASS21_ITEMS = [
    { number: 1, subscale: "stress", text: "Me cost\xF3 mucho relajarme" },
    { number: 2, subscale: "anxiety", text: "Me di cuenta que ten\xEDa la boca seca" },
    { number: 3, subscale: "depression", text: "No pod\xEDa sentir ning\xFAn sentimiento positivo" },
    { number: 4, subscale: "anxiety", text: "Se me hizo dif\xEDcil respirar (respiraci\xF3n agitada, falta de aire sin haber hecho esfuerzo f\xEDsico)" },
    { number: 5, subscale: "depression", text: "Se me hizo dif\xEDcil tomar la iniciativa para hacer cosas" },
    { number: 6, subscale: "stress", text: "Reaccion\xE9 exageradamente en ciertas situaciones" },
    { number: 7, subscale: "anxiety", text: "Sent\xED que mis manos temblaban" },
    { number: 8, subscale: "stress", text: "Sent\xED que ten\xEDa muchos nervios" },
    { number: 9, subscale: "anxiety", text: "Estaba preocupado/a por situaciones en las cuales pod\xEDa tener p\xE1nico o en las que podr\xEDa hacer el rid\xEDculo" },
    { number: 10, subscale: "depression", text: "Sent\xED que no ten\xEDa nada por qu\xE9 vivir" },
    { number: 11, subscale: "stress", text: "Not\xE9 que me agitaba" },
    { number: 12, subscale: "stress", text: "Se me hizo dif\xEDcil relajarme" },
    { number: 13, subscale: "depression", text: "Me sent\xED triste y deprimido/a" },
    { number: 14, subscale: "stress", text: "No toler\xE9 nada que no me permitiera continuar con lo que estaba haciendo" },
    { number: 15, subscale: "anxiety", text: "Sent\xED que estaba al punto de p\xE1nico" },
    { number: 16, subscale: "depression", text: "No me pude entusiasmar por nada" },
    { number: 17, subscale: "depression", text: "Sent\xED que val\xEDa muy poco como persona" },
    { number: 18, subscale: "stress", text: "Sent\xED que estaba muy irritable" },
    { number: 19, subscale: "anxiety", text: "Sent\xED los latidos de mi coraz\xF3n a pesar de no haber hecho ning\xFAn esfuerzo f\xEDsico" },
    { number: 20, subscale: "anxiety", text: "Tuve miedo sin raz\xF3n" },
    { number: 21, subscale: "depression", text: "Sent\xED que la vida no ten\xEDa ning\xFAn sentido" }
  ];
  var DASS21_OPTIONS = [
    { value: 0, label: "No me aplic\xF3" },
    { value: 1, label: "Me aplic\xF3 un poco, o durante parte del tiempo" },
    { value: 2, label: "Me aplic\xF3 bastante, o durante una buena parte del tiempo" },
    { value: 3, label: "Me aplic\xF3 mucho, o la mayor parte del tiempo" }
  ];
  var DASS21_STEM = "Por favor lee cada afirmaci\xF3n e indic\xE1 cu\xE1nto te aplic\xF3 durante la \xDALTIMA SEMANA. No hay respuestas correctas ni incorrectas.";

  // src/scoring/bmi.ts
  var CUTOFFS6 = [
    { max: 18.49, category: "underweight", label: "Bajo peso" },
    { max: 24.99, category: "normal", label: "Peso normal" },
    { max: 29.99, category: "overweight", label: "Sobrepeso" },
    { max: 34.99, category: "obese_I", label: "Obesidad grado I" },
    { max: 39.99, category: "obese_II", label: "Obesidad grado II" },
    { max: 999, category: "obese_III", label: "Obesidad grado III (m\xF3rbida)" }
  ];
  function calculateBMI2(weightKg, heightCm) {
    if (weightKg <= 0 || weightKg > 500) {
      throw new Error(`Peso inv\xE1lido: ${weightKg} kg (esperado: 1-500)`);
    }
    if (heightCm <= 0 || heightCm > 300) {
      throw new Error(`Altura inv\xE1lida: ${heightCm} cm (esperado: 1-300)`);
    }
    const heightM = heightCm / 100;
    const bmi = Math.round(weightKg / (heightM * heightM) * 100) / 100;
    const classification = CUTOFFS6.find((c) => bmi <= c.max);
    return {
      bmi,
      category: classification.category,
      categoryLabel: classification.label,
      isApneaRiskFactor: bmi >= 30,
      isSTOPBANGPositive: bmi > 35,
      reference: "WHO Expert Consultation. Lancet. 2004;363(9403):157-163."
    };
  }

  // src/safety/rules.ts
  function calculateAge2(dateOfBirth) {
    const today = /* @__PURE__ */ new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || m === 0 && today.getDate() < birth.getDate()) age--;
    return age;
  }
  function safe010_ageMinimum(patient) {
    const age = calculateAge2(patient.dateOfBirth);
    const triggered = age < 18;
    return {
      ruleCode: "SAFE-010",
      ruleName: "Edad m\xEDnima",
      triggered,
      severity: triggered ? "block" : "clear",
      message: triggered ? `Paciente de ${age} a\xF1os. SomnoSalud est\xE1 dise\xF1ado para adultos (\u226518 a\xF1os). Los trastornos del sue\xF1o en menores requieren evaluaci\xF3n pedi\xE1trica especializada.` : `Paciente de ${age} a\xF1os. Cumple requisito de edad m\xEDnima.`,
      action: triggered ? "BLOQUEAR evaluaci\xF3n completa. Derivar a pediatr\xEDa/medicina del sue\xF1o pedi\xE1trica." : "Continuar con evaluaci\xF3n.",
      blockedRecommendations: triggered ? ["ALL"] : [],
      references: [
        "American Academy of Pediatrics. Pediatrics. 2016;138(6):e20162940."
      ]
    };
  }
  function safe020_pregnancy(screening) {
    const triggered = screening.isPregnant === true;
    return {
      ruleCode: "SAFE-020",
      ruleName: "Embarazo",
      triggered,
      severity: triggered ? "restrict" : "clear",
      message: triggered ? "Embarazo detectado. Se bloquean todos los suplementos. Solo se permiten intervenciones conductuales (higiene del sue\xF1o, t\xE9cnicas de relajaci\xF3n, TCC-I adaptada)." : "Sin embarazo reportado.",
      action: triggered ? "RESTRINGIR: solo recomendaciones conductuales. Bloquear melatonina, magnesio, L-teanina, glicina y cualquier suplemento." : "Continuar sin restricci\xF3n.",
      blockedRecommendations: triggered ? ["melatonin", "magnesium", "l-theanine", "glycine", "ALL_SUPPLEMENTS"] : [],
      references: [
        "Oyiengo D et al. Sleep Med Rev. 2014;18(4):293-307.",
        "Andersen ML et al. Sleep Med Rev. 2018;38:28-39."
      ]
    };
  }
  var ANTICOAGULANTS = [
    "warfarina",
    "acenocumarol",
    "heparina",
    "enoxaparina",
    "rivaroxab\xE1n",
    "rivaroxaban",
    "apixab\xE1n",
    "apixaban",
    "dabigatr\xE1n",
    "dabigatran",
    "edoxab\xE1n",
    "edoxaban",
    // Nombres comerciales comunes en LATAM
    "coumadin",
    "sintrom",
    "xarelto",
    "eliquis",
    "pradaxa",
    "lixiana"
  ];
  function safe040_melatoninAnticoagulant(medications) {
    const normalizedMeds = medications.map((m) => m.toLowerCase().trim());
    const foundAnticoagulants = normalizedMeds.filter(
      (m) => ANTICOAGULANTS.some((ac) => m.includes(ac))
    );
    const triggered = foundAnticoagulants.length > 0;
    return {
      ruleCode: "SAFE-040",
      ruleName: "Interacci\xF3n melatonina-anticoagulantes",
      triggered,
      severity: triggered ? "restrict" : "clear",
      message: triggered ? `Paciente toma anticoagulante(s): ${foundAnticoagulants.join(", ")}. La melatonina puede potenciar el efecto anticoagulante e incrementar riesgo de sangrado. Se bloquea recomendaci\xF3n de melatonina.` : "Sin anticoagulantes reportados.",
      action: triggered ? "RESTRINGIR: bloquear melatonina. Otros suplementos y conductuales permitidos (verificar individualmente)." : "Continuar sin restricci\xF3n de melatonina.",
      blockedRecommendations: triggered ? ["melatonin"] : [],
      references: [
        "Hosseinzadeh A et al. Biomed Pharmacother. 2021;141:111902."
      ]
    };
  }
  // SAFE-021: Lactancia materna
  // Ref: Hale TW. Medications and Mothers' Milk. 2023
  // Ref: Sachs HC et al. AAP Committee on Drugs. Pediatrics. 2013;132(3):e795
  var BREASTFEEDING_BLOCKED_SUPPLEMENTS = [
    "melatonin",
    "valerian",
    "kava",
    "ashwagandha",
    "five_htp",
    "l_tryptophan",
    "cbd_sleep",
    "passionflower",
    "magnolia_bark",
    "selank"
  ];
  function safe021_breastfeeding(screening) {
    var status = screening.breastfeedingStatus || "not_applicable";
    var triggered = status === "exclusive" || status === "mixed";
    return {
      ruleCode: "SAFE-021",
      ruleName: "Lactancia materna",
      triggered: triggered,
      severity: triggered ? "restrict" : "clear",
      message: triggered ? "Lactancia " + (status === "exclusive" ? "exclusiva" : "mixta") + " detectada. Se bloquean suplementos que cruzan a leche materna: melatonina, valeriana, kava, ashwagandha, 5-HTP, L-tript\xF3fano, pasiflora, magnolia, CBD, selank. Solo se permiten intervenciones conductuales (higiene del sue\xF1o, TCC-I, relajaci\xF3n) y suplementos con perfil de seguridad en lactancia (magnesio, hierro si d\xE9ficit, vitaminas B)." : "Sin lactancia reportada.",
      action: triggered ? "RESTRINGIR: bloquear suplementos sin perfil de seguridad en lactancia. Conductuales y minerales/vitaminas b\xE1sicas permitidos." : "Continuar sin restricci\xF3n.",
      blockedRecommendations: triggered ? BREASTFEEDING_BLOCKED_SUPPLEMENTS : [],
      references: [
        "Hale TW. Medications and Mothers' Milk. 18th ed. Springer; 2023.",
        "Sachs HC et al. The transfer of drugs and therapeutics into human breast milk: an update on selected topics. Pediatrics. 2013;132(3):e795-e802."
      ]
    };
  }
  var SEVERITY_ORDER = ["clear", "warn", "restrict", "block"];
  function maxSeverityOf(results) {
    let max = "clear";
    for (const r of results) {
      if (SEVERITY_ORDER.indexOf(r.severity) > SEVERITY_ORDER.indexOf(max)) {
        max = r.severity;
      }
    }
    return max;
  }
  function evaluateAllSafetyRules(patient, screening, medications) {
    const rules = [
      safe010_ageMinimum(patient),
      safe020_pregnancy(screening),
      safe021_breastfeeding(screening),
      safe040_melatoninAnticoagulant(medications)
    ];
    const triggered = rules.filter((r) => r.triggered);
    const maxSev = maxSeverityOf(rules);
    const anyBlocking = rules.some((r) => r.severity === "block" && r.triggered);
    const anyRestricting = rules.some((r) => r.severity === "restrict" && r.triggered);
    const blockedCategories = [
      ...new Set(triggered.flatMap((r) => r.blockedRecommendations))
    ];
    let summary;
    if (triggered.length === 0) {
      summary = "Todas las reglas de seguridad superadas. Proceder con evaluaci\xF3n completa.";
    } else if (anyBlocking) {
      const blockingRules = triggered.filter((r) => r.severity === "block");
      summary = `BLOQUEO ACTIVO por ${blockingRules.map((r) => r.ruleCode).join(", ")}. ${blockingRules[0].action}`;
    } else {
      summary = `Restricciones activas: ${triggered.map((r) => r.ruleCode).join(", ")}. Evaluaci\xF3n permitida con limitaciones en recomendaciones.`;
    }
    return {
      rules,
      maxSeverity: maxSev,
      anyBlocking,
      anyRestricting,
      blockedCategories,
      summary
    };
  }

  // src/engine/phenotype.ts
  var ONSET_LATENCY_THRESHOLD = 30;
  var MAINTENANCE_AWAKENINGS_THRESHOLD = 2;
  var EARLY_AWAKENING_THRESHOLD = 30;
  var NORMAL_SLEEP_EFFICIENCY = 85;
  function sleepEfficiency(totalSleepHours, timeInBedHours) {
    if (timeInBedHours <= 0) return 0;
    return Math.round(totalSleepHours / timeInBedHours * 100 * 10) / 10;
  }
  function classifyInsomniaPhenotype(sleepData, isqTotalScore) {
    if (isqTotalScore < 8) {
      const se2 = sleepEfficiency(sleepData.totalSleepHours, sleepData.timeInBedHours);
      return {
        phenotype: "none",
        phenotypeLabel: "Sin insomnio cl\xEDnico",
        hasOnsetComponent: false,
        hasMaintenanceComponent: false,
        details: {
          sleepLatencyMinutes: sleepData.sleepLatencyMinutes,
          nightAwakenings: sleepData.nightAwakenings,
          earlyMorningAwakeningMinutes: sleepData.earlyMorningAwakeningMinutes,
          totalSleepHours: sleepData.totalSleepHours,
          sleepEfficiencyPercent: se2
        },
        clinicalNote: `ISQ = ${isqTotalScore} (<8). No se alcanza umbral cl\xEDnico de insomnio. Eficiencia del sue\xF1o: ${se2}%.`,
        reference: "AASM. ICSD-3. 2014."
      };
    }
    const hasOnset = sleepData.sleepLatencyMinutes >= ONSET_LATENCY_THRESHOLD;
    const hasMaintenance = sleepData.nightAwakenings >= MAINTENANCE_AWAKENINGS_THRESHOLD || sleepData.earlyMorningAwakeningMinutes >= EARLY_AWAKENING_THRESHOLD;
    let phenotype;
    let phenotypeLabel;
    if (hasOnset && hasMaintenance) {
      phenotype = "mixed";
      phenotypeLabel = "Insomnio mixto (inicio + mantenimiento)";
    } else if (hasOnset) {
      phenotype = "onset";
      phenotypeLabel = "Insomnio de inicio (dificultad para conciliar)";
    } else if (hasMaintenance) {
      phenotype = "maintenance";
      phenotypeLabel = "Insomnio de mantenimiento (despertares / despertar precoz)";
    } else {
      phenotype = "mixed";
      phenotypeLabel = "Insomnio inespec\xEDfico (ISQ elevado sin patr\xF3n dominante)";
    }
    const se = sleepEfficiency(sleepData.totalSleepHours, sleepData.timeInBedHours);
    const notes = [];
    if (hasOnset) notes.push(`Latencia de sue\xF1o ${sleepData.sleepLatencyMinutes} min (\u2265${ONSET_LATENCY_THRESHOLD})`);
    if (sleepData.nightAwakenings >= MAINTENANCE_AWAKENINGS_THRESHOLD) {
      notes.push(`${sleepData.nightAwakenings} despertares nocturnos (\u2265${MAINTENANCE_AWAKENINGS_THRESHOLD})`);
    }
    if (sleepData.earlyMorningAwakeningMinutes >= EARLY_AWAKENING_THRESHOLD) {
      notes.push(`Despertar precoz ${sleepData.earlyMorningAwakeningMinutes} min antes (\u2265${EARLY_AWAKENING_THRESHOLD})`);
    }
    if (se < NORMAL_SLEEP_EFFICIENCY) {
      notes.push(`Eficiencia del sue\xF1o baja: ${se}% (<${NORMAL_SLEEP_EFFICIENCY}%)`);
    }
    return {
      phenotype,
      phenotypeLabel,
      hasOnsetComponent: hasOnset,
      hasMaintenanceComponent: hasMaintenance,
      details: {
        sleepLatencyMinutes: sleepData.sleepLatencyMinutes,
        nightAwakenings: sleepData.nightAwakenings,
        earlyMorningAwakeningMinutes: sleepData.earlyMorningAwakeningMinutes,
        totalSleepHours: sleepData.totalSleepHours,
        sleepEfficiencyPercent: se
      },
      clinicalNote: `ISQ = ${isqTotalScore}. Fenotipo: ${phenotypeLabel}. ${notes.join(". ")}.`,
      reference: "AASM. ICSD-3. 2014."
    };
  }

  // src/engine/recommendations.ts
  var TREATMENT_DB = [
    // === CONDUCTUALES ===
    {
      id: "sleep_hygiene",
      name: "Sleep Hygiene Education",
      nameEs: "Higiene del sue\xF1o",
      category: "behavioral",
      priority: "primary",
      evidenceLevel: "A",
      description: "Conjunto de h\xE1bitos y pr\xE1cticas que promueven un sue\xF1o de calidad: horarios regulares, ambiente oscuro y fresco, evitar pantallas antes de dormir, limitar cafe\xEDna y alcohol. IMPORTANTE: la higiene del sue\xF1o sola es insuficiente como tratamiento del insomnio (Chung et al., Sleep, 2018). Siempre se prescribe combinada con TCC-I y/o suplementaci\xF3n dirigida.",
      duration: "Continua (h\xE1bito permanente)",
      contraindications: [],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Irish LA et al. J Clin Sleep Med. 2015;11(6):665-670."
    },
    {
      id: "cbt_i",
      name: "Cognitive Behavioral Therapy for Insomnia (CBT-I)",
      nameEs: "Terapia Cognitivo-Conductual para Insomnio (TCC-I)",
      category: "behavioral",
      priority: "primary",
      evidenceLevel: "A",
      description: "Tratamiento de primera l\xEDnea para insomnio cr\xF3nico. Incluye restricci\xF3n de sue\xF1o, control de est\xEDmulos, reestructuraci\xF3n cognitiva e higiene del sue\xF1o. Eficacia demostrada superior a farmacoterapia a largo plazo.",
      duration: "6-8 sesiones (puede ser presencial o digital)",
      contraindications: [],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Trauer JM et al. Ann Intern Med. 2015;163(3):191-204."
    },
    {
      id: "relaxation",
      name: "Relaxation Techniques",
      nameEs: "T\xE9cnicas de relajaci\xF3n",
      category: "behavioral",
      priority: "adjunctive",
      evidenceLevel: "B",
      description: "Relajaci\xF3n muscular progresiva, respiraci\xF3n diafragm\xE1tica y/o meditaci\xF3n mindfulness. Especialmente \xFAtiles para insomnio de inicio con componente de ansiedad.",
      timing: "15-20 minutos antes de acostarse",
      duration: "Pr\xE1ctica diaria continua",
      contraindications: [],
      phenotypeMatch: ["onset", "mixed"],
      reference: "Manzoni GM et al. J Clin Psychol. 2008;64(2):134-143."
    },
    // === SUPLEMENTOS ===
    {
      id: "melatonin",
      name: "Melatonin",
      nameEs: "Melatonina",
      category: "supplement",
      priority: "adjunctive",
      evidenceLevel: "A",
      description: "Hormona reguladora del ritmo circadiano. NO indicada para el tratamiento del insomnio. Su uso se reserva para: (1) adelantar el ritmo circadiano (fase de sue\xF1o retrasada) y (2) manejo del jet lag. Excepci\xF3n: en mayores de 55 a\xF1os, un m\xE9dico puede prescribir melatonina de liberaci\xF3n prolongada (2 mg) a modo de prueba (Lemoine P et al. J Sleep Res. 2007;16(4):372-380).",
      dosage: "0.5-3 mg de liberaci\xF3n r\xE1pida (circadiano/jetlag) \xF3 2 mg de liberaci\xF3n prolongada (\u226555 a\xF1os, solo con prescripci\xF3n m\xE9dica)",
      timing: "30-60 minutos antes de la hora objetivo de sue\xF1o",
      duration: "Circadiano: 2-4 semanas hasta ajuste. Jet lag: 3-5 d\xEDas. LP \u226555 a\xF1os: 13 semanas, luego reevaluar.",
      contraindications: ["anticoagulantes", "embarazo", "lactancia", "enfermedades autoinmunes", "insomnio primario (no circadiano)"],
      phenotypeMatch: ["onset", "mixed"],
      excludeFromInsomniaProtocol: true,
      reference: "Ferracioli-Oda E et al. PLoS One. 2013;8(5):e63773",
      marketplaceKeywords: ["melatonina", "melatonin", "suplemento sue\xF1o"]
    },
    {
      id: "magnesium",
      name: "Magnesium (Glycinate/Bisglycinate)",
      nameEs: "Magnesio (glicinato/bisglicinato)",
      category: "supplement",
      priority: "adjunctive",
      evidenceLevel: "B",
      description: "El magnesio participa en la regulaci\xF3n de GABA y melatonina. La forma glicinato tiene mejor biodisponibilidad y tolerancia GI. \xDAtil en insomnio de mantenimiento.",
      dosage: "200-400 mg de magnesio elemental",
      timing: "30-60 minutos antes de acostarse",
      duration: "8 semanas, luego reevaluar",
      contraindications: ["insuficiencia renal severa", "embarazo"],
      phenotypeMatch: ["maintenance", "mixed"],
      reference: "Abbasi B et al. J Res Med Sci. 2012;17(12):1161-1169.",
      marketplaceKeywords: ["magnesio glicinato", "magnesium glycinate", "magnesio bisglicinato"]
    },
    {
      id: "l_theanine",
      name: "L-Theanine",
      nameEs: "L-Teanina",
      category: "supplement",
      priority: "optional",
      evidenceLevel: "B",
      description: "Amino\xE1cido del t\xE9 verde que promueve relajaci\xF3n sin sedaci\xF3n. Aumenta actividad de ondas alfa. \xDAtil cuando hay ansiedad concomitante.",
      dosage: "200-400 mg",
      timing: "30-60 minutos antes de acostarse",
      duration: "4-8 semanas",
      contraindications: ["embarazo"],
      phenotypeMatch: ["onset", "mixed"],
      reference: "Hidese S et al. Nutrients. 2019;11(10):2362.",
      marketplaceKeywords: ["l-teanina", "l-theanine", "teanina"]
    },
    {
      id: "glycine",
      name: "Glycine",
      nameEs: "Glicina",
      category: "supplement",
      priority: "optional",
      evidenceLevel: "B",
      description: "Amino\xE1cido que reduce la temperatura corporal central facilitando el inicio del sue\xF1o. Mejora calidad subjetiva de sue\xF1o.",
      dosage: "3 g",
      timing: "1 hora antes de acostarse",
      duration: "4-8 semanas",
      contraindications: ["embarazo"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Bannai M et al. Sleep Biol Rhythms. 2012;10(1):75-81.",
      marketplaceKeywords: ["glicina", "glycine", "suplemento sue\xF1o"]
    },
    {
      id: "valerian",
      name: "Valerian Root Extract",
      nameEs: "Valeriana (extracto de raíz)",
      category: "supplement",
      priority: "optional",
      evidenceLevel: "B",
      description: "Extracto estandarizado de raíz de Valeriana officinalis. Actúa sobre receptores GABA-A facilitando el inicio y mantenimiento del sueño. Eficacia moderada como monoterapia, mejor en combinación con higiene del sueño.",
      dosage: "300-600 mg de extracto estandarizado (0.8% ácido valerénico)",
      timing: "30-60 minutos antes de acostarse",
      duration: "4-6 semanas para evaluar eficacia plena",
      contraindications: ["embarazo", "lactancia", "hepatopatía severa", "uso concomitante de benzodiazepinas"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Bent S et al. Valerian for sleep: A systematic review and meta-analysis. Am J Med. 2006;119(12):1005-1012.",
      marketplaceKeywords: ["valeriana", "valerian", "suplemento sueño"]
    },
    {
      id: "vitamin_d",
      name: "Vitamin D3 (Cholecalciferol)",
      nameEs: "Vitamina D3 (colecalciferol)",
      category: "supplement",
      priority: "optional",
      evidenceLevel: "B",
      description: "Suplementación indicada cuando los niveles séricos de 25(OH)D son <30 ng/mL. La deficiencia de vitamina D se asocia con mala calidad de sueño, menor duración y mayor latencia de sueño. No indicada si niveles son normales.",
      dosage: "1000-2000 UI/día (ajustar según nivel sérico)",
      timing: "Con la comida principal (mañana o mediodía, no noche)",
      duration: "8-12 semanas, luego reevaluar nivel sérico",
      contraindications: ["hipercalcemia", "sarcoidosis", "hiperparatiroidismo primario", "embarazo (requiere ajuste de dosis)"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      requiresLabConfirmation: true,
      labField: "vitD",
      labThreshold: 30,
      reference: "Gao Q et al. The association between vitamin D deficiency and sleep disorders: A systematic review and meta-analysis. Nutrients. 2018;10(10):1395.",
      marketplaceKeywords: ["vitamina d", "vitamin d", "colecalciferol"]
    },
    {
      id: "tryptophan",
      name: "L-Tryptophan",
      nameEs: "L-Triptófano",
      category: "supplement",
      priority: "optional",
      evidenceLevel: "B",
      description: "Aminoácido esencial precursor de serotonina y melatonina endógena. Aumenta la disponibilidad de serotonina cerebral, facilitando el inicio del sueño. Útil en insomnio de inicio con componente anímico.",
      dosage: "500-1000 mg",
      timing: "30-60 minutos antes de acostarse, con estómago vacío o con carbohidrato simple",
      duration: "4-8 semanas",
      contraindications: ["embarazo", "uso de ISRS/IRSN (riesgo síndrome serotoninérgico)", "uso de IMAO"],
      phenotypeMatch: ["onset", "mixed"],
      reference: "Silber BY, Schmitt JAJ. Effects of tryptophan loading on human cognition, mood, and sleep. Neurosci Biobehav Rev. 2010;34(3):387-407.",
      marketplaceKeywords: ["triptófano", "tryptophan", "5-htp", "serotonina sueño"]
    },
    {
      id: "ashwagandha",
      name: "Ashwagandha (Withania somnifera)",
      nameEs: "Ashwagandha (Withania somnifera)",
      category: "supplement",
      priority: "optional",
      evidenceLevel: "B",
      description: "Adaptógeno con withanólidos que reduce cortisol y estrés percibido, mejorando calidad y eficiencia del sueño. Especialmente útil cuando el insomnio tiene componente de estrés/ansiedad. Ensayo clínico doble ciego demostró mejora significativa en calidad de sueño vs placebo.",
      dosage: "300-600 mg de extracto estandarizado (≥5% withanólidos, KSM-66 o Sensoril)",
      timing: "Con la cena o 30-60 minutos antes de acostarse",
      duration: "8 semanas",
      contraindications: ["embarazo", "lactancia", "hipertiroidismo (puede potenciar hormona tiroidea)", "enfermedades autoinmunes activas"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Langade D et al. Efficacy and safety of Ashwagandha root extract in insomnia and anxiety: A double-blind, randomized, placebo-controlled study. Cureus. 2019;11(9):e5797.",
      marketplaceKeywords: ["ashwagandha", "withania", "adaptógeno sueño"]
    },
    // === FASE 1: SUPLEMENTOS NATURALES ===
    {
      id: "5_htp",
      name: "5-HTP (5-Hydroxytryptophan)",
      nameEs: "5-HTP (5-Hidroxitriptófano)",
      category: "supplement",
      priority: "optional",
      evidenceLevel: "C",
      description: "Metabolito intermedio entre L-triptófano y serotonina. Cruza la barrera hematoencefálica más eficientemente que el triptófano, aumentando síntesis de serotonina y melatonina endógena. Evidencia limitada pero consistente en mejoría de latencia de sueño.",
      dosage: "100-300 mg",
      timing: "30-60 minutos antes de acostarse, con estómago vacío",
      duration: "4-8 semanas, luego reevaluar",
      contraindications: ["embarazo", "lactancia", "uso de ISRS/IRSN (riesgo síndrome serotoninérgico)", "uso de IMAO", "uso de triptanos", "síndrome carcinoide"],
      phenotypeMatch: ["onset", "mixed"],
      reference: "Shell W et al. A randomized, placebo-controlled trial of an amino acid preparation on timing and quality of sleep. Am J Ther. 2010;17(2):133-139.",
      marketplaceKeywords: ["5-htp", "5-hidroxitriptófano", "serotonina sueño"]
    },
    {
      id: "gaba_oral",
      name: "GABA (Gamma-Aminobutyric Acid) Oral",
      nameEs: "GABA oral (Ácido gamma-aminobutírico)",
      category: "supplement",
      priority: "optional",
      evidenceLevel: "C",
      description: "Neurotransmisor inhibitorio principal del SNC. La biodisponibilidad oral es debatida (limitada penetración de la barrera hematoencefálica), pero estudios con formas biosintéticas (PharmaGABA) muestran reducción de latencia de sueño y aumento de sueño NREM. Mecanismo periférico vía sistema nervioso entérico es plausible.",
      dosage: "100-300 mg (preferiblemente PharmaGABA/forma biosintética)",
      timing: "30-60 minutos antes de acostarse",
      duration: "4-8 semanas",
      contraindications: ["embarazo", "lactancia", "uso concomitante de benzodiazepinas o barbitúricos (potenciación GABAérgica)"],
      phenotypeMatch: ["onset", "mixed"],
      reference: "Yamatsu A et al. Effect of oral γ-aminobutyric acid (GABA) administration on sleep and its absorption in humans. Food Sci Biotechnol. 2016;25(2):547-551.",
      marketplaceKeywords: ["gaba", "gaba oral", "pharmagaba", "ácido gamma-aminobutírico"]
    },
    {
      id: "apigenin",
      name: "Apigenin (Chamomile Flavonoid)",
      nameEs: "Apigenina (flavonoide de manzanilla)",
      category: "supplement",
      priority: "optional",
      evidenceLevel: "C",
      description: "Flavonoide predominante de Matricaria chamomilla. Actúa como modulador alostérico positivo de receptores GABA-A (sitio de unión a benzodiazepinas) sin efecto adictivo. Ansiolítico suave con efecto sedante dosis-dependiente. Estudios preclínicos robustos; evidencia clínica emergente.",
      dosage: "50-100 mg de apigenina aislada (equivalente a ~3-5 tazas de infusión de manzanilla)",
      timing: "30-60 minutos antes de acostarse",
      duration: "4-8 semanas",
      contraindications: ["embarazo", "alergia a Asteraceae/Compositae (manzanilla, ambrosía, crisantemo)", "uso de anticoagulantes (efecto antiplaquetario leve)"],
      phenotypeMatch: ["onset", "mixed"],
      reference: "Srivastava JK et al. Chamomile: A herbal medicine of the past with a bright future. Mol Med Rep. 2010;3(6):895-901.",
      marketplaceKeywords: ["apigenina", "apigenin", "manzanilla", "chamomile"]
    },
    {
      id: "phosphatidylserine",
      name: "Phosphatidylserine (PS)",
      nameEs: "Fosfatidilserina (PS)",
      category: "supplement",
      priority: "optional",
      evidenceLevel: "C",
      description: "Fosfolípido estructural de membranas neuronales. Modula la respuesta del eje HPA al estrés, reduciendo cortisol elevado. Útil cuando el insomnio se asocia a hipercortisolismo vespertino/nocturno. Mejora arquitectura del sueño al normalizar el perfil circadiano de cortisol.",
      dosage: "100-300 mg",
      timing: "Con la cena o 1 hora antes de acostarse",
      duration: "4-12 semanas",
      contraindications: ["embarazo", "lactancia", "uso de anticoagulantes (efecto sinérgico antiplaquetario)", "alergia a soja (si derivado de soja)"],
      phenotypeMatch: ["maintenance", "mixed"],
      reference: "Hellhammer J et al. Effects of soy lecithin phosphatidic acid and phosphatidylserine complex (PAS) on the endocrine and psychological responses to mental stress. Stress. 2004;7(2):119-126.",
      marketplaceKeywords: ["fosfatidilserina", "phosphatidylserine", "PS cortisol sueño"]
    },
    {
      id: "taurine",
      name: "Taurine",
      nameEs: "Taurina",
      category: "supplement",
      priority: "optional",
      evidenceLevel: "C",
      description: "Aminoácido sulfónico con actividad GABAérgica y glicinérgica. Actúa como agonista de receptores GABA-A y glicina en el SNC, promoviendo neurotransmisión inhibitoria. Reduce excitabilidad neuronal y facilita transición vigilia-sueño. Evidencia preclínica sólida; datos clínicos emergentes.",
      dosage: "1000-3000 mg",
      timing: "1-2 horas antes de acostarse",
      duration: "4-8 semanas",
      contraindications: ["embarazo", "lactancia", "enfermedad renal crónica severa (acumulación)"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "El Idrissi A et al. Taurine regulation of short term synaptic plasticity in fragile X mice. J Biomed Sci. 2010;17(Suppl 1):S15. + Zhang CG, Kim SJ. Taurine induces anti-anxiety by activating strychnine-sensitive glycine receptor in vivo. Ann Nutr Metab. 2007;51(4):379-386.",
      marketplaceKeywords: ["taurina", "taurine", "aminoácido sueño"]
    },
    {
      id: "l_ornithine",
      name: "L-Ornithine",
      nameEs: "L-Ornitina",
      category: "supplement",
      priority: "optional",
      evidenceLevel: "C",
      description: "Aminoácido no proteinogénico del ciclo de la urea. Reduce niveles de amoníaco circulante y cortisol. Ensayo clínico doble ciego mostró mejora significativa en calidad de sueño y reducción de fatiga matutina en trabajadores con estrés. Mecanismo: detoxificación de amoníaco + modulación del eje HPA.",
      dosage: "400-800 mg",
      timing: "Antes de acostarse",
      duration: "4-8 semanas",
      contraindications: ["embarazo", "lactancia", "insuficiencia renal severa", "hiperamonemia congénita (requiere supervisión médica)"],
      phenotypeMatch: ["maintenance", "mixed"],
      reference: "Miyake M et al. Randomised controlled trial of the effects of L-ornithine on stress markers and sleep quality in healthy workers. Nutr J. 2014;13:53.",
      marketplaceKeywords: ["l-ornitina", "l-ornithine", "ornitina sueño"]
    },
    // === FASE 2: MINERALES Y VITAMINAS ===
    {
      id: "zinc",
      name: "Zinc (Bisglycinate)",
      nameEs: "Zinc (bisglicinato)",
      category: "supplement",
      priority: "optional",
      evidenceLevel: "C",
      description: "Cofactor de la enzima AANAT (arilalquilamina N-acetiltransferasa), paso limitante en la síntesis de melatonina endógena. Deficiencia de zinc se asocia con menor calidad de sueño. La forma bisglicinato tiene mejor biodisponibilidad y menor irritación GI.",
      dosage: "15-30 mg de zinc elemental (como bisglicinato)",
      timing: "Con la cena (evitar estómago vacío)",
      duration: "8-12 semanas, luego reevaluar nivel sérico",
      contraindications: ["embarazo (>40 mg/día)", "enfermedad de Wilson", "uso crónico >40 mg/día sin cobre suplementario"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Cherasse Y, Urade Y. Dietary zinc acts as a sleep modulator. Int J Mol Sci. 2017;18(11):2334.",
      marketplaceKeywords: ["zinc", "zinc bisglicinato", "zinc sueño"]
    },
    {
      id: "iron",
      name: "Iron (Bisglycinate) — Conditional",
      nameEs: "Hierro (bisglicinato) — CONDICIONAL: solo si ferritina <75 ng/mL",
      category: "supplement",
      priority: "adjunctive",
      evidenceLevel: "A",
      description: "Cofactor de la tirosina hidroxilasa (síntesis de dopamina) y cofactor indirecto de la triptófano hidroxilasa (síntesis de serotonina). Deficiencia de hierro es la causa más frecuente de síndrome de piernas inquietas (SPI/RLS), que fragmenta el sueño. Umbral terapéutico IRLSSG: ferritina <75 ng/mL. Si ferritina <30: considerar hierro IV (carboximaltosa) si intolerancia oral. Suplementación oral: 25-50 mg hierro elemental + vitamina C 200 mg.",
      dosage: "25-50 mg de hierro elemental (como bisglicinato o sulfato ferroso) + 200 mg vitamina C",
      timing: "En ayunas o con vitamina C para mejorar absorción. Separar 2h de lácteos, café, té.",
      duration: "12 semanas, luego reevaluar ferritina. Objetivo: ferritina >75 ng/mL.",
      contraindications: ["hemocromatosis", "hemosiderosis", "talasemia mayor", "anemias no ferropénicas", "ferritina ≥75 ng/mL (no suplementar)"],
      phenotypeMatch: ["maintenance", "mixed"],
      requiresLabConfirmation: true,
      labField: "ferritin",
      labThreshold: 75,
      reference: "Allen RP et al. Restless legs syndrome prevalence and impact: REST general population study. Arch Intern Med. 2005;165(11):1286-1292. + Allen RP et al. Evidence-based and consensus clinical practice guidelines for the iron treatment of RLS/WED. Sleep Med. 2018;41:27-44. + IRLSSG Consensus: ferritin <75 ng/mL threshold.",
      marketplaceKeywords: ["hierro", "iron", "ferritina", "piernas inquietas"]
    },
    {
      id: "vitamin_b6",
      name: "Vitamin B6 (Pyridoxal-5'-Phosphate)",
      nameEs: "Vitamina B6 (P5P — piridoxal-5-fosfato)",
      category: "supplement",
      priority: "optional",
      evidenceLevel: "C",
      description: "Forma activa de vitamina B6. Cofactor esencial de: (1) AADC (conversión 5-HTP→serotonina y DOPA→dopamina), (2) GAD (conversión glutamato→GABA), (3) triptófano hidroxilasa. Sin B6 adecuado, la conversión de precursores a neurotransmisores del sueño es ineficiente.",
      dosage: "25-50 mg de P5P (forma activa, no piridoxina)",
      timing: "Con la cena",
      duration: "8-12 semanas",
      contraindications: ["neuropatía periférica preexistente (dosis >100 mg/día)", "embarazo (>100 mg/día)"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Lichstein KL et al. Vitamins and sleep: An exploratory study. Sleep Med. 2007;9(1):27-32. + Ebben M et al. Effects of pyridoxine on dreaming: a preliminary study. Percept Mot Skills. 2002;94(1):135-140.",
      marketplaceKeywords: ["vitamina b6", "p5p", "piridoxal fosfato"]
    },
    {
      id: "vitamin_b12",
      name: "Vitamin B12 (Methylcobalamin)",
      nameEs: "Vitamina B12 (metilcobalamina)",
      category: "supplement",
      priority: "optional",
      evidenceLevel: "C",
      description: "Cofactor de la metionina sintasa en el ciclo de metilación (homocisteína→metionina→SAMe). SAMe es donador de metilo para la síntesis de melatonina (HIOMT: N-acetilserotonina→melatonina). Deficiencia altera ritmo circadiano y calidad de sueño. Usar forma metilcobalamina (no cianocobalamina).",
      dosage: "500-1000 mcg de metilcobalamina",
      timing: "Con el desayuno o almuerzo (puede ser activante si se toma de noche)",
      duration: "8-12 semanas",
      contraindications: ["alergia a cobalamina", "enfermedad de Leber (neuropatía óptica hereditaria)"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Mayer G et al. Effects of vitamin B12 on performance and circadian rhythm in normal subjects. Neuropsychopharmacology. 1996;15(5):456-464. + Wang YC et al. Associations between vitamin B12 and sleep quality. J Gerontol A. 2024.",
      marketplaceKeywords: ["vitamina b12", "metilcobalamina", "b12 sueño"]
    },
    {
      id: "folate",
      name: "Folate (5-MTHF — Methylfolate)",
      nameEs: "Folato (5-MTHF — metilfolato)",
      category: "supplement",
      priority: "optional",
      evidenceLevel: "C",
      description: "Forma activa del folato. Cofactor del ciclo de metilación junto con B12. Necesario para regenerar tetrahidrobiopterina (BH4), cofactor esencial de triptófano hidroxilasa (TH) y tirosina hidroxilasa. Deficiencia compromete síntesis de serotonina y dopamina. Usar 5-MTHF (no ácido fólico) por mejor biodisponibilidad y no enmascarar déficit de B12.",
      dosage: "400-800 mcg de 5-MTHF",
      timing: "Con el desayuno (no es sedante)",
      duration: "8-12 semanas",
      contraindications: ["epilepsia (puede reducir umbral convulsivo en dosis >1 mg)", "déficit de B12 no corregido (enmascaramiento)"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Zhang R et al. Association between folate intake and sleep disorders: A systematic review and meta-analysis. BMC Med. 2025.",
      marketplaceKeywords: ["folato", "metilfolato", "5-mthf", "ácido fólico"]
    },
    {
      id: "selenium",
      name: "Selenium (Selenomethionine)",
      nameEs: "Selenio (selenometionina)",
      category: "supplement",
      priority: "optional",
      evidenceLevel: "C",
      description: "Oligoelemento esencial para glutatión peroxidasas y selenoproteínas. Deficiencia se asocia con dificultad para conciliar el sueño en datos epidemiológicos (NHANES). Mecanismo: protección antioxidante neuronal + modulación de inflamación sistémica que afecta calidad de sueño.",
      dosage: "55-100 mcg (como selenometionina)",
      timing: "Con la comida principal",
      duration: "8-12 semanas",
      contraindications: ["selenosis (ingesta >400 mcg/día)", "embarazo (no superar 60 mcg/día)"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Grandner MA et al. Dietary nutrients associated with short and long sleep duration. Data from a nationally representative sample. Appetite. 2013;64:71-80.",
      marketplaceKeywords: ["selenio", "selenium", "selenometionina"]
    },
    {
      id: "potassium",
      name: "Potassium (Citrate/Gluconate)",
      nameEs: "Potasio (citrato/gluconato)",
      category: "supplement",
      priority: "optional",
      evidenceLevel: "C",
      description: "Electrolito esencial para repolarización neuronal y relajación muscular. Hipopotasemia se asocia con calambres nocturnos y fragmentación del sueño. Datos epidemiológicos muestran asociación entre ingesta dietaria de potasio y mejor mantenimiento del sueño.",
      dosage: "99-200 mg suplementario (complementar con dieta rica en potasio)",
      timing: "Con la cena",
      duration: "8-12 semanas",
      contraindications: ["insuficiencia renal (riesgo hiperpotasemia)", "uso de IECA + espironolactona (monitorizar K+)", "hiperpotasemia preexistente"],
      phenotypeMatch: ["maintenance", "mixed"],
      reference: "Hornyak M et al. Magnesium therapy for periodic leg movements-related insomnia and restless legs syndrome: an open pilot study. Sleep. 1998;21(5):501-505. + Grandner MA et al. J Sleep Res. 2014.",
      marketplaceKeywords: ["potasio", "potassium", "electrolitos sueño"]
    },
    {
      id: "calcium",
      name: "Calcium (Citrate)",
      nameEs: "Calcio (citrato)",
      category: "supplement",
      priority: "optional",
      evidenceLevel: "C",
      description: "Cofactor en la producción de melatonina: el calcio es necesario para que el triptófano sea utilizado por el cerebro en la síntesis de melatonina. Estudios epidemiológicos asocian baja ingesta de calcio con dificultad para dormirse. La forma citrato tiene mejor absorción que carbonato y no requiere ácido gástrico.",
      dosage: "500-600 mg de calcio elemental (como citrato)",
      timing: "Con la cena o antes de dormir",
      duration: "8-12 semanas",
      contraindications: ["hipercalcemia", "hiperparatiroidismo", "sarcoidosis", "litiasis renal cálcica recurrente"],
      phenotypeMatch: ["onset", "mixed"],
      reference: "Grandner MA et al. Relationships among dietary nutrients and subjective sleep, objective sleep, and napping in women. Sleep Med. 2014;15(2):222-227.",
      marketplaceKeywords: ["calcio", "calcium", "calcio citrato sueño"]
    },
    // === FASE 3: FITOTERAPIA ===
    {
      id: "passionflower",
      name: "Passionflower (Passiflora incarnata)",
      nameEs: "Pasiflora (Passiflora incarnata)",
      category: "herbal",
      priority: "adjunctive",
      evidenceLevel: "B",
      description: "Fitoterapéutico con mecanismo GABAérgico dual: inhibición de la recaptación de GABA + modulación alostérica positiva de GABA-A (vía crisina y otros flavonoides). RCT doble ciego con PSG (n=110) demostró aumento significativo de tiempo total de sueño y eficiencia de sueño vs placebo. Monografía EMA/HMPC aprobada para 'alivio de síntomas leves de estrés mental y para conciliar el sueño'.",
      dosage: "250-500 mg de extracto estandarizado (equivalente a 0.5-2g de hierba seca)",
      timing: "30-60 minutos antes de acostarse",
      duration: "4-8 semanas",
      contraindications: ["embarazo (efecto uterotónico en modelos animales)", "lactancia", "uso concomitante de sedativos/benzodiazepinas (potenciación GABAérgica)", "cirugía programada (suspender 2 semanas antes por efecto sedante)"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Lee J et al. Effects of Passiflora incarnata Linnaeus on polysomnographic sleep parameters in subjects with insomnia disorder: a double-blind randomized placebo-controlled study. Int Clin Psychopharmacol. 2020;35(1):29-35.",
      marketplaceKeywords: ["pasiflora", "passionflower", "passiflora incarnata", "fitoterapia sueño"]
    },
    {
      id: "lavender_oral",
      name: "Oral Lavender (Silexan®/Lasea®)",
      nameEs: "Lavanda oral (Silexan®/Lasea®)",
      category: "herbal",
      priority: "adjunctive",
      evidenceLevel: "A",
      description: "Aceite esencial de Lavandula angustifolia en cápsulas de liberación entérica (Silexan® 80 mg). Mecanismo: inhibición de canales de calcio voltaje-dependientes (VDCC) + modulación de receptores NMDA y transportador de serotonina (SERT). Metaanálisis de 6 RCTs (n=2243) demuestra eficacia significativa en ansiedad y trastornos del sueño asociados. Aprobado en Alemania como medicamento fitoterapéutico.",
      dosage: "80 mg/día (1 cápsula Silexan®/Lasea®)",
      timing: "Con la cena o antes de acostarse (entérico, no masticar)",
      duration: "6-10 semanas",
      contraindications: ["embarazo", "lactancia", "alergia a Lamiaceae", "gastroparesia severa (cápsula entérica)"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Kasper S et al. Lavender oil preparation Silexan is effective in generalized anxiety disorder — a randomized, double-blind comparison to placebo and paroxetine. Int J Neuropsychopharmacol. 2014;17(6):859-869. + Kasper S et al. An orally administered lavandula oil preparation (Silexan) for anxiety disorder and related conditions: an evidence based review. Int J Psychiatry Clin Pract. 2017;22(4):247-261.",
      marketplaceKeywords: ["lavanda", "lavender", "silexan", "lasea", "aceite lavanda oral"]
    },
    {
      id: "lemon_balm",
      name: "Lemon Balm (Melissa officinalis)",
      nameEs: "Melisa / Toronjil (Melissa officinalis)",
      category: "herbal",
      priority: "optional",
      evidenceLevel: "B",
      description: "Fitoterapéutico de la familia Lamiaceae con actividad GABAérgica: inhibe GABA-transaminasa (enzima que degrada GABA), aumentando niveles sinápticos de GABA. Contiene ácido rosmarínico (ansiolítico) y flavonoides. RCT crossover reciente mostró reducción significativa de ISI (-2.9 puntos) y aumento de sueño de ondas lentas (SWS) del 15% en PSG. Monografía EMA/HMPC aprobada.",
      dosage: "300-600 mg de extracto estandarizado (o 1.5-4.5 g de hierba seca en infusión)",
      timing: "30-60 minutos antes de acostarse",
      duration: "4-8 semanas",
      contraindications: ["embarazo", "lactancia", "hipotiroidismo (puede interferir con TSH en dosis muy altas)", "alergia a Lamiaceae"],
      phenotypeMatch: ["onset", "mixed"],
      reference: "Di Pierro F et al. Melissa officinalis extract enriched for rosmarinic acid improves sleep quality in adults with insomnia symptoms: A randomized, crossover, placebo-controlled trial. Nutrients. 2024;16(15):2537.",
      marketplaceKeywords: ["melisa", "toronjil", "lemon balm", "melissa officinalis"]
    },
    {
      id: "hops",
      name: "Hops (Humulus lupulus)",
      nameEs: "Lúpulo (Humulus lupulus)",
      category: "herbal",
      priority: "optional",
      evidenceLevel: "C",
      description: "Inflorescencias femeninas del lúpulo contienen 2-metil-3-buten-2-ol (producto de degradación del ácido α-lupulónico) con actividad GABAérgica y melatoninérgica. Estudios in vitro demuestran unión a receptores GABA-A y melatonina MT1/MT2. Más efectivo en combinación con valeriana (sinergia demostrada en varios RCTs). Como monoterapia, evidencia limitada.",
      dosage: "300-500 mg de extracto estandarizado (o combinado con valeriana: 120-500 mg hops + 187-500 mg valeriana)",
      timing: "30-60 minutos antes de acostarse",
      duration: "4-8 semanas",
      contraindications: ["embarazo", "lactancia", "depresión (posible efecto depresogénico en uso crónico)", "tumores estrógeno-dependientes (fitoestrógenos: 8-prenilnaringenina)"],
      phenotypeMatch: ["onset", "mixed"],
      reference: "Salter S, Brownie S. Treating primary insomnia — the efficacy of valerian and hops. Aust Fam Physician. 2010;39(6):433-437. + Franco L et al. The sedative effects of hops (Humulus lupulus), a component of beer, on the activity/rest rhythm. Acta Physiol Hung. 2012;99(2):133-139.",
      marketplaceKeywords: ["lúpulo", "hops", "humulus lupulus", "valeriana lúpulo"]
    },
    {
      id: "rhodiola",
      name: "Rhodiola rosea",
      nameEs: "Rhodiola rosea (Raíz de oro)",
      category: "herbal",
      priority: "optional",
      evidenceLevel: "C",
      description: "Adaptógeno con mecanismo dual: modula el eje HPA (reduce cortisol elevado por estrés crónico) y actúa como inhibidor de MAO-A/B y COMT (aumentando biodisponibilidad de serotonina, dopamina y noradrenalina). No es sedante directo — mejora el sueño indirectamente al normalizar la respuesta al estrés y reducir la fatiga diurna. Útil en insomnio asociado a burnout/estrés crónico.",
      dosage: "200-400 mg de extracto estandarizado (3% rosavinas, 1% salidrosido)",
      timing: "Por la mañana o mediodía (NO por la noche — puede ser estimulante)",
      duration: "4-12 semanas",
      contraindications: ["embarazo", "lactancia", "trastorno bipolar (riesgo de manía)", "uso de IMAO (inhibición MAO aditiva)"],
      phenotypeMatch: ["maintenance", "mixed"],
      reference: "Olsson EM et al. A randomised, double-blind, placebo-controlled, parallel-group study of the standardised extract SHR-5 of the roots of Rhodiola rosea in the treatment of subjects with stress-related fatigue. Planta Med. 2009;75(2):105-112.",
      marketplaceKeywords: ["rhodiola", "rhodiola rosea", "raíz de oro", "adaptógeno sueño"]
    },
    {
      id: "holy_basil",
      name: "Holy Basil (Tulsi)",
      nameEs: "Tulsi (Albahaca sagrada)",
      category: "herbal",
      priority: "optional",
      evidenceLevel: "B",
      description: "Adaptógeno con propiedades ansiolíticas y anti-estrés demostradas. Contiene ocimumósidos A y B, ácido rosmarínico y eugenol. Modula el eje HPA reduciendo cortisol sérico. RCT doble ciego (n=158) demostró reducción significativa de estrés, ansiedad y depresión vs placebo. Mejora secundaria en calidad de sueño mediada por la reducción del arousal simpático. Revisión sistemática (Jamshidi & Cohen, 2017) confirma eficacia clínica con perfil de seguridad favorable.",
      dosage: "300-600 mg de extracto estandarizado (OciBest® o equivalente), 2 veces/día o dosis única nocturna",
      timing: "Con la cena o 1 hora antes de acostarse",
      duration: "6-8 semanas para evaluar respuesta",
      contraindications: ["anticoagulantes (eugenol inhibe agregación plaquetaria)", "embarazo (efecto uterotónico)", "lactancia", "hipotiroidismo (puede reducir T4)", "fertilidad masculina (puede reducir recuento espermático en dosis altas)", "cirugía programada (suspender 2 semanas antes)"],
      phenotypeMatch: ["onset", "mixed"],
      reference: "Saxena RC et al. Efficacy of an Extract of Ocimum tenuiflorum (OciBest) in the Management of General Stress: A Double-Blind, Placebo-Controlled Study. J Ayurveda Integr Med. 2012;3(2):65-71. + Jamshidi N, Cohen MM. The Clinical Efficacy and Safety of Tulsi in Humans: A Systematic Review of the Literature. Evid Based Complement Alternat Med. 2017;2017:9217567.",
      marketplaceKeywords: ["tulsi", "holy basil", "albahaca sagrada", "adaptógeno", "ocimum sanctum"]
    },
    // === FASE 4: TÉCNICAS MENTE-CUERPO ===
    {
      id: "meditation",
      name: "Mindfulness Meditation",
      nameEs: "Meditación mindfulness",
      category: "mind_body",
      priority: "adjunctive",
      evidenceLevel: "A",
      description: "RCT en JAMA Internal Medicine (n=49) demostró que un programa de 6 semanas de Mindful Awareness Practices (MAPs) mejoró significativamente la calidad del sueño (PSQI) vs higiene del sueño sola. Metaanálisis posteriores (n>2000) confirman efecto moderado-grande en insomnio. Mecanismo: reducción de arousal cognitivo pre-sueño, regulación del sistema nervioso autónomo (↑tono vagal), reducción de actividad de la amígdala medida por fMRI.",
      dosage: "10-20 minutos diarios (programa estructurado de 6-8 semanas)",
      timing: "Preferiblemente por la tarde o 1-2 horas antes de acostarse. También útil al despertar.",
      duration: "6-8 semanas para efecto terapéutico; mantener como práctica continua",
      contraindications: ["psicosis activa", "TEPT severo no tratado (puede desencadenar flashbacks)", "despersonalización/desrealización severa"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Black DS et al. Mindfulness meditation and improvement in sleep quality and daytime impairment among older adults with sleep disturbances: a randomized clinical trial. JAMA Intern Med. 2015;175(4):494-501.",
      marketplaceKeywords: ["meditación", "mindfulness", "atención plena", "meditación sueño"]
    },
    {
      id: "yoga_nidra",
      name: "Yoga / Yoga Nidra",
      nameEs: "Yoga / Yoga Nidra",
      category: "mind_body",
      priority: "adjunctive",
      evidenceLevel: "B",
      description: "Yoga Nidra ('sueño yóguico') es una técnica de relajación guiada en posición supina que induce un estado entre vigilia y sueño (theta/delta en EEG). Metaanálisis de 19 RCTs (n>1800) demuestran mejora significativa de calidad de sueño. Mecanismo: activación parasimpática (↓cortisol, ↓frecuencia cardíaca), reducción de arousal simpático. El yoga general (Hatha, Iyengar) también mejora sueño pero con efecto menor que Yoga Nidra específicamente.",
      dosage: "20-45 minutos por sesión, 3-5 veces por semana",
      timing: "Antes de acostarse (Yoga Nidra) o tarde/noche (yoga general)",
      duration: "8 semanas para efecto terapéutico completo",
      contraindications: ["lesiones articulares activas (para posturas físicas)", "hipertensión intracraneal (inversiones)", "embarazo avanzado (ciertas posturas)"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Wang WL et al. The effect of yoga on sleep quality and insomnia in women with sleep problems: a systematic review and meta-analysis. BMC Psychiatry. 2020;20(1):195.",
      marketplaceKeywords: ["yoga", "yoga nidra", "yoga sueño", "relajación guiada"]
    },
    {
      id: "tai_chi",
      name: "Tai Chi",
      nameEs: "Tai Chi",
      category: "mind_body",
      priority: "optional",
      evidenceLevel: "B",
      description: "Arte marcial meditativo de bajo impacto que combina movimientos lentos, respiración controlada y atención plena. RCT en adultos mayores (n=112) demostró mejora significativa en PSQI vs control. Metaanálisis confirma efecto moderado en calidad de sueño, especialmente en >55 años. Mecanismo: modulación del sistema nervioso autónomo, reducción de citoquinas pro-inflamatorias (IL-6, TNF-α), regulación del eje HPA.",
      dosage: "30-60 minutos por sesión, 3 veces por semana",
      timing: "Mañana o tarde (no antes de acostarse — requiere concentración activa)",
      duration: "16-25 semanas para efecto óptimo",
      contraindications: ["fracturas activas", "vértigo severo no controlado", "artritis severa (adaptar movimientos)"],
      phenotypeMatch: ["maintenance", "mixed"],
      reference: "Irwin MR et al. Improving sleep quality in older adults with moderate sleep complaints: A randomized controlled trial of Tai Chi Chih. Sleep. 2008;31(7):1001-1008.",
      marketplaceKeywords: ["tai chi", "taichi", "tai chi chuan", "ejercicio meditativo"]
    },
    {
      id: "diaphragmatic_breathing",
      name: "Diaphragmatic Breathing",
      nameEs: "Respiración diafragmática",
      category: "mind_body",
      priority: "adjunctive",
      evidenceLevel: "B",
      description: "Técnica de respiración lenta y profunda (6-8 respiraciones/minuto) que activa el nervio vago, aumentando tono parasimpático y reduciendo arousal simpático. Reduce frecuencia cardíaca, presión arterial y cortisol. Incluye técnicas como respiración 4-7-8 (Weil), respiración cuadrada (box breathing), y coherencia cardíaca. Múltiples RCTs demuestran reducción de latencia de sueño y mejoría en calidad subjetiva.",
      dosage: "5-15 minutos, 6-8 respiraciones/minuto",
      timing: "En la cama, inmediatamente antes de dormir",
      duration: "Efecto inmediato; mantener como hábito diario",
      contraindications: ["trastorno de pánico (puede inducir hiperventilación paradójica al inicio)", "EPOC severo (adaptar frecuencia)"],
      phenotypeMatch: ["onset", "mixed"],
      reference: "Jerath R et al. Physiology of long pranayamic breathing: neural respiratory elements may provide a mechanism that explains how slow deep breathing shifts the autonomic nervous system. Med Hypotheses. 2006;67(3):566-571. + Ma X et al. The effect of diaphragmatic breathing on attention, negative affect and stress in healthy adults. Front Psychol. 2017;8:874.",
      marketplaceKeywords: ["respiración", "respiración diafragmática", "4-7-8", "box breathing", "coherencia"]
    },
    {
      id: "cardiac_coherence",
      name: "Cardiac Coherence",
      nameEs: "Coherencia cardíaca",
      category: "mind_body",
      priority: "optional",
      evidenceLevel: "B",
      description: "Técnica de biofeedback respiratorio que sincroniza variabilidad de frecuencia cardíaca (HRV) con la respiración a 0.1 Hz (~6 respiraciones/minuto). Maximiza la amplitud de la arritmia sinusal respiratoria, activando el barorreflejo. Aumenta tono parasimpático y reduce cortisol. Aplicación práctica del protocolo '365': 3 veces/día, 6 respiraciones/minuto, 5 minutos por sesión.",
      dosage: "5 minutos por sesión, 2-3 veces al día (protocolo 365)",
      timing: "Al despertar + antes de dormir + una sesión adicional (mediodía)",
      duration: "4-8 semanas para efecto estable sobre HRV basal",
      contraindications: ["arritmias cardíacas significativas (FA, flutter)", "marcapasos dependiente"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Laborde S et al. Heart rate variability and cardiac vagal tone in psychophysiological research — recommendations for experiment planning, data analysis, and data reporting. Front Psychol. 2017;8:213.",
      marketplaceKeywords: ["coherencia cardíaca", "HRV", "variabilidad cardíaca", "biofeedback respiratorio"]
    },
    {
      id: "progressive_relaxation",
      name: "Progressive Muscle Relaxation (PMR)",
      nameEs: "Relajación muscular progresiva (Jacobson)",
      category: "mind_body",
      priority: "adjunctive",
      evidenceLevel: "A",
      description: "Técnica de tensión-relajación secuencial de 16 grupos musculares desarrollada por Jacobson. Metaanálisis (n>3000) confirma efecto grande en reducción de ansiedad somática y efecto moderado-grande en mejora de calidad de sueño. Reduce arousal fisiológico (EMG, conductancia cutánea, cortisol) y facilita transición vigilia-sueño. Componente estándar de protocolos de TCC-I.",
      dosage: "15-25 minutos por sesión (versión abreviada: 10 minutos, 7 grupos musculares)",
      timing: "En la cama, antes de dormir",
      duration: "2-4 semanas para dominar la técnica; efecto sostenido con práctica regular",
      contraindications: ["lesiones musculoesqueléticas activas (adaptar grupos musculares afectados)", "dolor crónico severo (puede exacerbar al tensar)"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Manzoni GM et al. Relaxation training for anxiety: a ten-years systematic review with meta-analysis. BMC Psychiatry. 2008;8:41. + Seo E, Kim S. Effect of autogenic training for stress response: a systematic review and meta-analysis. J Korean Acad Nurs. 2019;49(4):361-373.",
      marketplaceKeywords: ["relajación muscular", "relajación progresiva", "jacobson", "PMR", "tensión relajación"]
    },
    {
      id: "guided_visualization",
      name: "Guided Imagery / Visualization",
      nameEs: "Visualización guiada / Imaginería",
      category: "mind_body",
      priority: "optional",
      evidenceLevel: "B",
      description: "Técnica cognitiva que reemplaza rumiación pre-sueño con imágenes mentales placenteras y multisensoriales (paisajes, sensaciones corporales). RCTs muestran reducción de latencia de sueño y menor actividad cognitiva intrusiva. Mecanismo: competición atencional — la imaginería visual ocupa recursos cognitivos que de otro modo alimentarían la rumiación. Útil como complemento de TCC-I.",
      dosage: "10-20 minutos por sesión (audio guiado o auto-dirigida)",
      timing: "En la cama, como técnica de onset de sueño",
      duration: "2-4 semanas para aprender; usar a demanda después",
      contraindications: ["TEPT (puede evocar imágenes traumáticas si no es guiada cuidadosamente)", "psicosis activa"],
      phenotypeMatch: ["onset", "mixed"],
      reference: "Lund HG et al. The effectiveness of a relaxation/guided imagery intervention on insomnia-related outcomes. Psychooncology. 2015;24(2):223-226. + Harvey AG, Payne S. The management of unwanted pre-sleep thoughts in insomnia: distraction with imagery versus general distraction. Behav Res Ther. 2002;40(3):267-277.",
      marketplaceKeywords: ["visualización", "imaginería", "visualización guiada", "imágenes mentales sueño"]
    },
    {
      id: "autogenic_training",
      name: "Autogenic Training",
      nameEs: "Entrenamiento autógeno (Schultz)",
      category: "mind_body",
      priority: "optional",
      evidenceLevel: "B",
      description: "Técnica de autosugestión sistemática desarrollada por Schultz que utiliza frases de pesadez y calor corporal para inducir relajación profunda. Metaanálisis (60 estudios) confirma efecto moderado en ansiedad e insomnio. Las 6 fórmulas estándar inducen cambios fisiológicos medibles: vasodilatación periférica (manos calientes), ↓FC, ↓FR, ↓EMG. Requiere más entrenamiento que PMR pero produce relajación más profunda a largo plazo.",
      dosage: "10-15 minutos por sesión, 1-2 veces al día",
      timing: "Antes de dormir (sesión principal) + opcional al mediodía",
      duration: "6-10 semanas para dominar las 6 fórmulas; efecto terapéutico a partir de semana 4",
      contraindications: ["psicosis activa", "epilepsia no controlada (la focalización somática puede inducir fenómenos)", "hipotensión severa (la vasodilatación puede exacerbar)"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Stetter F, Kupper S. Autogenic training: a meta-analysis of clinical outcome studies. Appl Psychophysiol Biofeedback. 2002;27(1):45-98.",
      marketplaceKeywords: ["entrenamiento autógeno", "schultz", "autosugestión", "pesadez calor"]
    },
    {
      id: "body_scan",
      name: "Body Scan Meditation",
      nameEs: "Escaneo corporal (body scan)",
      category: "mind_body",
      priority: "optional",
      evidenceLevel: "B",
      description: "Práctica de atención plena focalizada que recorre secuencialmente las sensaciones de cada parte del cuerpo sin juzgar. Componente central de MBSR (Mindfulness-Based Stress Reduction) de Kabat-Zinn. Estudios muestran reducción de arousal somático y cognitivo, facilitando la transición al sueño. Activa la ínsula y corteza somatosensorial, redirigiendo atención de rumiación a sensaciones corporales.",
      dosage: "15-30 minutos (versión completa) o 5-10 minutos (versión abreviada)",
      timing: "En la cama, como técnica de onset de sueño",
      duration: "4-8 semanas de práctica regular",
      contraindications: ["dolor crónico severo (puede aumentar awareness del dolor al inicio)", "despersonalización severa"],
      phenotypeMatch: ["onset", "mixed"],
      reference: "Ditto B et al. Short-term meditation training can improve perceived stress and negative mood. Stress Health. 2006;22(3):189-196. + Kabat-Zinn J. Full Catastrophe Living: Using the Wisdom of Your Body and Mind to Face Stress, Pain, and Illness. Revised ed. Bantam Books; 2013.",
      marketplaceKeywords: ["body scan", "escaneo corporal", "mindfulness cuerpo", "MBSR"]
    },
    {
      id: "biofeedback",
      name: "Biofeedback",
      nameEs: "Biofeedback",
      category: "mind_body",
      priority: "optional",
      evidenceLevel: "B",
      description: "Técnica instrumental que proporciona retroalimentación en tiempo real de señales fisiológicas (EMG, temperatura, EEG, HRV) para entrenar autorregulación. EMG-biofeedback frontal y neurofeedback (SMR, 12-15 Hz) son las modalidades más estudiadas para insomnio. Metaanálisis muestra efecto moderado, comparable a relajación pero con mayor especificidad neurofisiológica. Requiere equipamiento y terapeuta entrenado.",
      dosage: "30-45 minutos por sesión, 1-2 veces por semana",
      timing: "Sesiones diurnas en consultorio; práctica de habilidades en casa antes de dormir",
      duration: "8-20 sesiones (2-5 meses)",
      contraindications: ["epilepsia no controlada (neurofeedback)", "trastornos disociativos severos"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Morin CM et al. Nonpharmacologic interventions for insomnia: a meta-analysis of treatment efficacy. Am J Psychiatry. 1994;151(8):1172-1180. + Cortoos A et al. Neurofeedback for insomnia: a pilot study of Z-score SMR and individualized protocols. Appl Psychophysiol Biofeedback. 2010;35(1):29-35.",
      marketplaceKeywords: ["biofeedback", "neurofeedback", "EMG", "HRV biofeedback", "autorregulación"]
    },
    // === FASE 5: TERAPIAS CONDUCTUALES EXTENDIDAS ===
    {
      id: "sleep_restriction",
      name: "Sleep Restriction Therapy (SRT)",
      nameEs: "Terapia de restricción del sueño",
      category: "behavioral",
      priority: "primary",
      evidenceLevel: "A",
      description: "Componente central de TCC-I. Limita el tiempo en cama (TIB) al tiempo total de sueño reportado (nunca <5h), creando una deuda de sueño leve que consolida el sueño e incrementa la presión homeostática. A medida que la eficiencia de sueño supera 85%, se aumenta TIB en 15-30 min/semana. Metaanálisis confirma que SRT sola tiene tamaño de efecto grande (d=0.84) comparable a TCC-I completa. Es la intervención conductual más potente para insomnio.",
      dosage: "Ajuste semanal de ventana de sueño según eficiencia (>85%→+15min, <80%→-15min)",
      timing: "Implementar con hora fija de despertar; ajustar hora de acostarse",
      duration: "4-8 semanas para optimizar ventana; mantener hora fija de despertar indefinidamente",
      contraindications: ["epilepsia (privación de sueño baja umbral convulsivo)", "trastorno bipolar (puede desencadenar manía)", "apnea del sueño no tratada (>5h TIB mínimo)", "conducción de vehículos/maquinaria pesada en fase inicial (somnolencia transitoria)"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Miller CB et al. The evidence base of sleep restriction therapy for treating insomnia disorder. Sleep Med Rev. 2014;18(5):415-424. + Spielman AJ et al. A behavioral perspective on insomnia treatment. Psychiatr Clin North Am. 1987;10(4):541-553.",
      marketplaceKeywords: ["restricción sueño", "sleep restriction", "TCC-I", "ventana de sueño"]
    },
    {
      id: "stimulus_control",
      name: "Stimulus Control Therapy",
      nameEs: "Terapia de control de estímulos",
      category: "behavioral",
      priority: "primary",
      evidenceLevel: "A",
      description: "Componente central de TCC-I desarrollado por Bootzin. Reasociar la cama/dormitorio exclusivamente con sueño y actividad sexual. Reglas: (1) Ir a la cama solo con sueño, (2) Si no se duerme en ~15-20 min, levantarse e ir a otra habitación, (3) Repetir hasta dormirse, (4) Hora fija de despertar, (5) No siestas, (6) Cama solo para dormir/sexo. Metaanálisis confirma eficacia como monoterapia (d=0.81). Rompe el condicionamiento cama-vigilia-frustración.",
      dosage: "Aplicar las 6 reglas consistentemente cada noche",
      timing: "Desde la primera noche de implementación",
      duration: "2-4 semanas para romper condicionamiento; mantener reglas indefinidamente",
      contraindications: ["caídas (adultos mayores levantándose de noche — adaptar con luz nocturna)", "movilidad reducida severa"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Bootzin RR, Perlis ML. Stimulus control therapy. In: Behavioral Treatments for Sleep Disorders. Academic Press; 2011:21-30. + Morin CM et al. Cognitive behavioral therapy, singly and combined with medication, for persistent insomnia: a randomized controlled trial. JAMA. 2009;301(19):2005-2015.",
      marketplaceKeywords: ["control estímulos", "stimulus control", "TCC-I", "condicionamiento cama"]
    },
    {
      id: "cognitive_restructuring",
      name: "Cognitive Restructuring for Insomnia",
      nameEs: "Reestructuración cognitiva para insomnio",
      category: "behavioral",
      priority: "adjunctive",
      evidenceLevel: "A",
      description: "Componente cognitivo de TCC-I. Identifica y modifica creencias disfuncionales sobre el sueño (DBAS: Dysfunctional Beliefs and Attitudes about Sleep). Pensamientos típicos: 'Si no duermo 8 horas no puedo funcionar', 'El insomnio va a destruir mi salud', 'Necesito pastillas para dormir'. Técnicas: registro de pensamientos, evidencia a favor/contra, reatribución, descatastrofización. Reduce arousal cognitivo pre-sueño medido por Pre-Sleep Arousal Scale.",
      dosage: "1 sesión semanal (45-60 min) + registro diario de pensamientos",
      timing: "Sesiones diurnas; registro por la noche antes de acostarse",
      duration: "6-8 semanas (dentro de protocolo TCC-I)",
      contraindications: ["deterioro cognitivo severo (no puede hacer reestructuración)", "psicosis activa"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Harvey AG et al. Cognitive behaviour therapy for primary insomnia: can we rest yet? Sleep Med Rev. 2002;6(2):89-104. + Morin CM. Cognitive-behavioral approaches to the treatment of insomnia. J Clin Psychiatry. 2004;65(Suppl 16):33-40.",
      marketplaceKeywords: ["reestructuración cognitiva", "pensamientos sueño", "DBAS", "TCC-I cognitivo"]
    },
    {
      id: "paradoxical_intention",
      name: "Paradoxical Intention",
      nameEs: "Intención paradójica",
      category: "behavioral",
      priority: "optional",
      evidenceLevel: "B",
      description: "Técnica paradójica: se instruye al paciente a intentar mantenerse despierto (sin usar pantallas ni actividades estimulantes) en lugar de esforzarse por dormir. Rompe el ciclo de ansiedad de rendimiento del sueño ('performance anxiety'). Al eliminar el esfuerzo por dormir, se reduce el arousal asociado al intento. RCTs muestran reducción significativa de latencia de sueño, especialmente en insomnio de inicio con alta ansiedad anticipatoria.",
      dosage: "Aplicar al acostarse: mantener ojos abiertos en oscuridad, sin esforzarse por dormir",
      timing: "Al acostarse, cuando no llega el sueño",
      duration: "2-4 semanas",
      contraindications: ["depresión mayor activa (puede interpretar la técnica negativamente)", "pacientes que no toleran paradoja (bajo insight)"],
      phenotypeMatch: ["onset"],
      reference: "Broomfield NM, Espie CA. Initial insomnia and paradoxical intention: an experimental investigation of putative mechanisms using subjective and actigraphic measurement of sleep. Behav Cogn Psychother. 2003;31(3):313-324.",
      marketplaceKeywords: ["intención paradójica", "paradoxical intention", "ansiedad sueño", "dejar de intentar dormir"]
    },
    {
      id: "chronobiology",
      name: "Behavioral Chronobiology",
      nameEs: "Cronobiología conductual",
      category: "behavioral",
      priority: "optional",
      evidenceLevel: "B",
      description: "Intervenciones basadas en el ritmo circadiano: exposición a luz matutina (>2500 lux, 30 min), restricción de luz vespertina, regularidad de horarios de comidas y ejercicio como Zeitgebers (sincronizadores). Útil en trastornos del ritmo circadiano (DSWPD, ASWPD) y como complemento en insomnio con componente circadiano. El Social Rhythm Metric (SRM) permite cuantificar regularidad circadiana.",
      dosage: "Protocolo de regularidad: misma hora de despertar ±30 min, luz matutina 30 min, comidas regulares",
      timing: "Todo el día: luz AM, restricción luz PM, horarios fijos",
      duration: "4-8 semanas para restablecer ritmo; mantener indefinidamente",
      contraindications: ["fotosensibilidad (adaptación de fototerapia)", "retinopatía (evitar luz brillante directa)"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Adan A et al. Circadian typology: a comprehensive review. Chronobiol Int. 2012;29(9):1153-1175. + Monk TH et al. The Social Rhythm Metric: an instrument to quantify the daily rhythms of life. J Nerv Ment Dis. 1990;178(2):120-126.",
      marketplaceKeywords: ["cronobiología", "ritmo circadiano", "zeitgeber", "luz matutina", "cronotipos"]
    },
    {
      id: "act_therapy",
      name: "Acceptance and Commitment Therapy for Insomnia (ACT-I)",
      nameEs: "Terapia de aceptación y compromiso para insomnio (ACT-I)",
      category: "behavioral",
      priority: "optional",
      evidenceLevel: "B",
      description: "Adaptación de ACT al insomnio. En lugar de intentar controlar el sueño (como en TCC-I clásica), promueve aceptación de la experiencia de insomnio, defusión cognitiva (distanciarse de pensamientos sobre sueño), y compromiso con valores (funcionar a pesar del mal sueño). RCTs muestran eficacia comparable a TCC-I en algunos outcomes, especialmente en pacientes que no responden a TCC-I clásica o con alta evitación experiencial.",
      dosage: "1 sesión semanal (60 min) + ejercicios de mindfulness y valores",
      timing: "Sesiones diurnas",
      duration: "6-8 semanas",
      contraindications: ["deterioro cognitivo severo", "dificultad para comprender conceptos abstractos (simplificar ejercicios)"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Dalrymple KL et al. Treating insomnia with acceptance and commitment therapy. Cogn Behav Pract. 2010;17(4):332-343. + Hertenstein E et al. Mindfulness-based cognitive therapy for insomnia: a systematic review and meta-analysis. Sleep Med Rev. 2022;65:101673.",
      marketplaceKeywords: ["ACT", "aceptación compromiso", "ACT insomnia", "defusión cognitiva sueño"]
    },
    {
      id: "mbti",
      name: "Mindfulness-Based Therapy for Insomnia (MBTI)",
      nameEs: "Terapia basada en mindfulness para insomnio (MBTI)",
      category: "behavioral",
      priority: "optional",
      evidenceLevel: "B",
      description: "Integración de MBSR (Kabat-Zinn) con componentes conductuales de TCC-I (restricción del sueño + control de estímulos). Programa de 8 semanas con meditación, body scan, yoga suave + estrategias conductuales. RCT (n=54) mostró mejora significativa en ISI, tiempo total de sueño, y reducción de arousal pre-sueño. Especialmente útil en insomnio con alta rumiación y comorbilidad ansiosa.",
      dosage: "1 sesión grupal semanal (2h) + práctica diaria en casa (30-45 min)",
      timing: "Sesiones diurnas; práctica en casa tarde/noche",
      duration: "8 semanas (programa estructurado)",
      contraindications: ["psicosis activa", "TEPT severo no tratado", "dificultad para compromiso de práctica diaria"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Ong JC et al. A randomized controlled trial of mindfulness meditation for chronic insomnia. Sleep. 2014;37(9):1553-1563.",
      marketplaceKeywords: ["MBTI", "mindfulness insomnio", "MBSR sueño", "terapia mindfulness"]
    },
    {
      id: "brief_behavioral",
      name: "Brief Behavioral Treatment for Insomnia (BBTI)",
      nameEs: "Terapia conductual breve para insomnio (BBTI)",
      category: "behavioral",
      priority: "optional",
      evidenceLevel: "B",
      description: "Versión abreviada de TCC-I (4 sesiones en lugar de 6-8) que incluye solo los componentes conductuales: restricción del sueño + control de estímulos + higiene del sueño. Sin componente cognitivo. RCT en JAMA Internal Medicine (n=79) mostró eficacia significativa en adultos mayores. Ideal para atención primaria, pacientes con limitaciones de tiempo, o como primer escalón antes de TCC-I completa.",
      dosage: "4 sesiones (1 presencial + 3 telefónicas) de 15-20 min cada una, cada 2 semanas",
      timing: "Sesiones durante el día; implementación de reglas conductuales por la noche",
      duration: "8 semanas (4 sesiones cada 2 semanas)",
      contraindications: ["mismas que restricción del sueño: epilepsia, bipolar, apnea no tratada"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Buysse DJ et al. Efficacy of brief behavioral treatment for chronic insomnia in older adults. Arch Intern Med. 2011;171(10):887-895.",
      marketplaceKeywords: ["BBTI", "terapia breve", "conductual breve", "TCC-I abreviada"]
    },
    // === FASE 6: HIGIENE DEL SUEÑO EXPANDIDA ===
    {
      id: "sleep_schedule",
      name: "Regular Sleep Schedule",
      nameEs: "Horario regular de sueño",
      category: "behavioral",
      priority: "primary",
      evidenceLevel: "A",
      description: "Mantener horarios consistentes de acostarse y despertar (±30 min) los 7 días de la semana, incluyendo fines de semana. La irregularidad de horario (social jet lag) desincroniza el oscilador circadiano central (NSQ) de los osciladores periféricos. Metaanálisis demuestra que la variabilidad intra-individual del horario de sueño se asocia con peor salud metabólica, mayor IMC, peor calidad de sueño y mayor riesgo cardiovascular.",
      dosage: "Fijar hora de despertar ±30 min todos los días. La hora de acostarse se ajusta según necesidad de sueño.",
      timing: "Todos los días, sin excepción en fines de semana",
      duration: "Indefinida (hábito permanente). Efecto en 2-4 semanas.",
      contraindications: ["trabajo por turnos (requiere protocolo cronobiológico específico)", "adolescentes con DSWPD (ajustar según cronotipo)"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Irish LA et al. The role of sleep hygiene in promoting public health: A review of empirical evidence. Sleep Med Rev. 2015;22:23-36. + Phillips AJK et al. Irregular sleep/wake patterns are associated with poorer academic performance and delayed circadian and sleep/wake timing. Sci Rep. 2017;7(1):3216.",
      marketplaceKeywords: ["horario sueño", "regularidad", "social jet lag", "hora fija despertar"]
    },
    {
      id: "bedroom_optimization",
      name: "Bedroom Environment Optimization",
      nameEs: "Optimización del dormitorio (temperatura, luz, ruido)",
      category: "behavioral",
      priority: "primary",
      evidenceLevel: "B",
      description: "Optimizar las 3 variables ambientales clave: (1) Temperatura: 18-20°C (la termorregulación descendente es necesaria para el onset de sueño — la caída de temperatura corporal central facilita la liberación de melatonina). (2) Luz: oscuridad total (<1 lux) o uso de antifaz. (3) Ruido: <30 dB o uso de tapones/ruido blanco. Estudios de PSG confirman que cada variable afecta independientemente la arquitectura del sueño.",
      dosage: "Temperatura: 18-20°C. Luz: <1 lux. Ruido: <30 dB.",
      timing: "Configurar 30 min antes de acostarse",
      duration: "Permanente",
      contraindications: ["apnea del sueño (temperatura muy baja puede empeorar congestión nasal)"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Okamoto-Mizuno K, Mizuno K. Effects of thermal environment on sleep and circadian rhythm. J Physiol Anthropol. 2012;31(1):14. + Cho Y et al. Effects of artificial light at night on human health: A literature review of observational and experimental studies applied to exposure assessment. Chronobiol Int. 2015;32(9):1294-1310.",
      marketplaceKeywords: ["dormitorio", "temperatura sueño", "oscuridad", "ruido", "ambiente sueño"]
    },
    {
      id: "screen_restriction",
      name: "Evening Screen Restriction",
      nameEs: "Restricción de pantallas nocturnas",
      category: "behavioral",
      priority: "adjunctive",
      evidenceLevel: "B",
      description: "Limitar exposición a pantallas emisoras de luz azul (460-480 nm) al menos 1-2 horas antes de acostarse. La luz azul suprime la secreción de melatonina (hasta un 50% según Chang et al.), retrasa el ritmo circadiano, reduce sueño REM y aumenta el alerta. Alternativas: modo nocturno/filtro ámbar en dispositivos, lentes bloqueadores de luz azul, o sustitución por lectura en papel/e-ink.",
      dosage: "Sin pantallas LED 1-2h antes de dormir. Si inevitable: filtro ámbar/modo nocturno.",
      timing: "Desde 2 horas antes de la hora objetivo de sueño",
      duration: "Permanente",
      contraindications: ["pacientes cuyo trabajo requiere pantallas nocturnas (ofrecer lentes bloqueadores como alternativa)"],
      phenotypeMatch: ["onset", "mixed"],
      reference: "Chang AM et al. Evening use of light-emitting eReaders negatively affects sleep, circadian timing, and next-morning alertness. Proc Natl Acad Sci USA. 2015;112(4):1232-1237.",
      marketplaceKeywords: ["pantallas", "luz azul", "screen time", "restricción pantallas", "filtro ámbar"]
    },
    {
      id: "caffeine_restriction",
      name: "Afternoon/Evening Caffeine Restriction",
      nameEs: "Restricción de cafeína vespertina",
      category: "behavioral",
      priority: "primary",
      evidenceLevel: "A",
      description: "La cafeína es antagonista competitivo de receptores de adenosina A1 y A2A. Su vida media es 5-6 horas (rango: 3-9h según polimorfismo CYP1A2). Consumida 6 horas antes de dormir, reduce tiempo total de sueño en ~40 min y eficiencia de sueño significativamente. Polimorfismo rs762551 de CYP1A2 determina metabolismo rápido vs lento — metabolizadores lentos son más sensibles. Corte recomendado: no consumir cafeína después de las 14:00.",
      dosage: "Última cafeína antes de las 14:00 (o 8h antes del horario de sueño). Máximo 400 mg/día.",
      timing: "Solo mañana. Corte absoluto a las 14:00.",
      duration: "Permanente",
      contraindications: ["dependencia severa de cafeína (reducir gradualmente para evitar cefalea de abstinencia: -25% cada 3-4 días)"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Clark I, Landolt HP. Coffee, caffeine, and sleep: A systematic review of epidemiological studies and randomized controlled trials. Sleep Med Rev. 2017;31:70-78. + Drake C et al. Caffeine effects on sleep taken 0, 3, or 6 hours before going to bed. J Clin Sleep Med. 2013;9(11):1195-1200.",
      marketplaceKeywords: ["cafeína", "café", "caffeine", "restricción cafeína", "CYP1A2"]
    },
    {
      id: "alcohol_restriction",
      name: "Evening Alcohol Restriction",
      nameEs: "Restricción de alcohol nocturno",
      category: "behavioral",
      priority: "adjunctive",
      evidenceLevel: "B",
      description: "El alcohol es depresor del SNC que facilita el onset de sueño pero fragmenta la segunda mitad de la noche (efecto rebote simpático al metabolizarse). Suprime REM en la primera mitad, causa rebote REM en la segunda. Dosis moderadas (2+ tragos) reducen calidad de sueño un 24-39% (Pietilä et al., estudio de n>4000). Incluso dosis bajas alteran la variabilidad de frecuencia cardíaca nocturna.",
      dosage: "No consumir alcohol 3-4 horas antes de acostarse. Idealmente eliminar consumo nocturno.",
      timing: "Última ingesta de alcohol 3-4h antes del sueño",
      duration: "Permanente",
      contraindications: ["dependencia alcohólica (requiere manejo médico de abstinencia, no restricción abrupta)"],
      phenotypeMatch: ["maintenance", "mixed"],
      reference: "Ebrahim IO et al. Alcohol and sleep I: effects on normal sleep. Alcohol Clin Exp Res. 2013;37(4):539-549. + Pietilä J et al. Acute effect of alcohol intake on cardiovascular autonomic regulation during the first hours of sleep in a large real-world sample of Finnish employees: observational study. JMIR Ment Health. 2018;5(1):e23.",
      marketplaceKeywords: ["alcohol", "alcohol sueño", "restricción alcohol", "rebote REM"]
    },
    {
      id: "light_exposure",
      name: "Morning Light Exposure",
      nameEs: "Exposición a luz matutina",
      category: "behavioral",
      priority: "adjunctive",
      evidenceLevel: "B",
      description: "Exposición a luz brillante (>2500 lux, idealmente >10000 lux) durante 20-30 minutos en la primera hora después de despertar. Sincroniza el NSQ vía tracto retinohipotalámico (melanopsina, ipRGCs). Suprime melatonina residual matutina, adelanta el ritmo circadiano, y mejora el alerta diurno. Especialmente útil en DSWPD y en regiones con baja luminosidad invernal. La luz natural es superior a la artificial.",
      dosage: "20-30 minutos de luz brillante (>2500 lux exterior, o caja de luz 10000 lux a 30cm)",
      timing: "Primera hora después de despertar",
      duration: "Diario, especialmente en invierno. Efecto en 1-2 semanas.",
      contraindications: ["retinopatía", "degeneración macular", "fotosensibilidad por fármacos (tetraciclinas, psoralenos)", "bipolar (puede desencadenar manía — usar con precaución)"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Blume C et al. Effects of light on human circadian rhythms, sleep and mood. Somnologie. 2019;23(3):147-156. + Terman M, Terman JS. Light therapy for seasonal and nonseasonal depression: efficacy, protocol, safety, and side effects. CNS Spectr. 2005;10(8):647-663.",
      marketplaceKeywords: ["luz matutina", "light exposure", "fototerapia", "ritmo circadiano", "melanopsina"]
    },
    {
      id: "exercise_timing",
      name: "Regular Exercise with Optimal Timing",
      nameEs: "Ejercicio regular (timing óptimo)",
      category: "behavioral",
      priority: "adjunctive",
      evidenceLevel: "A",
      description: "Metaanálisis de 66 estudios (n>2800) confirma que el ejercicio regular mejora calidad de sueño (efecto moderado-grande). El ejercicio aeróbico moderado (150 min/semana) es el más estudiado. Timing: ejercicio matutino o vespertino temprano (>4h antes de dormir) es beneficioso. Ejercicio vigoroso <2h antes de dormir puede retrasar onset por elevación de temperatura corporal central y arousal simpático. Mecanismo: efecto termorregulatorio, reducción de ansiedad, aumento de adenosina.",
      dosage: "150 min/semana de ejercicio aeróbico moderado (o 75 min vigoroso)",
      timing: "Mañana o tarde. Evitar ejercicio vigoroso <2h antes de dormir.",
      duration: "Efecto en 4-8 semanas de ejercicio regular. Mantener indefinidamente.",
      contraindications: ["patología cardiovascular no evaluada (stress test previo)", "lesiones musculoesqueléticas activas (adaptar tipo de ejercicio)"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Kredlow MA et al. The effects of physical activity on sleep: a meta-analytic review. J Behav Med. 2015;38(3):427-449. + Stutz J et al. Effects of evening exercise on sleep in healthy participants: A systematic review and meta-analysis. Sports Med. 2019;49(2):269-287.",
      marketplaceKeywords: ["ejercicio", "actividad física", "exercise timing", "ejercicio sueño", "aeróbico"]
    },
    {
      id: "presleep_ritual",
      name: "Pre-Sleep Wind-Down Ritual",
      nameEs: "Ritual pre-sueño relajante",
      category: "behavioral",
      priority: "optional",
      evidenceLevel: "C",
      description: "Rutina estructurada de 30-60 minutos antes de acostarse que señala al cerebro la transición vigilia→sueño. Componentes típicos: baño tibio (↑temperatura periférica → ↓temperatura central post-baño, facilitando melatonina), lectura en papel, estiramientos suaves, preparación del dormitorio. En niños, la evidencia de bedtime routines es sólida (Mindell et al.); en adultos, la evidencia es más indirecta pero consistente con la fisiología de la transición al sueño.",
      dosage: "30-60 minutos de actividades relajantes secuenciales",
      timing: "Inmediatamente antes de la hora de acostarse",
      duration: "Permanente (hábito). Efecto en 1-2 semanas.",
      contraindications: ["ninguna significativa"],
      phenotypeMatch: ["onset", "mixed"],
      reference: "Mindell JA et al. A nightly bedtime routine: impact on sleep in young children and maternal mood. Sleep. 2015;38(5):717-722. + Haghayegh S et al. Before-bedtime passive body heating by warm shower or bath to improve sleep: A systematic review and meta-analysis. Sleep Med Rev. 2019;46:124-135.",
      marketplaceKeywords: ["ritual pre-sueño", "rutina nocturna", "wind-down", "baño tibio", "bedtime routine"]
    },
    // === FASE 7: DISPOSITIVOS Y TECNOLOGÍA ===
    {
      id: "light_therapy",
      name: "Bright Light Therapy Device (10,000 lux)",
      nameEs: "Terapia de luz brillante (dispositivo 10.000 lux)",
      category: "device",
      priority: "adjunctive",
      evidenceLevel: "A",
      description: "Dispositivo de luz artificial de amplio espectro (10.000 lux a 30 cm) para tratamiento de trastornos del ritmo circadiano (DSWPD, ASWPD), depresión estacional (SAD), y como adyuvante en insomnio con componente circadiano. Metaanálisis de 53 estudios confirma eficacia en adelantar/retrasar el ritmo circadiano según timing de exposición. Protocolo: 20-30 min matutinos para adelantar fase, vespertinos para retrasar.",
      dosage: "10.000 lux a 30 cm durante 20-30 minutos (o 2.500 lux durante 2 horas)",
      timing: "AM para adelantar fase (DSWPD). PM para retrasar fase (ASWPD). Ajustar según DLMO.",
      duration: "Diario durante 2-4 semanas para efecto terapéutico. Mantener en invierno si SAD.",
      contraindications: ["retinopatía diabética o macular", "bipolar (riesgo de manía — usar bajo supervisión)", "fotosensibilidad farmacológica", "cataratas no operadas"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "van Maanen A et al. The effects of light therapy on sleep problems: A systematic review and meta-analysis. Sleep Med Rev. 2016;29:52-62. + Terman M, Terman JS. CNS Spectr. 2005;10(8):647-663.",
      marketplaceKeywords: ["luz brillante", "light therapy", "fototerapia", "10000 lux", "SAD", "DSWPD"]
    },
    {
      id: "blue_light_glasses",
      name: "Blue Light Blocking Glasses",
      nameEs: "Lentes bloqueadores de luz azul",
      category: "device",
      priority: "optional",
      evidenceLevel: "B",
      description: "Lentes con filtro ámbar/naranja que bloquean longitudes de onda de 400-500 nm (pico de supresión de melatonina: 460-480 nm). RCT crossover (n=14) mostró que usar lentes ámbar 3h antes de dormir aumentó melatonina salival y mejoró calidad subjetiva de sueño vs lentes claros. Útil como alternativa cuando la restricción total de pantallas no es viable.",
      dosage: "Usar lentes ámbar/naranja desde 2-3 horas antes de acostarse",
      timing: "2-3h antes del horario de sueño hasta apagar luces",
      duration: "Uso nocturno diario",
      contraindications: ["conducción nocturna (reducen visibilidad)", "trabajo que requiere percepción precisa del color"],
      phenotypeMatch: ["onset", "mixed"],
      reference: "Shechter A et al. Blocking nocturnal blue light for insomnia: A randomized controlled trial. J Psychiatr Res. 2018;96:196-202. + Burkhart K, Phelps JR. Amber lenses to block blue light and improve sleep: a randomized trial. Chronobiol Int. 2009;26(8):1602-1612.",
      marketplaceKeywords: ["lentes azul", "blue light glasses", "filtro ámbar", "bloqueador luz azul"]
    },
    {
      id: "white_noise",
      name: "White/Pink Noise Machine",
      nameEs: "Máquina de ruido blanco/rosa",
      category: "device",
      priority: "optional",
      evidenceLevel: "C",
      description: "Dispositivos que generan sonidos constantes de banda ancha (ruido blanco: todas las frecuencias iguales; ruido rosa: mayor energía en baja frecuencia, más natural). Enmascaran ruidos ambientales disruptivos, reduciendo despertares por estímulos sonoros. Estudio en UCI (n=40) mostró reducción significativa de despertares con ruido blanco. Evidencia limitada en insomnio primario pero razonable como adyuvante ambiental.",
      dosage: "40-50 dB (volumen bajo-moderado). Ruido rosa preferible por menor fatiga auditiva.",
      timing: "Toda la noche (continuo) o con timer de apagado automático",
      duration: "Uso nocturno a demanda",
      contraindications: ["tinnitus (puede empeorar o mejorar — evaluar individualmente)", "hiperacusia"],
      phenotypeMatch: ["maintenance", "mixed"],
      reference: "Messineo L et al. Broadband sound administration improves sleep onset latency in healthy subjects in a model of transient insomnia. Front Neurol. 2017;8:718. + Farokhnezhad Afshar P et al. Effect of white noise on sleep in patients admitted to a coronary care unit. J Caring Sci. 2016;5(2):103-109.",
      marketplaceKeywords: ["ruido blanco", "white noise", "ruido rosa", "pink noise", "sonido sueño"]
    },
    {
      id: "weighted_blanket",
      name: "Weighted Blanket",
      nameEs: "Manta con peso (gravity blanket)",
      category: "device",
      priority: "optional",
      evidenceLevel: "B",
      description: "Mantas de 5-12 kg (~10% del peso corporal) que aplican presión profunda uniforme (Deep Pressure Stimulation, DPS). Mecanismo: activación de mecanorreceptores cutáneos → aferencias vagales → ↑tono parasimpático, ↓cortisol, ↑serotonina y melatonina. RCT (n=120) en insomnio con comorbilidad psiquiátrica mostró mejora significativa en ISI, reducción de fatiga diurna, y reducción de ansiedad. Especialmente útil en ansiedad + insomnio.",
      dosage: "Manta de ~10% del peso corporal (7-12 kg para adultos). Uso nocturno.",
      timing: "Toda la noche",
      duration: "Uso continuo. Efecto desde la primera noche en algunos pacientes.",
      contraindications: ["apnea obstructiva severa (puede restringir movimiento)", "claustrofobia", "artritis severa", "niños <5 años o <20 kg"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Ekholm B et al. A randomized controlled study of weighted chain blankets for insomnia in psychiatric disorders. J Clin Sleep Med. 2020;16(9):1567-1577. + Ackerley R et al. Positive effects of a weighted blanket on insomnia. J Sleep Med Disord. 2015;2(3):1022.",
      marketplaceKeywords: ["manta peso", "weighted blanket", "gravity blanket", "presión profunda", "DPS"]
    },
    {
      id: "sleep_wearable",
      name: "Sleep Tracking Wearable",
      nameEs: "Wearable de monitoreo del sueño (Oura/Whoop/Apple Watch)",
      category: "device",
      priority: "optional",
      evidenceLevel: "C",
      description: "Dispositivos portátiles que monitorean sueño via actigrafía, PPG (fotopletismografía) y temperatura cutánea. Estimación de etapas de sueño, HRV nocturna, SpO2, y temperatura corporal. Validación contra PSG: sensibilidad aceptable para detección de sueño (~90%) pero especificidad baja para vigilia y etapas individuales. Útil para tracking longitudinal de tendencias, no para diagnóstico. PRECAUCIÓN: puede causar ortosomnia (obsesión por datos de sueño).",
      dosage: "Uso nocturno. Revisar datos semanalmente (no diariamente para evitar ortosomnia).",
      timing: "Toda la noche",
      duration: "A demanda. Evaluación de tendencias cada 2-4 semanas.",
      contraindications: ["ortosomnia preexistente (obsesión con datos → empeora insomnio)", "ansiedad severa por datos de salud", "dermatitis de contacto por dispositivo"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "de Zambotti M et al. The falling asleep process and consumer wearable devices. Nat Sci Sleep. 2019;11:325-336. + Baron KG et al. Orthosomnia: are some patients taking the quantified self too far? J Clin Sleep Med. 2017;13(2):351-354.",
      marketplaceKeywords: ["wearable", "oura", "whoop", "apple watch", "monitoreo sueño", "actigrafía"]
    },
    {
      id: "aromatherapy_lavender",
      name: "Inhaled Lavender Aromatherapy",
      nameEs: "Aromaterapia con lavanda inhalada",
      category: "device",
      priority: "optional",
      evidenceLevel: "B",
      description: "Inhalación de aceite esencial de Lavandula angustifolia (diferente de lavanda oral/Silexan). Mecanismo: linalool y acetato de linalilo actúan vía bulbo olfatorio → sistema límbico (amígdala), reduciendo actividad simpática. Revisión sistemática de 15 estudios (n>800) muestra efecto moderado en calidad subjetiva de sueño. Métodos: difusor ambiental, spray en almohada, inhalación directa. Más estudiado que otros aceites esenciales para sueño.",
      dosage: "2-3 gotas de aceite esencial en difusor o almohada, 30 min antes de dormir",
      timing: "30 minutos antes de acostarse o durante la noche con difusor temporizado",
      duration: "Uso nocturno a demanda",
      contraindications: ["asma (puede desencadenar broncoespasmo en sensibles)", "alergia a Lamiaceae", "embarazo primer trimestre (precaución)", "mascotas (gatos: metabolismo hepático limitado de aceites esenciales)"],
      phenotypeMatch: ["onset", "mixed"],
      reference: "Lillehei AS, Halcon LL. A systematic review of the effect of inhaled essential oils on sleep. J Altern Complement Med. 2014;20(6):441-451. + Koulivand PH et al. Lavender and the nervous system. Evid Based Complement Alternat Med. 2013;2013:681304.",
      marketplaceKeywords: ["aromaterapia", "lavanda inhalada", "aceite esencial", "difusor lavanda", "linalool"]
    },
    // === FASE 8: TERAPIAS COMPLEMENTARIAS ===
    {
      id: "acupuncture",
      name: "Acupuncture",
      nameEs: "Acupuntura",
      category: "complementary",
      priority: "optional",
      evidenceLevel: "B",
      description: "Inserción de agujas filiformes en puntos específicos (acupoints). Metaanálisis de 46 RCTs (n>3800) muestra eficacia superior a no-tratamiento y comparable a farmacoterapia en insomnio, con menos efectos adversos. Mecanismos propuestos: modulación de neurotransmisores (GABA, serotonina, melatonina), activación vagal, regulación del eje HPA. Puntos más estudiados para sueño: HT7 (Shenmen), SP6, GV20, Anmian. La electroacupuntura puede tener efecto superior a acupuntura manual.",
      dosage: "2-3 sesiones/semana de 20-30 minutos",
      timing: "Sesiones diurnas o vespertinas tempranas",
      duration: "8-12 semanas (16-24 sesiones)",
      contraindications: ["coagulopatías/anticoagulación (riesgo de hematoma)", "infección cutánea en sitio de inserción", "embarazo (ciertos puntos contraindicados: SP6, LI4)", "fobia a agujas"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Shergis JL et al. A systematic review of acupuncture for sleep quality in people with insomnia. Complement Ther Med. 2016;26:11-20. + Cao H et al. Acupuncture for treatment of insomnia: a systematic review of randomized controlled trials. J Altern Complement Med. 2009;15(11):1171-1186.",
      marketplaceKeywords: ["acupuntura", "acupuncture", "HT7", "shenmen", "electroacupuntura"]
    },
    {
      id: "acupressure",
      name: "Acupressure",
      nameEs: "Acupresión",
      category: "complementary",
      priority: "optional",
      evidenceLevel: "C",
      description: "Aplicación de presión manual sobre acupoints sin agujas. Técnica no invasiva y auto-aplicable. Revisión sistemática de 14 estudios muestra mejora moderada en PSQI. Puntos más estudiados: HT7 (muñeca, lado cubital), SP6 (4 dedos sobre maléolo interno), Anmian (detrás de la oreja). Puede usarse como auto-cuidado domiciliario. Menor evidencia que acupuntura pero mejor perfil de accesibilidad.",
      dosage: "Presión firme y circular en cada punto durante 2-3 minutos. 3-5 puntos por sesión.",
      timing: "Antes de acostarse",
      duration: "4-8 semanas de práctica regular",
      contraindications: ["fracturas o lesiones en zona de presión", "trombosis venosa profunda en miembros inferiores (evitar SP6)", "embarazo (SP6 y LI4 contraindicados)"],
      phenotypeMatch: ["onset", "mixed"],
      reference: "Yeung WF et al. Acupressure for insomnia: a systematic review of randomized controlled trials. EBCAM. 2012;2012:850168. + Waits A et al. Acupressure effect on sleep quality: a systematic review and meta-analysis. Sleep Med Rev. 2018;37:24-34.",
      marketplaceKeywords: ["acupresión", "acupressure", "auto-masaje", "HT7", "puntos presión sueño"]
    },
    {
      id: "massage",
      name: "Therapeutic Massage",
      nameEs: "Masaje terapéutico",
      category: "complementary",
      priority: "optional",
      evidenceLevel: "B",
      description: "Masaje de tejido blando (sueco, shiatsu, o reflexología podal) con efecto sobre sistema nervioso autónomo: ↑tono parasimpático, ↓cortisol, ↑serotonina y dopamina. Metaanálisis de 9 RCTs muestra efecto moderado en calidad subjetiva de sueño. Reflexología podal tiene evidencia específica para insomnio en adultos mayores. Auto-masaje con foam roller también muestra beneficio en calidad de sueño en atletas.",
      dosage: "30-60 minutos por sesión, 1-2 veces/semana. Auto-masaje: 10-15 min diarios.",
      timing: "Vespertino o nocturno (1-2h antes de dormir)",
      duration: "4-8 semanas de sesiones regulares",
      contraindications: ["trombosis venosa profunda", "fracturas activas", "infecciones cutáneas en zona de masaje", "tumores cutáneos", "fiebre"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Field T et al. Cortisol decreases and serotonin and dopamine increase following massage therapy. Int J Neurosci. 2005;115(10):1397-1413. + Corrado B et al. Effectiveness of massage therapy on sleep quality: a systematic review. J Sport Rehabil. 2021;30(8):1166-1176.",
      marketplaceKeywords: ["masaje", "massage", "reflexología", "masaje terapéutico", "auto-masaje sueño"]
    },
    // === FASE 9: HONGOS ADAPTÓGENOS ===
    {
      id: "reishi",
      name: "Reishi (Ganoderma lucidum)",
      nameEs: "Reishi (Ganoderma lucidum / Lingzhi)",
      category: "supplement",
      priority: "optional",
      evidenceLevel: "C",
      description: "Hongo adaptógeno con triterpenos (ácidos ganodéricos) que modulan receptores GABA-A y actividad GABAérgica. Polisacáridos (β-glucanos) tienen efecto inmunomodulador e antiinflamatorio que puede mejorar sueño indirectamente. Estudio en ratones mostró aumento de sueño NREM y reducción de latencia. En humanos: estudio piloto (n=132) con extracto de esporas mostró mejora significativa en fatiga y calidad de sueño subjetiva en neurastenia.",
      dosage: "1.5-3 g de extracto estandarizado (10-30% polisacáridos) o 1-1.5 g de esporas rotas",
      timing: "Con la cena o 1 hora antes de acostarse",
      duration: "8-12 semanas",
      contraindications: ["anticoagulantes (efecto antiplaquetario)", "inmunosupresores (efecto inmunoestimulante)", "embarazo", "cirugía programada (suspender 2 semanas antes)", "hepatopatía activa (casos raros de hepatotoxicidad)"],
      phenotypeMatch: ["maintenance", "mixed"],
      reference: "Qin LH et al. Ganoderic acid A-mediated modulation of microglial polarization is involved in sleep improvement by Ganoderma. Front Pharmacol. 2024;15:1383609. + Tang W et al. A randomized, double-blind and placebo-controlled study of a Ganoderma lucidum polysaccharide extract in neurasthenia. J Med Food. 2005;8(1):53-58.",
      marketplaceKeywords: ["reishi", "ganoderma", "lingzhi", "hongo adaptógeno", "ácidos ganodéricos"]
    },
    {
      id: "lions_mane",
      name: "Lion's Mane (Hericium erinaceus)",
      nameEs: "Melena de León (Hericium erinaceus)",
      category: "supplement",
      priority: "optional",
      evidenceLevel: "C",
      description: "Hongo medicinal que contiene hericenonas y erinacinas, compuestos que estimulan la síntesis de NGF (Nerve Growth Factor) y BDNF. No es sedante directo — mejora sueño indirectamente vía reducción de ansiedad y mejora de función cognitiva. RCT (n=77, 8 semanas) mostró mejora en escalas de depresión y ansiedad. Relevante para insomnio asociado a ansiedad y rumiación cognitiva.",
      dosage: "500-3000 mg de extracto estandarizado (30% polisacáridos, contenido de hericenonas/erinacinas)",
      timing: "Con las comidas (mañana y/o noche). No es sedante, puede tomarse de día.",
      duration: "8-16 semanas para efecto neurotrófico",
      contraindications: ["alergia a hongos", "anticoagulantes (efecto antiplaquetario leve)", "embarazo", "enfermedades autoinmunes (efecto inmunomodulador)"],
      phenotypeMatch: ["onset", "mixed"],
      reference: "Nagano M et al. Reduction of depression and anxiety by 4 weeks Hericium erinaceus intake. Biomed Res. 2010;31(4):231-237. + Chong PS et al. Neurological, cognitive, and neuropsychiatric impacts of Hericium erinaceus supplementation: a review. J Fungi. 2025;11(1):38.",
      marketplaceKeywords: ["melena león", "lions mane", "hericium", "NGF", "hericenonas"]
    },
    // === FASE 10: SUPLEMENTOS SECUNDARIOS ===
    {
      id: "tart_cherry",
      name: "Tart Cherry (Prunus cerasus)",
      nameEs: "Cereza ácida (Prunus cerasus / Montmorency)",
      category: "supplement",
      priority: "optional",
      evidenceLevel: "B",
      description: "Jugo o extracto de cereza ácida Montmorency. Contiene melatonina natural (hasta 13 ng/g) y proantocianidinas que inhiben la indoleamina 2,3-dioxigenasa (IDO), redirigiendo triptófano hacia síntesis de serotonina/melatonina. RCT (n=20) mostró aumento significativo de tiempo en cama, tiempo total de sueño y eficiencia de sueño. Un segundo RCT (n=15, crossover) confirmó aumento de melatonina urinaria.",
      dosage: "240 mL de jugo concentrado (o 480 mL diluido) 2 veces/día, o cápsulas 500 mg",
      timing: "30 min después del desayuno + 30 min antes de acostarse",
      duration: "2-4 semanas",
      contraindications: ["diabetes (alto contenido de azúcar en jugo)", "cálculos renales de oxalato (alto oxalato)", "anticoagulantes (interacción leve)"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Pigeon WR et al. Effects of a tart cherry juice beverage on the sleep of older adults with insomnia: a pilot study. J Med Food. 2010;13(3):579-583. + Howatson G et al. Effect of tart cherry juice (Prunus cerasus) on melatonin levels and enhanced sleep quality. Eur J Nutr. 2012;51(8):909-916.",
      marketplaceKeywords: ["cereza ácida", "tart cherry", "montmorency", "jugo cereza", "melatonina natural"]
    },
    {
      id: "curcumin",
      name: "Curcumin (Curcuma longa)",
      nameEs: "Curcumina (Curcuma longa)",
      category: "supplement",
      priority: "optional",
      evidenceLevel: "C",
      description: "Polifenol principal de la cúrcuma con potente actividad antiinflamatoria (inhibe NF-κB, COX-2, LOX) y antioxidante. No actúa directamente sobre el sueño pero mejora el sueño indirectamente al reducir inflamación sistémica de bajo grado (asociada con fragmentación del sueño) y modular positivamente ansiedad/depresión. Biodisponibilidad baja — requiere formulación con piperina, fitosomas o nanopartículas.",
      dosage: "500-1000 mg de curcumina con piperina (20 mg) o formulación biodisponible (Meriva, Theracurmin, Longvida)",
      timing: "Con las comidas (mejor absorción con grasa)",
      duration: "8-12 semanas",
      contraindications: ["cálculos biliares (efecto colagogo)", "anticoagulantes (efecto antiplaquetario)", "embarazo en dosis altas", "obstrucción vías biliares"],
      phenotypeMatch: ["maintenance", "mixed"],
      reference: "Lopresti AL et al. Curcumin for the treatment of major depression: a randomised, double-blind, placebo controlled study. J Affect Disord. 2014;167:368-375. + Hewlings SJ, Kalman DS. Curcumin: a review of its effects on human health. Foods. 2017;6(10):92.",
      marketplaceKeywords: ["curcumina", "cúrcuma", "turmeric", "antiinflamatorio sueño", "NF-κB"]
    },
    {
      id: "piperine",
      name: "Piperine (Piper nigrum)",
      nameEs: "Piperina (Piper nigrum / pimienta negra)",
      category: "supplement",
      priority: "optional",
      evidenceLevel: "B",
      description: "Alcaloide de pimienta negra que aumenta biodisponibilidad de múltiples compuestos por inhibición de glucuronidación hepática e intestinal (UGT) y CYP3A4. Aumenta biodisponibilidad de curcumina en 2000%, de CoQ10, resveratrol, y β-caroteno. No tiene efecto directo sobre el sueño — es potenciador de absorción. Incluido como componente sinérgico obligatorio con curcumina.",
      dosage: "5-20 mg (contenido en BioPerine® estandarizado al 95%)",
      timing: "Junto con el suplemento que potencia (curcumina, CoQ10, etc.)",
      duration: "Mientras se use el suplemento potenciado",
      contraindications: ["uso con fármacos de ventana terapéutica estrecha (puede aumentar niveles: warfarina, fenitoína, teofilina, digoxina)", "embarazo en dosis altas"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Kesarwani K, Gupta R. Bioavailability enhancers of herbal origin: an overview. Asian Pac J Trop Biomed. 2013;3(4):253-266. + Shoba G et al. Influence of piperine on the pharmacokinetics of curcumin in animals and human volunteers. Planta Med. 1998;64(4):353-356.",
      marketplaceKeywords: ["piperina", "bioperine", "pimienta negra", "biodisponibilidad", "potenciador absorción"]
    },
    {
      id: "ginger",
      name: "Ginger (Zingiber officinale)",
      nameEs: "Jengibre (Zingiber officinale)",
      category: "supplement",
      priority: "optional",
      evidenceLevel: "D",
      description: "Rizoma con gingeroles y shogaoles con actividad antiinflamatoria (inhibe COX-2 y LOX), antiemética, y termogénica. No tiene efecto directo demostrado sobre el sueño. Incluido como componente de infusiones nocturnas tradicionales y por efecto sinérgico antiinflamatorio con curcumina. La evidencia para sueño es anecdótica y preclínica.",
      dosage: "500-1000 mg de extracto o 2-4 g de raíz fresca en infusión",
      timing: "Con la cena o en infusión nocturna",
      duration: "A demanda",
      contraindications: ["cálculos biliares", "anticoagulantes en dosis altas", "cirugía programada (efecto antiplaquetario)"],
      phenotypeMatch: ["mixed"],
      reference: "Bode AM, Dong Z. The amazing and mighty ginger. In: Benzie IFF, Wachtel-Galor S, eds. Herbal Medicine: Biomolecular and Clinical Aspects. 2nd ed. CRC Press; 2011.",
      marketplaceKeywords: ["jengibre", "ginger", "gingerol", "infusión nocturna"]
    },
    {
      id: "cinnamon",
      name: "Cinnamon (Cinnamomum verum)",
      nameEs: "Canela (Cinnamomum verum / Ceylon)",
      category: "supplement",
      priority: "optional",
      evidenceLevel: "D",
      description: "Corteza con cinamaldehído y polifenoles. Efecto principal: regulación glucémica (mejora sensibilidad a insulina). La hiperglucemia nocturna fragmenta el sueño — la canela podría mejorar sueño indirectamente vía estabilización glucémica. Evidencia directa para sueño: nula. Incluido como componente de infusiones nocturnas y por potencial regulador metabólico. USAR canela Ceylon (verum), no cassia (contiene cumarina hepatotóxica).",
      dosage: "500-2000 mg de canela Ceylon, o 1-2 g en infusión",
      timing: "Con la cena",
      duration: "A demanda",
      contraindications: ["hepatopatía (usar SOLO Ceylon, no cassia)", "embarazo en dosis altas", "anticoagulantes (canela cassia tiene cumarina)"],
      phenotypeMatch: ["maintenance"],
      reference: "Hidayat K et al. Effect of cinnamon supplementation on blood pressure: a systematic review and meta-analysis. Clin Phytosci. 2022;8:24. + Davis PA, Yokoyama W. Cinnamon intake lowers fasting blood glucose. J Med Food. 2011;14(9):884-889.",
      marketplaceKeywords: ["canela", "cinnamon", "ceylon", "cinamaldehído", "regulación glucémica"]
    },
    // === FASE 11: COFACTORES ENZIMÁTICOS (items nuevos, no duplicados de Fase 2) ===
    {
      id: "vitamin_k2",
      name: "Vitamin K2 (MK-7, Menaquinone-7)",
      nameEs: "Vitamina K2 (MK-7 / Menaquinona-7)",
      category: "supplement",
      priority: "adjunctive",
      evidenceLevel: "C",
      description: "Cofactor obligatorio cuando se suplementa vitamina D3 + calcio. Activa la proteína Gla de la matriz (MGP) que previene calcificación vascular y la osteocalcina que dirige calcio al hueso. Sin K2, la suplementación crónica de D3+calcio puede causar calcificación arterial. No tiene efecto directo sobre el sueño pero es componente de seguridad esencial del protocolo de suplementación.",
      dosage: "100-200 μg de MK-7 (forma de mayor vida media: 72h vs 4h de K1)",
      timing: "Con comida que contenga grasa (liposoluble)",
      duration: "Mientras se suplemente vitamina D3 y/o calcio",
      contraindications: ["anticoagulantes cumarínicos (warfarina) — CONTRAINDICACIÓN ABSOLUTA (K2 revierte efecto anticoagulante)", "no contraindicado con DOACs (apixaban, rivaroxaban)"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Knapen MH et al. Menaquinone-7 supplementation improves arterial stiffness in healthy postmenopausal women. A double-blind randomised clinical trial. Thromb Haemost. 2015;113(5):1135-1144.",
      marketplaceKeywords: ["vitamina K2", "MK-7", "menaquinona", "cofactor D3", "calcificación"]
    },
    {
      id: "probiotic_sleep",
      name: "Sleep-Targeted Probiotics (L. gasseri CP2305, L. casei Shirota)",
      nameEs: "Probióticos para sueño (L. gasseri CP2305 / L. casei Shirota)",
      category: "supplement",
      priority: "adjunctive",
      evidenceLevel: "A",
      description: "Cepas probióticas específicas con efecto demostrado sobre sueño vía eje intestino-cerebro. L. gasseri CP2305: RCT doble ciego (n=60) mostró reducción significativa de cortisol salival, mejora de calidad de sueño (actigrafía) y reducción de ansiedad en estudiantes bajo estrés. L. casei Shirota: RCT (n=94) mostró reducción de latencia de sueño y mejora de calidad subjetiva. Mecanismo: producción de GABA intestinal, modulación vagal, reducción de inflamación sistémica.",
      dosage: "10⁹-10¹⁰ UFC/día de cepa específica (CP2305 o Shirota). No intercambiable con probióticos genéricos.",
      timing: "Con el desayuno o almuerzo (no estómago vacío)",
      duration: "8-12 semanas para efecto sobre eje intestino-cerebro",
      contraindications: ["inmunosupresión severa (riesgo de bacteriemia)", "síndrome de intestino corto", "catéter venoso central (riesgo de translocación)"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Nishida K et al. Para-psychobiotic Lactobacillus gasseri CP2305 ameliorates stress-related symptoms and sleep quality. J Appl Microbiol. 2017;123(6):1561-1570. + Takada M et al. Beneficial effects of Lactobacillus casei strain Shirota on academic stress-induced sleep disturbance in healthy adults. Benef Microbes. 2017;8(2):153-162.",
      marketplaceKeywords: ["probióticos sueño", "CP2305", "L. gasseri", "L. casei Shirota", "eje intestino cerebro"]
    },
    {
      id: "coq10",
      name: "Coenzyme Q10 (Ubiquinol)",
      nameEs: "Coenzima Q10 (Ubiquinol)",
      category: "supplement",
      priority: "optional",
      evidenceLevel: "B",
      description: "Componente esencial de la cadena de transporte de electrones mitocondrial (Complejo III). La forma reducida (ubiquinol) tiene mayor biodisponibilidad que ubiquinona. RCT multicéntrico (n=207) en fatiga crónica mostró mejora significativa en fatiga y calidad de sueño. Relevante cuando el insomnio se asocia con fatiga crónica, fibromialgia, o uso de estatinas (que depletan CoQ10). Deplación de CoQ10 por estatinas es causa frecuente de mialgia y fatiga que afectan sueño.",
      dosage: "100-300 mg de ubiquinol (o 200-600 mg de ubiquinona)",
      timing: "Con comida que contenga grasa (liposoluble)",
      duration: "8-12 semanas",
      contraindications: ["anticoagulantes cumarínicos (puede reducir efecto de warfarina — monitorizar INR)", "insulina (puede reducir glucemia — monitorizar)"],
      phenotypeMatch: ["maintenance", "mixed"],
      reference: "Castro-Marrero J et al. Does oral coenzyme Q10 plus NADH supplementation improve fatigue and biochemical parameters in chronic fatigue syndrome? Clin Nutr. 2021;40(3):1203-1211.",
      marketplaceKeywords: ["CoQ10", "ubiquinol", "coenzima Q10", "mitocondria", "fatiga sueño"]
    },
    {
      id: "vitamin_c_sleep",
      name: "Vitamin C (Ascorbic Acid)",
      nameEs: "Vitamina C (Ácido ascórbico)",
      category: "supplement",
      priority: "optional",
      evidenceLevel: "C",
      description: "Cofactor de la tirosina hidroxilasa (TH) y dopamina β-hidroxilasa (DβH) en síntesis de catecolaminas, y modulador del eje HPA (reduce cortisol en estrés). Estudio epidemiológico (NHANES, n>26000) asoció baja ingesta de vitamina C con menor duración de sueño. No es sedante — mejora sueño indirectamente al reducir estrés oxidativo y cortisol. Relevante en deficiencia subclínica y estrés crónico.",
      dosage: "500-1000 mg/día",
      timing: "Mañana o mediodía (puede ser estimulante en algunos individuos si se toma por la noche)",
      duration: "8-12 semanas",
      contraindications: ["hemocromatosis (aumenta absorción de hierro)", "cálculos renales de oxalato (dosis >2g/día)", "deficiencia de G6PD (dosis muy altas)"],
      phenotypeMatch: ["maintenance", "mixed"],
      reference: "Otocka-Kmiecik A et al. Effect of vitamins C and E on cortisol, CRP, and subjective responses to physiological stress during a heavy resistance exercise bout. Nutrients. 2020;12(11):3540. + Grandner MA et al. Relationships among dietary nutrients and subjective sleep, objective sleep, and napping in women. Sleep Med. 2014;15(2):222-227.",
      marketplaceKeywords: ["vitamina C", "ácido ascórbico", "antioxidante sueño", "cortisol", "eje HPA"]
    },
    // === FASE 12: PÉPTIDOS EXPERIMENTALES ===
    {
      id: "dsip",
      name: "DSIP (Delta Sleep-Inducing Peptide)",
      nameEs: "DSIP (Péptido inductor del sueño delta)",
      category: "peptide",
      priority: "experimental",
      evidenceLevel: "C",
      description: "⚠️ EXPERIMENTAL. Nonapéptido endógeno (Trp-Ala-Gly-Gly-Asp-Ala-Ser-Gly-Glu) aislado de sangre de conejo durante sueño inducido. Estudios en humanos de los años 80 mostraron aumento de sueño de ondas lentas (delta) en algunos sujetos, pero resultados inconsistentes. Vida media muy corta (~15 min IV). Mecanismo no completamente elucidado. Disponibilidad: solo compuestos de investigación, sin aprobación regulatoria. NO INCLUIR EN PLAN DIARIO.",
      dosage: "⚠️ Solo en contexto de investigación. No hay dosis clínica establecida.",
      timing: "N/A — experimental",
      duration: "N/A — experimental",
      contraindications: ["uso sin supervisión médica", "embarazo", "lactancia", "cualquier condición médica activa"],
      phenotypeMatch: ["onset", "maintenance"],
      experimentalDisclaimer: true,
      reference: "Schoenenberger GA et al. Characterization and properties of delta electroencephalogram (sleep)-inducing peptide. Proc Natl Acad Sci USA. 1977;74(3):1282-1286.",
      marketplaceKeywords: ["DSIP", "péptido delta", "sleep peptide", "experimental"]
    },
    {
      id: "epitalon",
      name: "Epitalon (Epithalon)",
      nameEs: "Epitalon (Epithalon / Epithalamina sintética)",
      category: "peptide",
      priority: "experimental",
      evidenceLevel: "C",
      description: "⚠️ EXPERIMENTAL. Tetrapéptido sintético (Ala-Glu-Asp-Gly) basado en epithalamina pineal. Estudios preclínicos sugieren activación de telomerasa y estimulación de secreción de melatonina pineal. Estudios en humanos muy limitados (Khavinson, no replicados). Hipótesis: al reactivar la producción pineal de melatonina (que declina con la edad), podría mejorar el ritmo circadiano en ancianos. Sin aprobación regulatoria. NO INCLUIR EN PLAN DIARIO.",
      dosage: "⚠️ Solo en contexto de investigación. Protocolos publicados: 10 mg SC/día x 10 días.",
      timing: "N/A — experimental",
      duration: "N/A — experimental",
      contraindications: ["uso sin supervisión médica", "embarazo", "lactancia", "neoplasias activas (efecto telomerasa teórico)"],
      phenotypeMatch: ["maintenance"],
      experimentalDisclaimer: true,
      reference: "Khavinson VKh et al. Pineal-regulating tetrapeptide epitalon improves eye retina condition in aging. Neuro Endocrinol Lett. 2003;24(5):365-368.",
      marketplaceKeywords: ["epitalon", "epithalon", "telomerasa", "pineal", "experimental"]
    },
    {
      id: "bpc_157",
      name: "BPC-157 (Body Protection Compound-157)",
      nameEs: "BPC-157 (Compuesto de protección corporal-157)",
      category: "peptide",
      priority: "experimental",
      evidenceLevel: "C",
      description: "⚠️ EXPERIMENTAL. Pentadecapéptido derivado de jugo gástrico humano con propiedades citoprotectoras demostradas en modelos animales. Mecanismo propuesto para sueño: modulación del sistema dopaminérgico y serotoninérgico, efecto antiinflamatorio sistémico, y protección de la barrera intestinal (eje intestino-cerebro). Sin RCTs en humanos para sueño. Toda la evidencia es preclínica o anecdótica. NO INCLUIR EN PLAN DIARIO.",
      dosage: "⚠️ Solo en contexto de investigación. No hay dosis clínica establecida para sueño.",
      timing: "N/A — experimental",
      duration: "N/A — experimental",
      contraindications: ["uso sin supervisión médica", "embarazo", "lactancia", "neoplasias activas (efecto angiogénico teórico)"],
      phenotypeMatch: ["maintenance"],
      experimentalDisclaimer: true,
      reference: "Sikiric P et al. The pharmacological properties of the novel peptide BPC 157 (PL-10). J Physiol Paris. 1999;93(1):65-77.",
      marketplaceKeywords: ["BPC-157", "péptido gástrico", "citoprotección", "experimental"]
    },
    {
      id: "selank",
      name: "Selank",
      nameEs: "Selank (péptido ansiolítico)",
      category: "peptide",
      priority: "experimental",
      evidenceLevel: "C",
      description: "⚠️ EXPERIMENTAL. Heptapéptido sintético análogo de tuftsina (fragmento de IgG) desarrollado en Rusia. Aprobado en Rusia como spray nasal ansiolítico (no aprobado en EMA/FDA). Mecanismo: modula expresión de BDNF, IL-6 y encefalinas; efecto GABAérgico indirecto. Estudios rusos muestran efecto ansiolítico comparable a fenazepam sin sedación ni dependencia. Puede mejorar sueño indirectamente vía reducción de ansiedad. Evidencia occidental limitada. NO INCLUIR EN PLAN DIARIO.",
      dosage: "⚠️ Solo en contexto de investigación. Protocolos publicados: 250-500 μg intranasal.",
      timing: "N/A — experimental",
      duration: "N/A — experimental",
      contraindications: ["uso sin supervisión médica", "embarazo", "lactancia", "inmunopatologías activas"],
      phenotypeMatch: ["onset", "mixed"],
      experimentalDisclaimer: true,
      reference: "Seredenin SB et al. Anxiolytic-like effect of Selank. Bull Exp Biol Med. 2006;142(4):456-458. + Zozulya AA et al. Peptides in CNS: candidates for application in neuroscience and pharmacology. In: Bentivoglio M, Bhatt DK, eds. Neuropeptides. 2008.",
      marketplaceKeywords: ["selank", "péptido ansiolítico", "tuftsina", "experimental"]
    },
    // === FASE 13: FITOTERAPÉUTICOS Y NUTRACÉUTICOS (AUDITORÍA 2025) ===
    {
      id: "pea",
      name: "PEA (Palmitoylethanolamide)",
      nameEs: "PEA (Palmitoiletanolamida)",
      category: "supplement",
      priority: "adjunctive",
      evidenceLevel: "B",
      description: "Amida de ácido graso endógena con actividad sobre receptores PPAR-α y sistema endocannabinoide (efecto 'entourage' sin ser cannabinoide). Potente antiinflamatorio y analgésico endógeno. RCT (n=62) mostró mejora significativa en calidad de sueño (PSQI -3.2 puntos) y reducción de dolor nocturno. Especialmente útil en insomnio con componente inflamatorio o dolor crónico. Sin efectos psicoactivos ni dependencia.",
      dosage: "300-600 mg, preferiblemente en forma micronizada (micro-PEA) para mejor biodisponibilidad",
      timing: "Con la cena o antes de acostarse",
      duration: "4-8 semanas",
      contraindications: ["embarazo (datos limitados)", "lactancia"],
      phenotypeMatch: ["maintenance", "mixed"],
      reference: "Tartaglia N et al. Palmitoylethanolamide as adjunctive therapy for sleep disturbance: an open-label pilot study. Brain Sci. 2024;14(2):195. + Petrosino S, Di Marzo V. The pharmacology of palmitoylethanolamide and first data on the therapeutic efficacy of some of its new formulations. Br J Pharmacol. 2017;174(11):1349-1365.",
      marketplaceKeywords: ["PEA", "palmitoiletanolamida", "PPAR-α", "endocannabinoide", "antiinflamatorio sueño"]
    },
    {
      id: "kiwi_sleep",
      name: "Kiwi Fruit (Actinidia deliciosa)",
      nameEs: "Kiwi (Actinidia deliciosa)",
      category: "supplement",
      priority: "optional",
      evidenceLevel: "B",
      description: "Fruto con alto contenido de serotonina (5.8 μg/g), folato, vitaminas C y E, y antioxidantes (actinidina). RCT (n=24, 4 semanas) mostró mejora significativa en onset de sueño (-35.4%), tiempo de vigilia post-onset (-28.9%), y tiempo total de sueño (+13.4%) medidos por actigrafía y diario de sueño. Mecanismo propuesto: aporte exógeno de serotonina, alto contenido de folato como cofactor, y efecto antioxidante/antiinflamatorio.",
      dosage: "2 kiwis 1 hora antes de acostarse",
      timing: "1 hora antes de acostarse",
      duration: "4 semanas",
      contraindications: ["alergia a kiwi (reacción cruzada con látex)", "cálculos renales de oxalato", "síndrome de alergia oral (SAO) a frutas"],
      phenotypeMatch: ["onset", "maintenance", "mixed"],
      reference: "Lin HH et al. Effect of kiwifruit consumption on sleep quality in adults with sleep problems. Asia Pac J Clin Nutr. 2011;20(2):169-174.",
      marketplaceKeywords: ["kiwi", "kiwifruit", "serotonina fruta", "actinidia", "fruta sueño"]
    },
    // === SAHOS: TRATAMIENTOS NO-FARMACOLÓGICOS ===
    {
      id: "sahos_weight_loss",
      name: "Weight Loss Program (10% = 26% AHI reduction)",
      nameEs: "Pérdida de Peso (10% = 26% reducción AHI)",
      category: "behavioral",
      priority: "primary",
      evidenceLevel: "A",
      description: "Pérdida de peso del 10% corporal resulta en ~26% reducción de AHI en SAHOS. Mediante dieta + ejercicio ≥150 min/semana. Imprescindible en SAHOS + sobrepeso/obesidad.",
      duration: "12-24 semanas para objetivo",
      contraindications: [],
      phenotypeMatch: ["onset"],
      reference: "Schwartz AR et al. Sleep. 1991;14(3):203-210."
    },
    {
      id: "sahos_positional_therapy",
      name: "Positional Therapy",
      nameEs: "Terapia Posicional",
      category: "behavioral",
      priority: "adjunctive",
      evidenceLevel: "B",
      description: "Si AHI supino ≥2× AHI no-supino. Entrenar posición lateral. Mejora >40% en SAHOS leve-moderado.",
      timing: "Nightly",
      duration: "Permanente",
      contraindications: [],
      phenotypeMatch: ["onset"],
      reference: "Epstein LJ et al. Chest. 2009;135(1):161-173."
    },
    {
      id: "sahos_myofunctional",
      name: "Orofacial Myofunctional Therapy",
      nameEs: "Terapia Miofuncional Orofaríngea",
      category: "behavioral",
      priority: "adjunctive",
      evidenceLevel: "B",
      description: "Ejercicios de musculatura orofaríngea. ~50% reducción en SAHOS leve-moderado. 30 min/día, 5 días/semana.",
      duration: "8-12 semanas",
      contraindications: [],
      phenotypeMatch: ["onset"],
      reference: "Guimarães KC et al. Am J Respir Crit Care Med. 2009;179(10):962-966."
    },
    // === DESPERTARES TEMPRANOS (EMA) ===
    {
      id: "ema_light_therapy_evening",
      name: "Evening Light Therapy (2500-10000 lux)",
      nameEs: "Fototerapia Vespertina",
      category: "behavioral",
      priority: "primary",
      evidenceLevel: "A",
      description: "Luz 2500-10000 lux en 17-21h para retrasar fase de sueño en despertares tempranos. Especialmente útil en ASWPD.",
      timing: "17:00-21:00 horas locales",
      duration: "30-60 minutos",
      contraindications: ["fotosensibilidad", "epilepsia fotosensible"],
      phenotypeMatch: ["maintenance"],
      reference: "Lack LC et al. Sleep. 2007;30(5):616-623."
    },
    {
      id: "ema_sleep_restriction",
      name: "Sleep Restriction Therapy for Early Awakening",
      nameEs: "Restricción de Sueño para Despertares Tempranos",
      category: "behavioral",
      priority: "primary",
      evidenceLevel: "A",
      description: "Acostarse más tarde, mantener hora de despertar fija. Eficiencia ≥85%. Mejora fragmentación.",
      duration: "4-8 semanas",
      contraindications: ["trastorno bipolar", "apnea del sueño severa"],
      phenotypeMatch: ["maintenance"],
      reference: "Spielman AJ et al. Behav Modif. 1987;11(4):427-439."
    },
    // === RLS / SPI ===
    {
      id: "rls_iron_supplementation",
      name: "Iron Supplementation (if ferritin <75 μg/L)",
      nameEs: "Suplementación de Hierro (si ferritina <75)",
      category: "supplement",
      priority: "primary",
      evidenceLevel: "A",
      description: "Si ferritina <75 μg/L: sulfato ferroso 325mg/día + vitamina C. Mejora RLS 60-80%.",
      dosage: "325 mg sulfato ferroso + 200 mg vitamina C",
      duration: "12 semanas, reevaluar ferritina",
      contraindications: ["hemocromatosis", "talasemia"],
      phenotypeMatch: ["maintenance"],
      reference: "Allen RP et al. Sleep. 2010;33(4):517-523."
    },
    // === PARASOMNIAS: RBD ===
    {
      id: "rbd_melatonin",
      name: "Melatonin for RBD (3-12mg)",
      nameEs: "Melatonina para RBD",
      category: "supplement",
      priority: "primary",
      evidenceLevel: "A",
      description: "Para Trastorno de Conducta REM: melatonina 3-12mg. Restaura atonía REM, eficacia >80%.",
      dosage: "3-12 mg antes de acostarse",
      duration: "Continua",
      contraindications: ["anticoagulantes"],
      phenotypeMatch: ["maintenance"],
      reference: "Gagnon JF et al. Neurology. 2006;67(12):2172-2176."
    },
    // === CRONOFOTOTERAPIA: ASWPD ===
    {
      id: "circadian_evening_light",
      name: "Evening Light Therapy for ASWPD",
      nameEs: "Fototerapia Vespertina para ASWPD",
      category: "behavioral",
      priority: "primary",
      evidenceLevel: "A",
      description: "ASWPD: Luz vespertina 2500-10000 lux (17-21h). Retarda inicio sueño natural.",
      timing: "17:00-21:00",
      duration: "Continua",
      contraindications: [],
      phenotypeMatch: ["maintenance"],
      reference: "Lack LC et al. Sleep. 2007;30(5):616-623."
    },
    // === NARCOLEPSIA: SOPORTE ===
    {
      id: "narcolepsy_scheduled_naps",
      name: "Scheduled Naps (15-20 min, 2-3x/day)",
      nameEs: "Siestas Programadas",
      category: "behavioral",
      priority: "adjunctive",
      evidenceLevel: "B",
      description: "Narcolepsia: siestas de 15-20 min, 2-3 veces/día. Muy refrescantes.",
      timing: "Media mañana, post-almuerzo, tarde",
      duration: "Continua",
      contraindications: [],
      phenotypeMatch: ["maintenance"],
      reference: "Mitler MM et al. Sleep. 1986;9(4):540-545."
    },
    // === FASES DEL SUEÑO: SUPLEMENTOS DE APOYO ===
    {
      id: "slow_wave_sleep_glycine",
      name: "Glycine for Slow-Wave Sleep Enhancement",
      nameEs: "Glicina para Potenciar Sueño Profundo",
      category: "supplement",
      priority: "optional",
      evidenceLevel: "B",
      description: "3 g de glicina aumenta N3/SWS ~2-3%. Segura, sin tolerancia.",
      dosage: "3 g antes de acostarse",
      duration: "8 semanas",
      contraindications: [],
      phenotypeMatch: ["maintenance"],
      reference: "Bannai M et al. Front Hum Neurosci. 2012;6:217."
    },
    {
      id: "rem_vitamin_b6",
      name: "Vitamin B6 for REM Enhancement (dream vividness)",
      nameEs: "Vitamina B6 para Potenciar REM",
      category: "supplement",
      priority: "optional",
      evidenceLevel: "B",
      description: "100-200 mg de piridoxina aumenta vividez de sueños y REM.",
      dosage: "100-200 mg, 30 min antes de dormir",
      duration: "4-8 semanas",
      contraindications: ["neuropatía periférica preexistente (dosis >200mg crónicas)"],
      phenotypeMatch: ["maintenance"],
      reference: "Ebben MR et al. Sleep Sci. 2014;7(1):29-35."
    }
  ];
  function generateRecommendations(phenotype, blockedIds, hasAnxiety = false, hasDepression = false) {
    if (phenotype === "none") {
      return {
        primary: [],
        adjunctive: [],
        optional: [],
        blockedRecommendations: [],
        clinicalNote: "Sin insomnio cl\xEDnico. No se generan recomendaciones terap\xE9uticas espec\xEDficas. Se sugiere mantener buenos h\xE1bitos de sue\xF1o."
      };
    }
    const blockAllSupplements = blockedIds.includes("ALL_SUPPLEMENTS") || blockedIds.includes("ALL");
    const blockAll = blockedIds.includes("ALL");
    let applicable = TREATMENT_DB.filter((t) => {
      if (!t.phenotypeMatch.includes(phenotype)) return false;
      if (t.excludeFromInsomniaProtocol) return false;
      if (blockAll) return false;
      if (blockAllSupplements && t.category === "supplement") return false;
      if (blockedIds.includes(t.id)) return false;
      return true;
    });
    if (hasAnxiety) {
      applicable = applicable.map((t) => {
        if (t.id === "relaxation") {
          return { ...t, priority: "primary" };
        }
        if (t.id === "l_theanine" && !blockAllSupplements) {
          return { ...t, priority: "adjunctive" };
        }
        if (t.id === "ashwagandha" && !blockAllSupplements) {
          return { ...t, priority: "adjunctive" };
        }
        return t;
      });
    }
    const depNote = hasDepression ? " Se detecta depresi\xF3n moderada o mayor: la TCC-I tiene evidencia de eficacia tambi\xE9n en depresi\xF3n com\xF3rbida (Cunningham JEA, Shapiro CM. J Clin Sleep Med. 2018;14(7):1249-1258)." : "";
    const blocked = TREATMENT_DB.filter((t) => blockedIds.includes(t.id) || blockAllSupplements && t.category === "supplement").map((t) => t.nameEs);
    return {
      primary: applicable.filter((t) => t.priority === "primary"),
      adjunctive: applicable.filter((t) => t.priority === "adjunctive"),
      optional: applicable.filter((t) => t.priority === "optional"),
      blockedRecommendations: blocked,
      clinicalNote: `Recomendaciones para fenotipo "${phenotype}". ${applicable.length} intervenciones sugeridas.${depNote}${blocked.length > 0 ? ` Bloqueados por seguridad: ${blocked.join(", ")}.` : ""}`
    };
  }

  // src/engine/risk-integrator.ts
  function evaluateFlags(inputs) {
    return [
      {
        code: "RF-ISQ",
        name: "Insomnio severo",
        description: "ISQ \u226522 indica insomnio cl\xEDnico severo (basado en ICSD-3)",
        source: "ISQ",
        value: inputs.isqTotal,
        threshold: "\u226522",
        triggered: inputs.isqTotal >= 22,
        severity: "high"
      },
      {
        code: "RF-AOS",
        name: "Riesgo alto de apnea obstructiva",
        description: "STOP-BANG \u22655 indica alto riesgo de AOS, requiere polisomnograf\xEDa",
        source: "STOP-BANG",
        value: inputs.stopBangTotal,
        threshold: "\u22655",
        triggered: inputs.stopBangTotal >= 5,
        severity: "high"
      },
      {
        code: "RF-ESS",
        name: "Somnolencia diurna severa",
        description: "ESS \u226518 indica somnolencia severa, riesgo de accidentes",
        source: "ESS",
        value: inputs.essTotal,
        threshold: "\u226518",
        triggered: inputs.essTotal >= 18,
        severity: "high"
      },
      {
        code: "RF-DEP",
        name: "Depresi\xF3n moderada o mayor",
        description: "EMQ \u226510, requiere evaluaci\xF3n y posible tratamiento psiqui\xE1trico (basado en DSM-5)",
        source: "EMQ",
        value: inputs.emqTotal,
        threshold: "\u226510",
        triggered: inputs.emqTotal >= 10,
        severity: "medium"
      },
      {
        code: "RF-ANX",
        name: "Ansiedad moderada o mayor",
        description: "GAD-7 \u226510, la ansiedad contribuye significativamente al insomnio",
        source: "GAD-7",
        value: inputs.gad7Total,
        threshold: "\u226510",
        triggered: inputs.gad7Total >= 10,
        severity: "medium"
      },
      {
        code: "RF-STRESS",
        name: "Estr\xE9s severo",
        description: "DASS-21 estr\xE9s \u226526 (\xD72) indica nivel severo o extremo",
        source: "DASS-21",
        value: inputs.dass21StressScore,
        threshold: "\u226526",
        triggered: inputs.dass21StressScore >= 26,
        severity: "medium"
      },
      {
        code: "RF-OBESITY",
        name: "Obesidad",
        description: "IMC \u226530, factor de riesgo para AOS y mala calidad del sue\xF1o",
        source: "BMI",
        value: inputs.bmi,
        threshold: "\u226530",
        triggered: inputs.bmi >= 30,
        severity: "medium"
      },
      {
        code: "RF-EFFICIENCY",
        name: "Eficiencia del sue\xF1o muy baja",
        description: "Eficiencia <75% indica disrupci\xF3n severa del sue\xF1o",
        source: "Diario sue\xF1o",
        value: inputs.sleepEfficiencyPercent,
        threshold: "<75%",
        triggered: inputs.sleepEfficiencyPercent < 75,
        severity: "medium"
      }
    ];
  }
  function assessRisk(inputs) {
    const flags = evaluateFlags(inputs);
    const triggered = flags.filter((f) => f.triggered);
    const highCount = triggered.filter((f) => f.severity === "high").length;
    const mediumCount = triggered.filter((f) => f.severity === "medium").length;
    let overallRisk;
    let overallRiskLabel;
    if (highCount >= 1 || mediumCount >= 3) {
      overallRisk = "severe";
      overallRiskLabel = "Riesgo severo \u2014 requiere derivaci\xF3n a especialista";
    } else if (mediumCount >= 1 || triggered.length >= 2) {
      overallRisk = "intermediate";
      overallRiskLabel = "Riesgo intermedio \u2014 seguimiento cercano recomendado";
    } else {
      overallRisk = "low";
      overallRiskLabel = "Riesgo bajo \u2014 manejo con recomendaciones est\xE1ndar";
    }
    const referralReasons = [];
    if (triggered.some((f) => f.code === "RF-AOS")) {
      referralReasons.push("Alto riesgo de AOS \u2192 derivar a medicina del sue\xF1o para polisomnograf\xEDa");
    }
    if (triggered.some((f) => f.code === "RF-ISQ")) {
      referralReasons.push("Insomnio severo \u2192 considerar derivaci\xF3n a especialista en sue\xF1o");
    }
    if (triggered.some((f) => f.code === "RF-ESS")) {
      referralReasons.push("Somnolencia severa \u2192 evaluar narcolepsia u otros trastornos de hipersomnia");
    }
    if (triggered.some((f) => f.code === "RF-DEP") && inputs.emqTotal >= 15) {
      referralReasons.push("Depresi\xF3n moderadamente severa/severa \u2192 derivar a psiquiatr\xEDa");
    }
    const summary = triggered.length === 0 ? "No se detectaron banderas de riesgo. Perfil de bajo riesgo." : `${triggered.length} bandera(s) activa(s): ${triggered.map((f) => f.name).join(", ")}. Nivel: ${overallRiskLabel}.`;
    return {
      overallRisk,
      overallRiskLabel,
      flags,
      triggeredFlags: triggered,
      highSeverityCount: highCount,
      mediumSeverityCount: mediumCount,
      requiresSpecialistReferral: referralReasons.length > 0,
      referralReasons,
      summary
    };
  }

  // src/engine/precision.ts
  function calculatePrecision(data) {
    const dimensions = [];
    const missing = [];
    const suggestions = [];
    const questionnaires = [
      { has: data.hasISQ, name: "ISQ", pts: 10 },
      { has: data.hasESS, name: "ESS", pts: 6 },
      { has: data.hasSTOPBANG, name: "STOP-BANG", pts: 6 },
      { has: data.hasEMQ, name: "EMQ", pts: 8 },
      { has: data.hasGAD7, name: "GAD-7", pts: 5 },
      { has: data.hasDASS21, name: "DASS-21", pts: 5 }
    ];
    const qEarned = questionnaires.filter((q) => q.has).reduce((s, q) => s + q.pts, 0);
    const qMissing = questionnaires.filter((q) => !q.has);
    dimensions.push({
      dimension: "Cuestionarios cl\xEDnicos",
      maxPoints: 40,
      earnedPoints: qEarned,
      details: `${questionnaires.filter((q) => q.has).length}/6 completados`
    });
    if (qMissing.length > 0) {
      qMissing.forEach((q) => missing.push(`Cuestionario ${q.name} no completado`));
      if (!data.hasISQ) suggestions.push("Completar el ISQ es esencial para evaluar la severidad del insomnio");
      if (!data.hasEMQ) suggestions.push("El EMQ es necesario para evaluar depresi\xF3n");
    }
    let sleepPts = 0;
    if (data.hasSleepDiary) {
      sleepPts += 8;
      sleepPts += Math.min(12, Math.round(data.hasSleepDiaryDays / 14 * 12));
    }
    dimensions.push({
      dimension: "Datos de sue\xF1o",
      maxPoints: 20,
      earnedPoints: sleepPts,
      details: data.hasSleepDiary ? `Diario de sue\xF1o: ${data.hasSleepDiaryDays} d\xEDas` : "Sin datos de diario de sue\xF1o"
    });
    if (!data.hasSleepDiary) {
      missing.push("Diario de sue\xF1o no completado");
      suggestions.push("Un diario de sue\xF1o de al menos 7 d\xEDas mejora significativamente la precisi\xF3n del an\xE1lisis");
    } else if (data.hasSleepDiaryDays < 7) {
      suggestions.push(`Diario de sue\xF1o con ${data.hasSleepDiaryDays} d\xEDas \u2014 se recomiendan al menos 7 para mayor representatividad`);
    }
    let bioPts = 0;
    if (data.hasBMI) bioPts += 10;
    if (data.hasNeckCircumference) bioPts += 5;
    dimensions.push({
      dimension: "Datos biom\xE9tricos",
      maxPoints: 15,
      earnedPoints: bioPts,
      details: `IMC: ${data.hasBMI ? "s\xED" : "no"}, Cuello: ${data.hasNeckCircumference ? "s\xED" : "no"}`
    });
    if (!data.hasBMI) {
      missing.push("IMC no calculado (faltan peso/talla)");
      suggestions.push("El IMC es necesario para el STOP-BANG y evaluaci\xF3n de riesgo de AOS");
    }
    const labs = [
      { has: data.hasLabVitD, name: "Vitamina D", pts: 3 },
      { has: data.hasLabB12, name: "Vitamina B12", pts: 2 },
      { has: data.hasLabIron, name: "Hierro s\xE9rico", pts: 2 },
      { has: data.hasLabFerritin, name: "Ferritina", pts: 2 },
      { has: data.hasLabMagnesium, name: "Magnesio", pts: 2 },
      { has: data.hasLabTSH, name: "TSH", pts: 2 },
      { has: data.hasLabGlucose, name: "Glucemia", pts: 2 }
    ];
    const labPts = labs.filter((l) => l.has).reduce((s, l) => s + l.pts, 0);
    dimensions.push({
      dimension: "Laboratorios",
      maxPoints: 15,
      earnedPoints: labPts,
      details: `${labs.filter((l) => l.has).length}/7 par\xE1metros disponibles`
    });
    if (labs.some((l) => !l.has)) {
      labs.filter((l) => !l.has).forEach((l) => missing.push(`${l.name} no disponible`));
      if (!data.hasLabVitD) suggestions.push("La vitamina D baja est\xE1 asociada a peor calidad de sue\xF1o");
    }
    let genPts = 0;
    if (data.hasGenetics) {
      genPts = Math.min(10, data.geneticVariantsCount * 2);
    }
    dimensions.push({
      dimension: "Variantes gen\xE9ticas",
      maxPoints: 10,
      earnedPoints: genPts,
      details: data.hasGenetics ? `${data.geneticVariantsCount}/5 variantes analizadas` : "Sin datos gen\xE9ticos"
    });
    if (!data.hasGenetics) {
      missing.push("An\xE1lisis gen\xE9tico no disponible");
    }
    const totalEarned = dimensions.reduce((s, d) => s + d.earnedPoints, 0);
    const totalMax = dimensions.reduce((s, d) => s + d.maxPoints, 0);
    const percent = Math.round(totalEarned / totalMax * 100);
    let level;
    let label;
    if (percent >= 80) {
      level = "high";
      label = "Alta confianza \u2014 an\xE1lisis completo";
    } else if (percent >= 60) {
      level = "moderate";
      label = "Confianza moderada \u2014 an\xE1lisis \xFAtil con limitaciones";
    } else if (percent >= 40) {
      level = "low";
      label = "Confianza baja \u2014 an\xE1lisis preliminar";
    } else {
      level = "insufficient";
      label = "Datos insuficientes \u2014 solicitar m\xE1s informaci\xF3n";
    }
    return {
      confidencePercent: percent,
      confidenceLevel: level,
      confidenceLabel: label,
      dimensions,
      missingData: missing,
      improvementSuggestions: suggestions
    };
  }

  // src/lab/parameters.ts
  var LAB_PARAMETERS = {
    vitD: {
      code: "vitD",
      name: "Vitamina D (25-OH-D)",
      unit: "ng/mL",
      ranges: {
        normal: { min: 20, max: 100 },
        optimal: { min: 40, max: 60 }
      },
      sleepRelevance: "Niveles bajos asociados a menor duraci\xF3n y peor calidad del sue\xF1o. Receptores de vitamina D presentes en \xE1reas cerebrales reguladoras del sue\xF1o.",
      reference: "Gao Q et al. Nutrients. 2018;10(10):1395."
    },
    b12: {
      code: "b12",
      name: "Vitamina B12",
      unit: "pg/mL",
      ranges: {
        normal: { min: 200, max: 900 },
        optimal: { min: 400, max: 700 }
      },
      sleepRelevance: "Cofactor en la s\xEDntesis de melatonina v\xEDa SAM (S-adenosilmetionina). Deficiencia puede alterar ritmo circadiano.",
      reference: "Mayer G et al. J Clin Sleep Med. 2014;10(6):613-614."
    },
    iron: {
      code: "iron",
      name: "Hierro s\xE9rico",
      unit: "\u03BCg/dL",
      ranges: {
        normal: { min: 60, max: 170 },
        optimal: { min: 80, max: 150 }
      },
      sleepRelevance: "Deficiencia de hierro es la causa m\xE1s com\xFAn de s\xEDndrome de piernas inquietas, que interrumpe el sue\xF1o.",
      reference: "Allen RP et al. Sleep Med. 2003;4(2):101-119."
    },
    ferritin: {
      code: "ferritin",
      name: "Ferritina",
      unit: "\u03BCg/L",
      ranges: {
        normal: { min: 12, max: 300 },
        optimal: { min: 75, max: 200 }
      },
      sleepRelevance: "Ferritina <75 \u03BCg/L: considerar suplementaci\xF3n de hierro, especialmente si hay s\xEDntomas de piernas inquietas. Umbral terap\xE9utico para RLS.",
      reference: "Allen RP et al. Sleep Med. 2003;4(2):101-119."
    },
    magnesium: {
      code: "magnesium",
      name: "Magnesio s\xE9rico",
      unit: "mg/dL",
      ranges: {
        normal: { min: 1.7, max: 2.2 },
        optimal: { min: 2, max: 2.2 }
      },
      sleepRelevance: "Magnesio regula receptores GABA-A y NMDA, implicados en la iniciaci\xF3n y mantenimiento del sue\xF1o.",
      reference: "Abbasi B et al. J Res Med Sci. 2012;17(12):1161-1169."
    },
    tsh: {
      code: "tsh",
      name: "TSH",
      unit: "mUI/L",
      ranges: {
        normal: { min: 0.4, max: 4 },
        optimal: { min: 0.5, max: 2.5 }
      },
      sleepRelevance: "Hipotiroidismo: somnolencia, apnea. Hipertiroidismo: insomnio, ansiedad. Ambos alteran arquitectura del sue\xF1o.",
      reference: "Biondi B et al. Thyroid. 2019;29(1):10-58."
    },
    glucose: {
      code: "glucose",
      name: "Glucemia en ayunas",
      unit: "mg/dL",
      ranges: {
        normal: { min: 70, max: 100 },
        optimal: { min: 75, max: 95 }
      },
      sleepRelevance: "Hiperglucemia y resistencia a insulina se asocian a fragmentaci\xF3n del sue\xF1o y mayor riesgo de AOS.",
      reference: "Reutrakul S et al. Chest. 2015;147(5):1387-1394."
    }
  };
  function classifyValue(value, param) {
    const { normal, optimal } = param.ranges;
    if (normal.min !== void 0 && value < normal.min * 0.5) {
      return { status: "critical", label: "Cr\xEDticamente bajo" };
    }
    if (normal.max !== void 0 && value > normal.max * 1.5) {
      return { status: "critical", label: "Cr\xEDticamente elevado" };
    }
    if (normal.min !== void 0 && value < normal.min) {
      return { status: "deficient", label: "Bajo / Deficiente" };
    }
    if (normal.max !== void 0 && value > normal.max) {
      return { status: "elevated", label: "Elevado" };
    }
    if (optimal) {
      if (optimal.min !== void 0 && value < optimal.min) {
        return { status: "suboptimal", label: "Normal bajo (sub\xF3ptimo para sue\xF1o)" };
      }
      if (optimal.max !== void 0 && value > optimal.max) {
        return { status: "normal", label: "Normal alto" };
      }
      return { status: "optimal", label: "\xD3ptimo" };
    }
    return { status: "normal", label: "Normal" };
  }
  function analyzeLabValue(parameterCode, value) {
    const param = LAB_PARAMETERS[parameterCode];
    if (!param) {
      throw new Error(`Par\xE1metro de laboratorio desconocido: ${parameterCode}`);
    }
    const { status, label } = classifyValue(value, param);
    let interpretation = "";
    let sleepImplication = "";
    switch (status) {
      case "critical":
      case "deficient":
        interpretation = `${param.name} = ${value} ${param.unit}. ${label}. Requiere evaluaci\xF3n y probable correcci\xF3n.`;
        sleepImplication = param.sleepRelevance;
        break;
      case "suboptimal":
        interpretation = `${param.name} = ${value} ${param.unit}. ${label}. Dentro de rango normal pero por debajo del \xF3ptimo.`;
        sleepImplication = `Nivel sub\xF3ptimo puede contribuir: ${param.sleepRelevance}`;
        break;
      case "elevated":
        interpretation = `${param.name} = ${value} ${param.unit}. ${label}. Requiere seguimiento.`;
        sleepImplication = param.sleepRelevance;
        break;
      case "optimal":
        interpretation = `${param.name} = ${value} ${param.unit}. ${label}. Sin correcci\xF3n necesaria.`;
        sleepImplication = "Sin impacto negativo esperado en el sue\xF1o.";
        break;
      default:
        interpretation = `${param.name} = ${value} ${param.unit}. ${label}.`;
        sleepImplication = "Sin impacto significativo esperado.";
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
      reference: param.reference
    };
  }
  function analyzeLabPanel(values) {
    const results = [];
    for (const [code, value] of Object.entries(values)) {
      if (LAB_PARAMETERS[code]) {
        results.push(analyzeLabValue(code, value));
      }
    }
    const deficiencies = results.filter(
      (r) => r.status === "deficient" || r.status === "critical" || r.status === "suboptimal"
    );
    const elevations = results.filter((r) => r.status === "elevated");
    let summary = `${results.length} par\xE1metros analizados.`;
    if (deficiencies.length > 0) {
      summary += ` Deficiencias/sub\xF3ptimos: ${deficiencies.map((d) => d.parameterName).join(", ")}.`;
    }
    if (elevations.length > 0) {
      summary += ` Elevados: ${elevations.map((e) => e.parameterName).join(", ")}.`;
    }
    if (deficiencies.length === 0 && elevations.length === 0) {
      summary += " Todos los valores dentro de rango normal/\xF3ptimo.";
    }
    return { results, deficiencies, elevations, summary };
  }

  // src/lab/genetics.ts
  var VARIANT_DEFS = {
    CLOCK: {
      gene: "CLOCK",
      rsId: "rs1801260",
      genotypeInterpretations: {
        "T/T": {
          impact: "neutral",
          label: "Sin efecto significativo",
          interpretation: "Genotipo m\xE1s com\xFAn. Sin tendencia particular hacia vespertinidad.",
          implication: "Cronotipo probablemente determinado por otros factores."
        },
        "T/C": {
          impact: "moderate",
          label: "Tendencia a vespertinidad leve",
          interpretation: "Portador heterocigoto del alelo C. Posible tendencia a acostarse m\xE1s tarde.",
          implication: "Considerar horarios de sue\xF1o flexibles. La melatonina ex\xF3gena puede ser especialmente \xFAtil para adelantar fase."
        },
        "C/C": {
          impact: "significant",
          label: "Cronotipo vespertino marcado",
          interpretation: 'Homocigoto para alelo C. Fuerte tendencia a ser "b\xFAho" (vespertino). Dificultad para dormirse temprano.',
          implication: "Melatonina ex\xF3gena en dosis baja 3-4h antes del horario deseado de sue\xF1o. Terapia de luz matutina. Evitar exigir horarios muy matutinos."
        }
      },
      reference: "Katzenberg D et al. Sleep. 1998;21(6):569-576."
    },
    PER2: {
      gene: "PER2",
      rsId: "rs2304672",
      genotypeInterpretations: {
        "C/C": {
          impact: "neutral",
          label: "Sin efecto significativo",
          interpretation: "Genotipo m\xE1s com\xFAn. Fase de sue\xF1o normal.",
          implication: "Sin implicaciones cronobiol\xF3gicas espec\xEDficas."
        },
        "C/G": {
          impact: "moderate",
          label: "Posible tendencia a matutinidad",
          interpretation: "Portador heterocigoto. Posible tendencia a despertarse temprano.",
          implication: "Monitorear despertar precoz matutino como patr\xF3n de mantenimiento."
        },
        "G/G": {
          impact: "significant",
          label: "S\xEDndrome de fase avanzada",
          interpretation: "Homocigoto para variante asociada a fase avanzada. Tendencia a dormirse y despertarse muy temprano.",
          implication: "Terapia de luz vespertina. Evitar luz azul matutina. Melatonina matutina cronobiol\xF3gica (off-label, solo bajo supervisi\xF3n)."
        }
      },
      reference: "Toh KL et al. Science. 2001;291(5506):1040-1043."
    },
    ADORA2A: {
      gene: "ADORA2A",
      rsId: "rs5751876",
      genotypeInterpretations: {
        "C/C": {
          impact: "neutral",
          label: "Sensibilidad normal a cafe\xEDna",
          interpretation: "Metabolismo y respuesta a cafe\xEDna est\xE1ndar.",
          implication: "Recomendaci\xF3n est\xE1ndar: evitar cafe\xEDna 6-8h antes de acostarse."
        },
        "C/T": {
          impact: "moderate",
          label: "Sensibilidad aumentada a cafe\xEDna",
          interpretation: "Portador heterocigoto. Mayor disruci\xF3n del sue\xF1o por cafe\xEDna.",
          implication: "Cortar cafe\xEDna al menos 8-10h antes de acostarse. Limitar a 1-2 tazas matutinas."
        },
        "T/T": {
          impact: "significant",
          label: "Alta sensibilidad a cafe\xEDna",
          interpretation: "Homocigoto T. La cafe\xEDna afecta significativamente la calidad y latencia del sue\xF1o.",
          implication: "Considerar eliminaci\xF3n completa de cafe\xEDna o limitarla estrictamente a las ma\xF1anas (antes de 10:00). Peque\xF1as cantidades pueden causar insomnio."
        }
      },
      reference: "R\xE9tey JV et al. Proc Natl Acad Sci. 2007;104(7):2699-2704."
    },
    COMT: {
      gene: "COMT",
      rsId: "rs4680",
      genotypeInterpretations: {
        "Val/Val": {
          impact: "neutral",
          label: "Degradaci\xF3n r\xE1pida de catecolaminas",
          interpretation: "Actividad alta de COMT. Menor tendencia a ansiedad por acumulaci\xF3n de catecolaminas.",
          implication: "Menor beneficio esperado del magnesio para ansiedad nocturna."
        },
        "Val/Met": {
          impact: "moderate",
          label: "Actividad intermedia de COMT",
          interpretation: "Actividad intermedia. Perfil equilibrado.",
          implication: "Puede beneficiarse de t\xE9cnicas de relajaci\xF3n. Magnesio puede ser \xFAtil como coadyuvante."
        },
        "Met/Met": {
          impact: "significant",
          label: "Degradaci\xF3n lenta \u2014 tendencia a ansiedad",
          interpretation: "Actividad baja de COMT. Acumulaci\xF3n de dopamina/noradrenalina. Mayor tendencia a ansiedad, rumiaci\xF3n nocturna.",
          implication: "Priorizar t\xE9cnicas de relajaci\xF3n y TCC-I. Magnesio glicinato especialmente recomendado. L-teanina como coadyuvante."
        }
      },
      reference: "Lotta T et al. Biochemistry. 1995;34(13):4202-4210."
    },
    MTHFR: {
      gene: "MTHFR",
      rsId: "rs1801133",
      genotypeInterpretations: {
        "C/C": {
          impact: "neutral",
          label: "Actividad enzim\xE1tica normal",
          interpretation: "Sin reducci\xF3n de actividad MTHFR. Metabolismo de folato normal.",
          implication: "Sin implicaciones espec\xEDficas para suplementaci\xF3n."
        },
        "C/T": {
          impact: "moderate",
          label: "Actividad reducida ~35%",
          interpretation: "Heterocigoto. Actividad MTHFR reducida aproximadamente 35%.",
          implication: "Considerar suplementaci\xF3n con metilfolato (no \xE1cido f\xF3lico). Monitorear B12 y homociste\xEDna."
        },
        "T/T": {
          impact: "significant",
          label: "Actividad reducida ~70%",
          interpretation: "Homocigoto T. Actividad MTHFR reducida ~70%. Puede afectar s\xEDntesis de serotonina \u2192 melatonina.",
          implication: "Suplementar con L-metilfolato (5-MTHF). Asegurar niveles \xF3ptimos de B12. La v\xEDa de s\xEDntesis de melatonina puede estar comprometida."
        }
      },
      reference: "Frosst P et al. Nat Genet. 1995;10(1):111-113."
    }
  };
  function analyzeVariant(geneName, genotype) {
    const def = VARIANT_DEFS[geneName];
    if (!def) {
      throw new Error(`Gen no reconocido: ${geneName}. Genes soportados: ${Object.keys(VARIANT_DEFS).join(", ")}`);
    }
    const interp = def.genotypeInterpretations[genotype];
    if (!interp) {
      throw new Error(
        `Genotipo ${genotype} no reconocido para ${geneName}. Genotipos soportados: ${Object.keys(def.genotypeInterpretations).join(", ")}`
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
      reference: def.reference
    };
  }
  function analyzeGeneticProfile(variants) {
    const results = [];
    for (const [gene, genotype] of Object.entries(variants)) {
      results.push(analyzeVariant(gene, genotype));
    }
    const clockResult = results.find((r) => r.gene === "CLOCK");
    const per2Result = results.find((r) => r.gene === "PER2");
    let chronotype = "No evaluado (sin datos CLOCK/PER2).";
    if (clockResult && clockResult.impact === "significant") {
      chronotype = "Tendencia gen\xE9tica a vespertinidad marcada (CLOCK C/C).";
    } else if (per2Result && per2Result.impact === "significant") {
      chronotype = "Tendencia gen\xE9tica a matutinidad marcada (PER2 G/G).";
    } else if (clockResult || per2Result) {
      chronotype = "Sin tendencia cronobiol\xF3gica fuerte por gen\xE9tica.";
    }
    const adora = results.find((r) => r.gene === "ADORA2A");
    let caffeine = "Recomendaci\xF3n est\xE1ndar: evitar cafe\xEDna 6-8h antes de acostarse.";
    if (adora?.impact === "significant") {
      caffeine = "ALTA sensibilidad gen\xE9tica a cafe\xEDna. Considerar eliminaci\xF3n o restricci\xF3n estricta a ma\xF1anas.";
    } else if (adora?.impact === "moderate") {
      caffeine = "Sensibilidad aumentada a cafe\xEDna. Cortar al menos 8-10h antes de dormir.";
    }
    const suppNotes = [];
    const comt = results.find((r) => r.gene === "COMT");
    const mthfr = results.find((r) => r.gene === "MTHFR");
    if (comt?.impact === "significant") {
      suppNotes.push("COMT Met/Met: magnesio glicinato y L-teanina especialmente indicados para manejo de ansiedad nocturna.");
    }
    if (mthfr?.impact === "significant") {
      suppNotes.push("MTHFR T/T: suplementar con L-metilfolato. Verificar B12 y homociste\xEDna. La s\xEDntesis de melatonina puede estar comprometida.");
    } else if (mthfr?.impact === "moderate") {
      suppNotes.push("MTHFR C/T: considerar metilfolato. Monitorear niveles de B12.");
    }
    const significant = results.filter((r) => r.impact === "significant");
    const summary = significant.length === 0 ? `${results.length} variantes analizadas. Sin hallazgos gen\xE9ticos de alto impacto.` : `${results.length} variantes analizadas. ${significant.length} hallazgo(s) significativo(s): ${significant.map((r) => `${r.gene} (${r.genotype})`).join(", ")}.`;
    return {
      variants: results,
      chronotypeInfluence: chronotype,
      caffeineAdvice: caffeine,
      supplementNotes: suppNotes,
      summary
    };
  }

  // src/references.ts
  var REFERENCES = {
    // ===================================================================
    // INSTRUMENTOS DE EVALUACIÓN VALIDADOS
    // ===================================================================
    REF_ISQ: {
      id: "REF_ISQ",
      citation: "SomnoSalud-ISQ (Insomnia Screening Questionnaire, SomnoSalud original). Basado en ICSD-3. 7 ítems scored 0-4 (0-28 total).",
      doi: void 0,
      pmid: void 0,
      usedBy: ["scoring/isq.ts", "engine/phenotype.ts"],
      evidenceLevel: "A",
      notes: "SomnoSalud-ISQ: instrumento original basado en criterios ICSD-3. Puntos de corte: 0-7 sin insomnio, 8-14 leve, 15-21 moderado, 22-28 severo."
    },
    // Referencia bibliográfica del Insomnia Severity Index (base teórica del ISQ)
    REF_BASTIEN_2001: {
      id: "REF_BASTIEN_2001",
      citation: "Bastien CH, Valli\xE8res A, Morin CM. Validation of the Insomnia Severity Index as an outcome measure for insomnia research. Sleep Med. 2001;2(4):297-307.",
      doi: "10.1016/S1389-9457(00)00065-4",
      pmid: "11438246",
      usedBy: ["scoring/isq.ts", "engine/phenotype.ts"],
      evidenceLevel: "A",
      notes: "Referencia bibliográfica: instrumento original validado para evaluación de severidad del insomnio. Base teórica para SomnoSalud-ISQ."
    },
    REF_ESS: {
      id: "REF_ESS",
      citation: "Johns MW. A new method for measuring daytime sleepiness: the Epworth sleepiness scale. Sleep. 1991;14(6):540-545.",
      doi: "10.1093/sleep/14.6.540",
      pmid: "1798888",
      usedBy: ["scoring/ess.ts"],
      evidenceLevel: "A",
      notes: "Escala autoadministrada de 8 \xEDtems. Eval\xFAa propensi\xF3n al sue\xF1o diurno en situaciones cotidianas. Punto de corte cl\xEDnico \u226511."
    },
    REF_STOPBANG: {
      id: "REF_STOPBANG",
      citation: "Chung F, Yegneswaran B, Liao P, et al. STOP Questionnaire: a tool to screen patients for obstructive sleep apnea. Anesthesiology. 2008;108(5):812-821.",
      doi: "10.1097/ALN.0b013e31816d83e4",
      pmid: "18431116",
      usedBy: ["scoring/stop-bang.ts", "engine/risk-integrator.ts"],
      evidenceLevel: "A",
      notes: "Sensibilidad >90% para AOS moderada-severa con score \u22653. Puntos de corte: 0-2 bajo, 3-4 intermedio, \u22655 alto riesgo."
    },
    REF_EMQ: {
      id: "REF_EMQ",
      citation: "SomnoSalud-EMQ (Emotional Mood Questionnaire, SomnoSalud original). Basado en DSM-5. 9 ítems scored 0-3 (0-27 total).",
      doi: "10.1046/j.1525-1497.2001.016009606.x",
      pmid: "11556941",
      usedBy: ["scoring/emq.ts", "safety/rules.ts"],
      evidenceLevel: "A",
      notes: "SomnoSalud-EMQ: instrumento original basado en criterios DSM-5. Puntos de corte: 0-9 mínima, 10-14 leve, 15-19 moderada, 20-27 severa. Excluye ítems de ideación suicida."
    },
    REF_GAD7: {
      id: "REF_GAD7",
      citation: "Spitzer RL, Kroenke K, Williams JBW, L\xF6we B. A brief measure for assessing generalized anxiety disorder: the GAD-7. Arch Intern Med. 2006;166(10):1092-1097.",
      doi: "10.1001/archinte.166.10.1092",
      pmid: "16717171",
      usedBy: ["scoring/gad7.ts"],
      evidenceLevel: "A",
      notes: "Sensibilidad 89%, especificidad 82% para TAG con punto de corte \u226510. Validado en espa\xF1ol."
    },
    REF_DASS21: {
      id: "REF_DASS21",
      citation: "Lovibond SH, Lovibond PF. Manual for the Depression Anxiety Stress Scales. 2nd ed. Sydney: Psychology Foundation of Australia; 1995.",
      doi: void 0,
      pmid: void 0,
      usedBy: ["scoring/dass21.ts"],
      evidenceLevel: "A",
      notes: "Scores de cada subescala se multiplican \xD72 para equiparar con DASS-42. Validaci\xF3n en espa\xF1ol: Daza P et al. (2002) J Psychopathol Behav Assess. 24(3):195-205."
    },
    // ===================================================================
    // TRATAMIENTOS — CONDUCTUALES
    // ===================================================================
    REF_TCCI: {
      id: "REF_TCCI",
      citation: "Morin CM, Bootzin RR, Buysse DJ, et al. Psychological and behavioral treatment of insomnia: update of the recent evidence (1998-2004). Sleep. 2006;29(11):1398-1414.",
      doi: "10.1093/sleep/29.11.1398",
      pmid: "17162986",
      usedBy: ["engine/recommendations.ts"],
      evidenceLevel: "A",
      notes: "TCC-I es tratamiento de primera l\xEDnea para insomnio cr\xF3nico. Efectividad 70-80% sostenida a largo plazo. Recomendada por AASM, ACP, NICE."
    },
    REF_SLEEP_HYGIENE: {
      id: "REF_SLEEP_HYGIENE",
      citation: "Irish LA, Kline CE, Gunn HE, Buysse DJ, Hall MH. The role of sleep hygiene in promoting public health: A review of empirical evidence. Sleep Med Rev. 2015;22:23-36.",
      doi: "10.1016/j.smrv.2014.10.001",
      pmid: "25454674",
      usedBy: ["engine/recommendations.ts"],
      evidenceLevel: "A",
      notes: "Higiene del sue\xF1o como componente fundamental. Efectividad como monoterapia: 60-70%. Mejor como parte de TCC-I."
    },
    REF_RELAXATION: {
      id: "REF_RELAXATION",
      citation: "Ong JC, Manber R, Segal Z, Xia Y, Shapiro S, Wyatt JK. A randomized controlled trial of mindfulness meditation for chronic insomnia. Sleep. 2014;37(9):1553-1563.",
      doi: "10.5665/sleep.4010",
      pmid: "25142566",
      usedBy: ["engine/recommendations.ts"],
      evidenceLevel: "B",
      notes: "Mindfulness y relajaci\xF3n muscular progresiva muestran efectividad 50-60% como adjunto."
    },
    // ===================================================================
    // TRATAMIENTOS — SUPLEMENTOS
    // ===================================================================
    REF_MELATONIN: {
      id: "REF_MELATONIN",
      citation: "Ferracioli-Oda E, Qawasmi A, Bloch MH. Meta-analysis: melatonin for the treatment of primary sleep disorders. PLoS One. 2013;8(5):e63773.",
      doi: "10.1371/journal.pone.0063773",
      pmid: "23691095",
      usedBy: ["engine/recommendations.ts"],
      evidenceLevel: "B",
      notes: "Reduce latencia del sue\xF1o en 7.06 min (IC95%: 4.37-9.75). Dosis recomendada: 0.5-3 mg. CONTRAINDICADA con anticoagulantes (SAFE-040) y embarazo (SAFE-020)."
    },
    REF_MELATONIN_ANTICOAG: {
      id: "REF_MELATONIN_ANTICOAG",
      citation: "Herxheimer A, Petrie KJ. Melatonin for the prevention and treatment of jet lag. Cochrane Database Syst Rev. 2002;(2):CD001520.",
      doi: "10.1002/14651858.CD001520",
      pmid: "12076414",
      usedBy: ["safety/rules.ts"],
      evidenceLevel: "B",
      notes: "Documenta interacci\xF3n melatonina-anticoagulantes: melatonina potencia efecto anticoagulante de warfarina. Base para SAFE-040."
    },
    REF_MAGNESIUM: {
      id: "REF_MAGNESIUM",
      citation: "Abbasi B, Kimiagar M, Sadeghniiat K, Shirazi MM, Hedayati M, Rashidkhani B. The effect of magnesium supplementation on primary insomnia in elderly: A double-blind placebo-controlled clinical trial. J Res Med Sci. 2012;17(12):1161-1169.",
      pmid: "23853635",
      usedBy: ["engine/recommendations.ts"],
      evidenceLevel: "B",
      notes: "Magnesio (500 mg/d\xEDa \xD7 8 sem) mejor\xF3 \xEDndice de insomnio, eficiencia del sue\xF1o, latencia y despertar temprano vs placebo. Glicinato tiene mejor biodisponibilidad."
    },
    REF_LTHEANINE: {
      id: "REF_LTHEANINE",
      citation: "Hidese S, Ogawa S, Ota M, et al. Effects of L-Theanine Administration on Stress-Related Symptoms and Cognitive Functions in Healthy Adults: A Randomized Controlled Trial. Nutrients. 2019;11(10):2362.",
      doi: "10.3390/nu11102362",
      pmid: "31623400",
      usedBy: ["engine/recommendations.ts"],
      evidenceLevel: "B",
      notes: "200 mg/d\xEDa mejor\xF3 calidad de sue\xF1o subjetiva y redujo estr\xE9s. Sin contraindicaciones significativas conocidas."
    },
    REF_GLYCINE: {
      id: "REF_GLYCINE",
      citation: "Bannai M, Kawai N, Ono K, Nakahara K, Murakami N. The effects of glycine on subjective daytime performance in partially sleep-restricted healthy volunteers. Front Neurol. 2012;3:61.",
      doi: "10.3389/fneur.2012.00061",
      pmid: "22529837",
      usedBy: ["engine/recommendations.ts"],
      evidenceLevel: "B",
      notes: "3 g antes de dormir mejor\xF3 calidad subjetiva del sue\xF1o y rendimiento diurno. Mecanismo: agonismo de receptores NMDA hipotal\xE1micos, reducci\xF3n de temperatura corporal."
    },
    // ===================================================================
    // SEGURIDAD Y POBLACIONES ESPECIALES
    // ===================================================================
    REF_PREGNANCY_SLEEP: {
      id: "REF_PREGNANCY_SLEEP",
      citation: "Sedov ID, Anderson NJ, Dhillon AK, Tomfohr-Madsen LM. Insomnia symptoms during pregnancy: A meta-analysis. J Sleep Res. 2021;30(1):e13207.",
      doi: "10.1111/jsr.13207",
      pmid: "33140560",
      usedBy: ["safety/rules.ts", "engine/recommendations.ts"],
      evidenceLevel: "A",
      notes: "Base para SAFE-020. Prevalencia de insomnio en embarazo: 38.2%. Solo TCC-I y medidas conductuales recomendadas. Melatonina y suplementos contraindicados."
    },
    // ===================================================================
    // GENÉTICA DEL SUEÑO
    // ===================================================================
    REF_CLOCK_GENE: {
      id: "REF_CLOCK_GENE",
      citation: "Takahashi JS. Transcriptional architecture of the mammalian circadian clock. Nat Rev Genet. 2017;18(3):164-179.",
      doi: "10.1038/nrg.2016.150",
      pmid: "27990019",
      usedBy: ["lab/genetics.ts"],
      evidenceLevel: "A",
      notes: "CLOCK y PER2 son genes core del reloj circadiano. Variantes 3111T/C de CLOCK asociadas con cronotipo nocturno."
    },
    REF_ADORA2A: {
      id: "REF_ADORA2A",
      citation: "Retey JV, Adam M, Khatami R, et al. A genetic variation in the adenosine A2A receptor gene (ADORA2A) contributes to individual sensitivity to caffeine effects on sleep. Clin Pharmacol Ther. 2007;81(5):692-698.",
      doi: "10.1038/sj.clpt.6100102",
      pmid: "17329989",
      usedBy: ["lab/genetics.ts"],
      evidenceLevel: "B",
      notes: "Polimorfismo 1976T>C de ADORA2A determina sensibilidad individual a cafe\xEDna. Variante C asociada con mayor sensibilidad."
    },
    REF_COMT: {
      id: "REF_COMT",
      citation: "Bodenmann S, Xu S, Luhmann UFO, et al. Pharmacogenetics of modafinil after sleep loss: catechol-O-methyltransferase genotype modulates waking functions but not recovery sleep. Clin Pharmacol Ther. 2009;85(3):296-304.",
      doi: "10.1038/clpt.2008.222",
      pmid: "19037198",
      usedBy: ["lab/genetics.ts"],
      evidenceLevel: "B",
      notes: "COMT Val158Met: Val/Val = metabolismo r\xE1pido de catecolaminas (menor estr\xE9s), Met/Met = metabolismo lento (mayor sensibilidad al estr\xE9s, peor sue\xF1o bajo estr\xE9s)."
    },
    REF_MTHFR: {
      id: "REF_MTHFR",
      citation: "Frosst P, Blom HJ, Milos R, et al. A candidate genetic risk factor for vascular disease: a common mutation in methylenetetrahydrofolate reductase. Nat Genet. 1995;10(1):111-113.",
      doi: "10.1038/ng0595-111",
      pmid: "7647779",
      usedBy: ["lab/genetics.ts"],
      evidenceLevel: "B",
      notes: "MTHFR C677T: variante TT reduce actividad enzim\xE1tica ~70%, afectando metabolismo de folato y B12. Relevante para neurotransmisi\xF3n serotonin\xE9rgica y sue\xF1o."
    }
  };
  function getReferencesForModule(modulePath) {
    return Object.values(REFERENCES).filter(
      (ref) => ref.usedBy.includes(modulePath)
    );
  }
  function getReference(id) {
    return REFERENCES[id];
  }
  function validateReferences() {
    const errors = [];
    for (const [id, ref] of Object.entries(REFERENCES)) {
      if (!ref.citation) errors.push(`${id}: falta citaci\xF3n`);
      if (ref.usedBy.length === 0) errors.push(`${id}: sin m\xF3dulos asociados`);
    }
    return { valid: errors.length === 0, errors };
  }
  return __toCommonJS(index_exports);
})();
/**
 * SomnoSalud Clinical Engine — Módulo Principal
 * =================================================
 * Motor de lógica clínica verificable para evaluación
 * integral de trastornos del sueño.
 *
 * Este módulo es INDEPENDIENTE del front-end y puede ser
 * consumido por cualquier framework (Lovable, Next.js, etc.).
 *
 * Todos los algoritmos, puntos de corte y recomendaciones
 * están respaldados por publicaciones científicas indexadas
 * con DOI y PMID verificables.
 *
 * @author SomnoSalud Team
 * @version 1.0.0
 * @license Proprietary
 */
