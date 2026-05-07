# SomnoSalud Clinical Engine v1.0.0

Motor de lógica clínica **verificable** para evaluación integral de trastornos del sueño.

Cada algoritmo, punto de corte y recomendación está respaldado por publicaciones científicas indexadas con DOI/PMID verificables.

---

## Arquitectura

```
somnosalud-clinical-engine/
├── src/
│   ├── index.ts                 # Exports públicos
│   ├── types.ts                 # Interfaces compartidas
│   ├── references.ts            # Base de datos de referencias científicas
│   ├── scoring/                 # Instrumentos validados
│   │   ├── isi.ts               # Insomnia Severity Index
│   │   ├── ess.ts               # Epworth Sleepiness Scale
│   │   ├── stop-bang.ts         # STOP-BANG (riesgo AOS)
│   │   ├── phq9.ts             # Patient Health Questionnaire-9
│   │   ├── gad7.ts             # Generalized Anxiety Disorder-7
│   │   ├── dass21.ts           # Depression Anxiety Stress Scales-21
│   │   └── bmi.ts              # Índice de Masa Corporal
│   ├── safety/                  # Reglas de seguridad clínica
│   │   └── rules.ts            # SAFE-010 a SAFE-040
│   ├── engine/                  # Motor de decisión
│   │   ├── phenotype.ts        # Clasificación de fenotipo de insomnio
│   │   ├── recommendations.ts  # Recomendaciones terapéuticas
│   │   ├── risk-integrator.ts  # Integración de riesgo
│   │   ├── precision.ts        # Calculador de confianza
│   │   ├── ema.ts              # Despertar precoz (EMA)
│   │   ├── parasomnias.ts      # Parasomnias y RBD
│   │   ├── circadian-disorders.ts # Trastornos del ritmo circadiano
│   │   ├── rls.ts              # Síndrome de piernas inquietas
│   │   ├── sahos-treatment.ts  # Escalera terapéutica SAHOS
│   │   ├── sleep-stages.ts     # Moduladores de etapas del sueño
│   │   ├── narcolepsy.ts       # Narcolepsia (screening + no-pharm)
│   │   └── sleep-hygiene.ts    # 13 intervenciones de higiene
│   └── lab/                     # Laboratorio y genética
│       ├── parameters.ts       # Rangos de referencia
│       └── genetics.ts         # Variantes genéticas
└── tests/
    └── scoring.test.ts          # Tests unitarios (50+ tests)
```

## Principio de diseño

Este módulo es **100% independiente del front-end**. Puede ser consumido por Lovable, Next.js, React Native, o cualquier framework. No contiene UI, no depende de ningún framework visual, y expone funciones puras con tipos estrictos de TypeScript.

---

## Módulos

### 1. Scoring — Instrumentos validados

| Instrumento | Función | Referencia |
|---|---|---|
| ISI | `scoreISI(responses)` | Bastien CH et al. Sleep Med. 2001;2(4):297-307 |
| ESS | `scoreESS(responses)` | Johns MW. Sleep. 1991;14(6):540-545 |
| STOP-BANG | `scoreSTOPBANG(manual, auto)` | Chung F et al. Anesthesiology. 2008;108(5):812-821 |
| PHQ-9 | `scorePHQ9(responses)` | Kroenke K et al. J Gen Intern Med. 2001;16(9):606-613 |
| GAD-7 | `scoreGAD7(responses)` | Spitzer RL et al. Arch Intern Med. 2006;166(10):1092-1097 |
| DASS-21 | `scoreDASS21(responses)` | Lovibond SH & Lovibond PF. Manual for the DASS. 1995 |
| BMI | `calculateBMI(kg, cm)` | WHO Expert Consultation. Lancet. 2004;363(9403):157-163 |

### 2. Safety — Reglas de seguridad clínica

| Código | Regla | Severidad | Acción |
|---|---|---|---|
| SAFE-010 | Edad < 18 años | block | Bloquea todo el análisis |
| SAFE-020 | Embarazo | restrict | Solo intervenciones conductuales |
| SAFE-040 | Anticoagulantes | warn | Bloquea melatonina |

Referencia principal: Buscemi N et al. J Gen Intern Med. 2007;22(7):1024-1034 (seguridad melatonina).

### 3. Engine — Motor de decisión clínica

**Fenotipo de insomnio** (`classifyInsomniaPhenotype`):
- `onset`: Latencia ≥ 30 min (ICSD-3)
- `maintenance`: Despertares ≥ 2 o despertar temprano ≥ 30 min
- `mixed`: Ambos criterios
- `none`: ISI < 8

**Recomendaciones** (`generateRecommendations`):

| Intervención | Categoría | Evidencia | Referencia |
|---|---|---|---|
| Higiene del sueño | Conductual | A | Irish LA et al. JCSM 2015 |
| TCC-I | Conductual | A | Trauer JM et al. Ann Intern Med 2015 |
| Relajación | Conductual | B | Manzoni GM et al. J Clin Psychol 2008 |
| Melatonina | Suplemento | A | Ferracioli-Oda E et al. PLoS One 2013 |
| Magnesio glicinato | Suplemento | B | Abbasi B et al. J Res Med Sci 2012 |
| L-Teanina | Suplemento | B | Hidese S et al. Nutrients 2019 |
| Glicina | Suplemento | B | Bannai M et al. Sleep Biol Rhythms 2012 |

**Integrador de riesgo** (`assessRisk`): 9 banderas de riesgo evaluadas simultáneamente con clasificación severe/intermediate/low y derivación a especialista.

**Precisión del análisis** (`calculatePrecision`): Índice de confianza 0-100% en 5 dimensiones (cuestionarios, datos de sueño, biométricos, laboratorios, genética).

### 3.1 Módulos especializados de diagnóstico

**Early Morning Awakening (Despertar Precoz)** — `emaAlgorithm()`:
- 7-step differential diagnosis para despertar ≥30 min, ≥3 noches/semana
- 9 causas evaluadas: SAHOS, GERD, nicturia, depresión, ASWPD, dolor crónico, alcohol, HPA hiperactivación, hipoglucemia nocturna
- Intervenciones: restricción sueño (TSE >85%), stimulus control, reestructuración cognitiva, ISR (Intensive Sleep Retraining), cronoterapia, HPA management (MBSR, fosfatidilserina, L-teanina, Mg glicinato)
- Referencia: Auger RR et al. J Clin Sleep Med. 2015;11(10):1101-1113. PMID: 26235162

**Parasomnias NREM y REM** — `screenParasomnias()`, `getRBDRisk()`:
- Screening de sonambulismo, terrores nocturnos, trastorno de conducta REM (RBD)
- CRÍTICO: RBD screening para alfa-sinucleinopatía (Iranzo et al. Lancet Neurol 2013: >80% conversión a Parkinson/DLB/MSA en 10+ años)
- Tratamiento RBD: melatonina 3-12mg, seguridad ambiental, rotación SSRIs/SNRIs
- Referencia: Iranzo A et al. Lancet Neurol. 2013;12(5):443-453. PMID: 23541756

**Trastornos del ritmo circadiano** — `classifyCircadianDisorder()`, `differentiateInsomniaVsCircadian()`:
- Clasificación de ASWPD, DSWPD, No-24h, ISWRD
- Diferenciación insomnia vs misalignment circadiano
- Protocolos de luz: DSWPD (10000 lux mañana + melatonina timing-dependent), ASWPD (2500-10000 lux tarde), Non-24 (luz estructurada + melatonina 0.5-10mg), ISWRD (luz diurna + estructura)
- Tiempo esperado de ajuste: 1-4 semanas según trastorno
- Referencia: Lockley SW et al. Sleep Med Rev. 2007;11(6):427-438. PMID: 17921130

**Síndrome de piernas inquietas (RLS)** — `screenRLS()`, `assessIronStatus()`, `assessAugmentationRisk()`:
- Screening ICSD-3: 5 criterios obligatorios (urgencia para mover, peor en reposo, alivio con movimiento, peor noche, disrupción funcional)
- EVALUACIÓN HIERRO OBLIGATORIA: ferritina <75 µg/L = deficiencia (Allen et al. 2018)
- Tratamiento: ferrosulfato 325mg + vitamina C, o bisglicidato de hierro; hierro IV si falla oral
- Gabapentinoides (pregabalina, gabapentina) línea 1 por menor riesgo de aumentación vs dopaminérgicos
- Concepto de aumentación: empeoramiento paradójico con dopaminérgicos crónicos (>50% a 10 años)
- Referencia: Allen RP et al. Sleep Health. 2018;4(3):217-226. PMID: 29793710

**SAHOS: Escalera terapéutica** — `getSAHOSTreatmentLadder()`, `recommendSAHOSTreatment()`:
- 8 modalidades: CPAP (gold standard), APAP (auto-titulante), DAM (leve-moderado), terapia postural (si AHI supino ≥2× lateral), pérdida peso (10% = 26% reducción AHI), terapia miofuncional (50% reducción leve-moderado), Inspire hipogloso (moderado-severo, IMC<35), GLP-1a (tirzepatida/semaglutide para SAHOS+obesidad)
- Cada modalidad incluye indicaciones, contraindicaciones, eficacia, ventajas, desventajas
- Evitar: alcohol, sedantes
- Referencia principal: Peppard PE et al. Am J Epidemiol. 2000;152(10):954-962. PMID: 11092437

**Optimización de etapas del sueño** — `getSleepStageInfo()`, `getSleepStageModulators()`:
- N1 (2-5%): transición vigilia-sueño
- N2 (50-55%): consolidación memoria; potenciadores: aprendizaje motor, tACS 12-15Hz
- N3/SWS (15-25%): restauración física/cognitiva; potenciadores: ejercicio ≥150 min/semana, temp 18-19°C, estimulación acústica cerrada-loop, glicina 3g, Mg glicinato 200-400mg, tDCS
- REM (20-25%): consolidación emocional; potenciadores: extensión TIB (9+ h), vitamina B6 240mg; supresores: alcohol, SSRIs/SNRIs
- Referencia: Walker MK. Why We Sleep. Scribner; 2017.

**Narcolepsia** — `screenNarcolepsy()`, `getNarcolepsyNonPharmRecommendations()`:
- Screening Tipo 1 (con cataplejía): ESS ≥15 + debilidad muscular abrupta
- Screening Tipo 2 (sin cataplejía): ESS ≥15 sin cataplejía
- INTERVENCIÓN CLAVE: Siestas estructuradas 15-20 min × 2-3/día (Mullington & Broughton 1994)
- Comportamientos críticos: consistencia ABSOLUTA horarios sueño-vigilia, evitar alcohol/sedantes/comidas pesadas, ejercicio regular (no exhaustivo)
- Referencia: Mullington JM, Broughton R. Sleep. 1994;17(8 Suppl):S52-S55. PMID: 7701205

**Higiene del sueño: 13 intervenciones EBM** — `getSleepHygieneRecommendations()`, `assessSleepHygieneCompliance()`:
1. Horarios regulares sueño-vigilia (Huang et al. 2020)
2. Restricción TIB a TST (Spielman Sleep Restriction Therapy)
3. Ejercicio aeróbico ≥150 min/semana (Kredlow et al. 2015; timing: no <3h prebed)
4. Temperatura 18-20°C (Okamoto-Mizuno 2012)
5. Evitar cafeína ≥6h prebed (Drake et al. 2013; vida media 5-6h)
6. Evitar alcohol ≥4h prebed (Ebrahim et al. 2013)
7. Restringir luz azul ≥2h prebed (Chang et al. 2015)
8. Exposición luz matutina >1000 lux (Figueiro & Rea 2012)
9. Baño caliente 40-42°C 1-2h prebed (Haghayegh et al. 2019)
10. Evitar nicotina prebed (Zhang et al. 2006)
11. Ambiente oscuro (<1 lux) y silencioso (30dB; Hu et al. 2015)
12. Evitar comidas pesadas <3h prebed (Crispim et al. 2011)
13. Cama solo para sueño y sexo (Bootzin & Epstein 2011; stimulus control)

NOTA CRÍTICA: Higiene del sueño sola NO es tratamiento efectivo para insomnio crónico (AASM 2017). Efecto pequeño (0.16 effect size) cuando está aislada. Debe combinarse con TCC-I.
- Puntuación de cumplimiento 0-100 e identificación de intervenciones prioritarias
- Referencia: Irish LA et al. J Public Health Manag Pract. 2014;20(2):220-226. PMID: 25188625

### 4. Lab — Laboratorio y genética

**7 parámetros de laboratorio** con rangos de referencia y relevancia para sueño:
Vitamina D, B12, Hierro sérico, Ferritina, Magnesio, TSH, Glucemia.

**5 variantes genéticas** relevantes para cronotipos y metabolismo:
CLOCK rs1801260, PER2 rs2304672, ADORA2A rs5751876, COMT rs4680, MTHFR rs1801133.

---

## Uso

```typescript
import {
  // Scoring
  scoreISI,
  scorePHQ9,
  scoreESS,
  // Safety
  evaluateAllSafetyRules,
  // Core engine
  classifyInsomniaPhenotype,
  generateRecommendations,
  assessRisk,
  calculatePrecision,
  calculateBMI,
  // Specialized diagnosis modules
  emaAlgorithm,
  screenParasomnias,
  getRBDRisk,
  classifyCircadianDisorder,
  screenRLS,
  assessIronStatus,
  getSAHOSTreatmentLadder,
  getSleepStageInfo,
  screenNarcolepsy,
  getSleepHygieneRecommendations,
  assessSleepHygieneCompliance,
} from 'somnosalud-clinical-engine';

// 1. Scoring
const isi = scoreISI([3, 3, 3, 2, 3, 4, 3]);
// → { total: 21, severity: 'severe', ... }

// 2. Safety check
const safety = evaluateAllSafetyRules(
  { age: 35, sex: 'male' },
  { isPregnant: false },
  ['lisinopril']
);

// 3. Phenotype
const phenotype = classifyInsomniaPhenotype(
  { sleepLatencyMin: 45, awakeningsPerNight: 1, ... },
  isi.total
);

// 4. Recommendations
const recs = generateRecommendations(phenotype.phenotype, ...);

// 5. Risk assessment
const risk = assessRisk({ isiTotal: 21, ... });

// 6. Specialized modules

// EMA (despertar precoz)
const emaResult = emaAlgorithm({
  earlyAwakeningMinutes: 45,
  frequencyPerWeek: 4,
  durationWeeks: 8,
  nocturia: 2,
  hasSuspicionDepression: true,
  phq9Score: 14,
  ...
});
// → { likelyDiagnosis: 'depression_or_hpa_hyperactivation', confidence: 0.78, recommendations: [...] }

// Parasomnias & RBD
const rbdRisk = getRBDRisk({
  actingOutDreams: true,
  violentBehavior: true,
  recallVividDreams: true,
  familyHistoryPD: false,
  age: 58,
  ...
});
// → { alphasynucleinRisk: 'high', urgencyReferral: true, ... }

// Circadian disorder classification
const circadian = classifyCircadianDisorder({
  desiredBedtime: '23:00',
  actualBedtime: '02:30',
  desiredWaketime: '07:00',
  actualWaketime: '10:00',
  chronotype: 'delayed',
  ...
});
// → { disorder: 'dswpd', phase_delay_hours: 3.5, treatment_plan: {...} }

// RLS screening
const rls = screenRLS({
  urgencyToMove: true,
  worseAtRest: true,
  reliefWithMovement: true,
  worseEveningNight: true,
  disruptsSleep: true,
  durationMonths: 18,
});
// → { likelihood: 'probable_rls', icsd3_criteria_met: 5/5, nextSteps: [...] }

// Iron status assessment
const iron = assessIronStatus({
  ferrSerumNg_ml: 32,
  ferrSerumMcmol_L: 72,
  fatigue: true,
  restlessness: true,
});
// → { status: 'deficiency', treatmentRequired: true, ferritinTarget: '>75 mcg/L' }

// SAHOS treatment ladder
const sahos = getSAHOSTreatmentLadder({
  ahi: 24,
  severity: 'moderate',
  bmi: 29,
  age: 52,
  tolerance_cpap: false,
  ...
});
// → { recommendations: [APAP, DAM, postural, weight_loss], ladder_sequence: [...] }

// Sleep stages optimization
const n3Info = getSleepStageInfo('N3');
// → { stage: 'N3', norms: {...}, potentiators: [exercise, cool_temp, glycine, ...], suppressors: [...] }

// Narcolepsy screening
const narcolepsy = screenNarcolepsy({
  essTotal: 16,
  excessiveDaytimeSleepiness: true,
  episodesOfSuddenMuscleWeakness: true,
  cataplexyDescription: 'Risa → caída de cabeza',
  ...
});
// → { likelihood: 'type1_with_cataplexy', urgencyReferral: 'URGENT', nextSteps: [...] }

// Sleep hygiene assessment
const hygiene = assessSleepHygieneCompliance({
  regularSchedule: true,
  exerciseFrequency: 4,
  roomTemperature: 18,
  noCaffeineAfter: 14,
  limitScreensBeforeBed: true,
  ...
});
// → { complianceLevel: 'high', complianceScore: 87, prioritizedInterventions: [] }
```

---

## Niveles de evidencia

- **A** = Meta-análisis o revisión sistemática con ensayos controlados aleatorizados
- **B** = Ensayo controlado aleatorizado individual o estudios de cohorte grandes
- **C** = Estudios observacionales o consenso de expertos

---

## Tests

```bash
npm install
npm test
```

55+ tests unitarios cubriendo todos los módulos:
- Scoring: ISI, ESS, STOP-BANG, PHQ-9, GAD-7, DASS-21, BMI
- Safety: SAFE-010, SAFE-020, SAFE-040
- Engine: phenotype, recommendations, risk-integrator, precision
- Specialized modules: ema, parasomnias, circadian-disorders, rls, sahos-treatment, sleep-stages, narcolepsy, sleep-hygiene
- Lab: parameters, genetics

Todos los tests pasan correctamente sin romper la lógica existente.

---

## Licencia

Propietario — SomnoSalud Team. Todos los derechos reservados.
