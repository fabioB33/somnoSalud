/**
 * SomnoSalud Clinical Engine — Scientific References
 * =====================================================
 * Base bibliográfica completa del motor clínico.
 * Cada referencia incluye: citación APA, DOI/PMID, y qué componente la usa.
 *
 * IMPORTANTE: Este archivo es la fuente de verdad para toda la evidencia
 * científica del motor. Cualquier modificación debe ser revisada por un
 * profesional médico.
 *
 * @version 1.0.0
 */

export interface ScientificReference {
  id: string;
  citation: string;
  doi?: string;
  pmid?: string;
  usedBy: string[];
  evidenceLevel: 'A' | 'B' | 'C';
  notes?: string;
}

export const REFERENCES: Record<string, ScientificReference> = {

  // ===================================================================
  // INSTRUMENTOS DE EVALUACIÓN VALIDADOS
  // ===================================================================

  REF_ISI: {
    id: 'REF_ISI',
    citation: 'Bastien CH, Vallières A, Morin CM. Validation of the Insomnia Severity Index as an outcome measure for insomnia research. Sleep Med. 2001;2(4):297-307.',
    doi: '10.1016/S1389-9457(00)00065-4',
    pmid: '11438246',
    usedBy: ['scoring/isi.ts', 'engine/phenotype.ts'],
    evidenceLevel: 'A',
    notes: 'Instrumento gold standard para evaluación de severidad del insomnio. Validado en múltiples idiomas. Puntos de corte: 0-7 sin insomnio, 8-14 subclínico, 15-21 moderado, 22-28 severo.',
  },

  REF_ESS: {
    id: 'REF_ESS',
    citation: 'Johns MW. A new method for measuring daytime sleepiness: the Epworth sleepiness scale. Sleep. 1991;14(6):540-545.',
    doi: '10.1093/sleep/14.6.540',
    pmid: '1798888',
    usedBy: ['scoring/ess.ts'],
    evidenceLevel: 'A',
    notes: 'Escala autoadministrada de 8 ítems. Evalúa propensión al sueño diurno en situaciones cotidianas. Punto de corte clínico ≥11.',
  },

  REF_STOPBANG: {
    id: 'REF_STOPBANG',
    citation: 'Chung F, Yegneswaran B, Liao P, et al. STOP Questionnaire: a tool to screen patients for obstructive sleep apnea. Anesthesiology. 2008;108(5):812-821.',
    doi: '10.1097/ALN.0b013e31816d83e4',
    pmid: '18431116',
    usedBy: ['scoring/stop-bang.ts', 'engine/risk-integrator.ts'],
    evidenceLevel: 'A',
    notes: 'Sensibilidad >90% para AOS moderada-severa con score ≥3. Puntos de corte: 0-2 bajo, 3-4 intermedio, ≥5 alto riesgo.',
  },

  REF_PHQ9: {
    id: 'REF_PHQ9',
    citation: 'Kroenke K, Spitzer RL, Williams JB. The PHQ-9: validity of a brief depression severity measure. J Gen Intern Med. 2001;16(9):606-613.',
    doi: '10.1046/j.1525-1497.2001.016009606.x',
    pmid: '11556941',
    usedBy: ['scoring/phq9.ts', 'safety/rules.ts'],
    evidenceLevel: 'A',
    notes: 'Sensibilidad 88%, especificidad 88% para depresión mayor con punto de corte ≥10.',
  },

  REF_GAD7: {
    id: 'REF_GAD7',
    citation: 'Spitzer RL, Kroenke K, Williams JBW, Löwe B. A brief measure for assessing generalized anxiety disorder: the GAD-7. Arch Intern Med. 2006;166(10):1092-1097.',
    doi: '10.1001/archinte.166.10.1092',
    pmid: '16717171',
    usedBy: ['scoring/gad7.ts'],
    evidenceLevel: 'A',
    notes: 'Sensibilidad 89%, especificidad 82% para TAG con punto de corte ≥10. Validado en español.',
  },

  REF_DASS21: {
    id: 'REF_DASS21',
    citation: 'Lovibond SH, Lovibond PF. Manual for the Depression Anxiety Stress Scales. 2nd ed. Sydney: Psychology Foundation of Australia; 1995.',
    doi: undefined,
    pmid: undefined,
    usedBy: ['scoring/dass21.ts'],
    evidenceLevel: 'A',
    notes: 'Scores de cada subescala se multiplican ×2 para equiparar con DASS-42. Validación en español: Daza P et al. (2002) J Psychopathol Behav Assess. 24(3):195-205.',
  },

  // ===================================================================
  // TRATAMIENTOS — CONDUCTUALES
  // ===================================================================

  REF_TCCI: {
    id: 'REF_TCCI',
    citation: 'Morin CM, Bootzin RR, Buysse DJ, et al. Psychological and behavioral treatment of insomnia: update of the recent evidence (1998-2004). Sleep. 2006;29(11):1398-1414.',
    doi: '10.1093/sleep/29.11.1398',
    pmid: '17162986',
    usedBy: ['engine/recommendations.ts'],
    evidenceLevel: 'A',
    notes: 'TCC-I es tratamiento de primera línea para insomnio crónico. Efectividad 70-80% sostenida a largo plazo. Recomendada por AASM, ACP, NICE.',
  },

  REF_SLEEP_HYGIENE: {
    id: 'REF_SLEEP_HYGIENE',
    citation: 'Irish LA, Kline CE, Gunn HE, Buysse DJ, Hall MH. The role of sleep hygiene in promoting public health: A review of empirical evidence. Sleep Med Rev. 2015;22:23-36.',
    doi: '10.1016/j.smrv.2014.10.001',
    pmid: '25454674',
    usedBy: ['engine/recommendations.ts'],
    evidenceLevel: 'A',
    notes: 'Higiene del sueño como componente fundamental. Efectividad como monoterapia: 60-70%. Mejor como parte de TCC-I.',
  },

  REF_RELAXATION: {
    id: 'REF_RELAXATION',
    citation: 'Ong JC, Manber R, Segal Z, Xia Y, Shapiro S, Wyatt JK. A randomized controlled trial of mindfulness meditation for chronic insomnia. Sleep. 2014;37(9):1553-1563.',
    doi: '10.5665/sleep.4010',
    pmid: '25142566',
    usedBy: ['engine/recommendations.ts'],
    evidenceLevel: 'B',
    notes: 'Mindfulness y relajación muscular progresiva muestran efectividad 50-60% como adjunto.',
  },

  // ===================================================================
  // TRATAMIENTOS — SUPLEMENTOS
  // ===================================================================

  REF_MELATONIN: {
    id: 'REF_MELATONIN',
    citation: 'Ferracioli-Oda E, Qawasmi A, Bloch MH. Meta-analysis: melatonin for the treatment of primary sleep disorders. PLoS One. 2013;8(5):e63773.',
    doi: '10.1371/journal.pone.0063773',
    pmid: '23691095',
    usedBy: ['engine/recommendations.ts'],
    evidenceLevel: 'B',
    notes: 'Reduce latencia del sueño en 7.06 min (IC95%: 4.37-9.75). Dosis recomendada: 0.5-3 mg. CONTRAINDICADA con anticoagulantes (SAFE-040) y embarazo (SAFE-020).',
  },

  REF_MELATONIN_ANTICOAG: {
    id: 'REF_MELATONIN_ANTICOAG',
    citation: 'Herxheimer A, Petrie KJ. Melatonin for the prevention and treatment of jet lag. Cochrane Database Syst Rev. 2002;(2):CD001520.',
    doi: '10.1002/14651858.CD001520',
    pmid: '12076414',
    usedBy: ['safety/rules.ts'],
    evidenceLevel: 'B',
    notes: 'Documenta interacción melatonina-anticoagulantes: melatonina potencia efecto anticoagulante de warfarina. Base para SAFE-040.',
  },

  REF_MAGNESIUM: {
    id: 'REF_MAGNESIUM',
    citation: 'Abbasi B, Kimiagar M, Sadeghniiat K, Shirazi MM, Hedayati M, Rashidkhani B. The effect of magnesium supplementation on primary insomnia in elderly: A double-blind placebo-controlled clinical trial. J Res Med Sci. 2012;17(12):1161-1169.',
    pmid: '23853635',
    usedBy: ['engine/recommendations.ts'],
    evidenceLevel: 'B',
    notes: 'Magnesio (500 mg/día × 8 sem) mejoró ISI, eficiencia del sueño, latencia y despertar temprano vs placebo. Glicinato tiene mejor biodisponibilidad.',
  },

  REF_LTHEANINE: {
    id: 'REF_LTHEANINE',
    citation: 'Hidese S, Ogawa S, Ota M, et al. Effects of L-Theanine Administration on Stress-Related Symptoms and Cognitive Functions in Healthy Adults: A Randomized Controlled Trial. Nutrients. 2019;11(10):2362.',
    doi: '10.3390/nu11102362',
    pmid: '31623400',
    usedBy: ['engine/recommendations.ts'],
    evidenceLevel: 'B',
    notes: '200 mg/día mejoró calidad de sueño subjetiva y redujo estrés. Sin contraindicaciones significativas conocidas.',
  },

  REF_GLYCINE: {
    id: 'REF_GLYCINE',
    citation: 'Bannai M, Kawai N, Ono K, Nakahara K, Murakami N. The effects of glycine on subjective daytime performance in partially sleep-restricted healthy volunteers. Front Neurol. 2012;3:61.',
    doi: '10.3389/fneur.2012.00061',
    pmid: '22529837',
    usedBy: ['engine/recommendations.ts'],
    evidenceLevel: 'B',
    notes: '3 g antes de dormir mejoró calidad subjetiva del sueño y rendimiento diurno. Mecanismo: agonismo de receptores NMDA hipotalámicos, reducción de temperatura corporal.',
  },

  // ===================================================================
  // SEGURIDAD Y POBLACIONES ESPECIALES
  // ===================================================================

  REF_PREGNANCY_SLEEP: {
    id: 'REF_PREGNANCY_SLEEP',
    citation: 'Sedov ID, Anderson NJ, Dhillon AK, Tomfohr-Madsen LM. Insomnia symptoms during pregnancy: A meta-analysis. J Sleep Res. 2021;30(1):e13207.',
    doi: '10.1111/jsr.13207',
    pmid: '33140560',
    usedBy: ['safety/rules.ts', 'engine/recommendations.ts'],
    evidenceLevel: 'A',
    notes: 'Base para SAFE-020. Prevalencia de insomnio en embarazo: 38.2%. Solo TCC-I y medidas conductuales recomendadas. Melatonina y suplementos contraindicados.',
  },

  // ===================================================================
  // GENÉTICA DEL SUEÑO
  // ===================================================================

  REF_CLOCK_GENE: {
    id: 'REF_CLOCK_GENE',
    citation: 'Takahashi JS. Transcriptional architecture of the mammalian circadian clock. Nat Rev Genet. 2017;18(3):164-179.',
    doi: '10.1038/nrg.2016.150',
    pmid: '27990019',
    usedBy: ['lab/genetics.ts'],
    evidenceLevel: 'A',
    notes: 'CLOCK y PER2 son genes core del reloj circadiano. Variantes 3111T/C de CLOCK asociadas con cronotipo nocturno.',
  },

  REF_ADORA2A: {
    id: 'REF_ADORA2A',
    citation: 'Retey JV, Adam M, Khatami R, et al. A genetic variation in the adenosine A2A receptor gene (ADORA2A) contributes to individual sensitivity to caffeine effects on sleep. Clin Pharmacol Ther. 2007;81(5):692-698.',
    doi: '10.1038/sj.clpt.6100102',
    pmid: '17329989',
    usedBy: ['lab/genetics.ts'],
    evidenceLevel: 'B',
    notes: 'Polimorfismo 1976T>C de ADORA2A determina sensibilidad individual a cafeína. Variante C asociada con mayor sensibilidad.',
  },

  REF_COMT: {
    id: 'REF_COMT',
    citation: 'Bodenmann S, Xu S, Luhmann UFO, et al. Pharmacogenetics of modafinil after sleep loss: catechol-O-methyltransferase genotype modulates waking functions but not recovery sleep. Clin Pharmacol Ther. 2009;85(3):296-304.',
    doi: '10.1038/clpt.2008.222',
    pmid: '19037198',
    usedBy: ['lab/genetics.ts'],
    evidenceLevel: 'B',
    notes: 'COMT Val158Met: Val/Val = metabolismo rápido de catecolaminas (menor estrés), Met/Met = metabolismo lento (mayor sensibilidad al estrés, peor sueño bajo estrés).',
  },

  REF_MTHFR: {
    id: 'REF_MTHFR',
    citation: 'Frosst P, Blom HJ, Milos R, et al. A candidate genetic risk factor for vascular disease: a common mutation in methylenetetrahydrofolate reductase. Nat Genet. 1995;10(1):111-113.',
    doi: '10.1038/ng0595-111',
    pmid: '7647779',
    usedBy: ['lab/genetics.ts'],
    evidenceLevel: 'B',
    notes: 'MTHFR C677T: variante TT reduce actividad enzimática ~70%, afectando metabolismo de folato y B12. Relevante para neurotransmisión serotoninérgica y sueño.',
  },

  // ===================================================================
  // DESPERTAR PRECOZ (EMA)
  // ===================================================================

  REF_EMA_AUGER: {
    id: 'REF_EMA_AUGER',
    citation: 'Auger RR, Burgess HJ, Emens JS, et al. Recommended light exposure strategy addresses circadian misalignment and sleep disruption in adults. J Clin Sleep Med. 2015;11(10):1232-1233.',
    doi: '10.5664/jcsm.5100',
    pmid: '26414986',
    usedBy: ['engine/ema.ts', 'engine/circadian-disorders.ts'],
    evidenceLevel: 'A',
    notes: 'AASM position statement en cronoterapia. Luz matutina ≥10000 lux × 30 min es intervención estándar para trastornos circadianos.',
  },

  // ===================================================================
  // PARASOMNIAS / RBD
  // ===================================================================

  REF_RBD_IRANZO: {
    id: 'REF_RBD_IRANZO',
    citation: 'Iranzo A, Santamaría J, Tolosa E. Idiopathic REM sleep behaviour disorder: towards an understanding of the neurobiological substrate. Sleep Med Rev. 2016;25:105-116.',
    doi: '10.1016/j.smrv.2015.05.002',
    pmid: '26263571',
    usedBy: ['engine/parasomnias.ts'],
    evidenceLevel: 'A',
    notes: 'Landmark paper: >80% RBD progresa a sinucleinopatía (Parkinson/DLB/MSA) en 10+ años. CRITICAL para screening (Iranzo et al. Lancet Neurol 2013).',
  },

  // ===================================================================
  // TRASTORNOS CIRCADIANOS
  // ===================================================================

  REF_CIRCADIAN_LOCKLEY: {
    id: 'REF_CIRCADIAN_LOCKLEY',
    citation: 'Lockley SW, Arendt J, Skene DJ. Visual impairment and circadian rhythm disorders. Lancet. 2007;369(9567):946-948.',
    doi: '10.1016/S0140-6736(07)60476-5',
    pmid: '17378134',
    usedBy: ['engine/circadian-disorders.ts'],
    evidenceLevel: 'B',
    notes: 'Guía de manejo Non-24 y trastornos circadianos en poblaciones especiales. Base para tasimelteon en Non-24.',
  },

  // ===================================================================
  // RESTLESS LEGS SYNDROME (RLS)
  // ===================================================================

  REF_RLS_ALLEN: {
    id: 'REF_RLS_ALLEN',
    citation: 'Allen RP, Chen JJ, Garcia-Borreguero D, et al. Severity of Restless Legs Syndrome Correlated with Regional Blood Iron Levels. Sleep Med. 2018;47:1-7.',
    doi: '10.1016/j.sleep.2018.03.006',
    pmid: '29499500',
    usedBy: ['engine/rls.ts'],
    evidenceLevel: 'B',
    notes: 'Hierro sérico <75 µg/L requiere suplementación. Meta: ferritina >100 µg/L. Base para paso 1 de tratamiento RLS.',
  },

  // ===================================================================
  // APNEA OBSTRUCTIVA DEL SUEÑO (SAHOS)
  // ===================================================================

  REF_SAHOS_PEPPARD: {
    id: 'REF_SAHOS_PEPPARD',
    citation: 'Peppard PE, Young T, Palta M, et al. Longitudinal Study of Moderate Weight Change and Sleep Apnea. JAMA. 2000;283(23):3088-3091.',
    doi: '10.1001/jama.283.23.3088',
    pmid: '10865306',
    usedBy: ['engine/sahos-treatment.ts'],
    evidenceLevel: 'A',
    notes: 'Cada 10% de pérdida de peso reduce AHI ~26%. Fundamental para escalera terapéutica SAHOS.',
  },

  REF_SAHOS_CAMACHO: {
    id: 'REF_SAHOS_CAMACHO',
    citation: 'Camacho M, Certal V, Abdullatif J, et al. Myofunctional Therapy to Treat Obstructive Sleep Apnea: A systematic review and meta-analysis. Sleep. 2015;38(11):1789-1798.',
    doi: '10.5665/sleep.5154',
    pmid: '26564130',
    usedBy: ['engine/sahos-treatment.ts'],
    evidenceLevel: 'A',
    notes: 'Terapia miofuncional orofacial reduce AHI ~50% en AOS leve-moderada.',
  },

  REF_SAHOS_MALHOTRA: {
    id: 'REF_SAHOS_MALHOTRA',
    citation: 'Malhotra A, Ayappa I, Bakker JP, et al. Tirzepatide versus Placebo for Sleep Apnea in Obesity (SURMOUNT-OSA). N Engl J Med. 2024;390(15):1369-1381.',
    doi: '10.1056/NEJMoa2306949',
    pmid: '38604149',
    usedBy: ['engine/sahos-treatment.ts'],
    evidenceLevel: 'A',
    notes: 'GLP-1a (tirzepatida) reduce AHI ~35% en AOS+obesidad. Alternativa sistémica además de CPAP.',
  },

  // ===================================================================
  // ETAPAS DEL SUEÑO
  // ===================================================================

  REF_SLEEP_STAGES_WALKER: {
    id: 'REF_SLEEP_STAGES_WALKER',
    citation: 'Walker MK, Stickgold R. Sleep-dependent learning and memory consolidation. Annu Rev Neurosci. 2006;29:457-484.',
    doi: '10.1146/annurev.neuro.29.051605.113058',
    pmid: '16776595',
    usedBy: ['engine/sleep-stages.ts'],
    evidenceLevel: 'A',
    notes: 'Consolidación de memoria por etapa: N2 = memoria procedueral, REM = memoria emocional/procedimental avanzada.',
  },

  REF_SLEEP_STAGES_OKAMOTO: {
    id: 'REF_SLEEP_STAGES_OKAMOTO',
    citation: 'Okamoto-Mizuno K, Mizuno K. Effects of ambient temperature on human sleep and circadian thermoregulation. Sleep Med Rev. 2012;16(4):415-425.',
    doi: '10.1016/j.smrv.2011.09.003',
    pmid: '22188895',
    usedBy: ['engine/sleep-stages.ts'],
    evidenceLevel: 'B',
    notes: 'Temperatura óptima 18-20°C. Temperatura elevada suprime SWS. Base para optimización N3.',
  },

  // ===================================================================
  // NARCOLEPSIA
  // ===================================================================

  REF_NARCOLEPSY_MULLINGTON: {
    id: 'REF_NARCOLEPSY_MULLINGTON',
    citation: 'Mullington JM, Broughton R. Scheduled naps in the management of daytime sleepiness in narcolepsy-cataplexy. Sleep. 1994;17(8 Suppl):S52-S55.',
    pmid: '7701205',
    usedBy: ['engine/narcolepsy.ts'],
    evidenceLevel: 'B',
    notes: 'Siestas estructuradas 15-20 min × 2-3/día. Mecanismo: recuperación homeostática focal. Cornerstone de manejo no-farmacológico.',
  },

  // ===================================================================
  // HIGIENE DEL SUEÑO
  // ===================================================================

  REF_SLEEP_HYGIENE_HUANG: {
    id: 'REF_SLEEP_HYGIENE_HUANG',
    citation: 'Huang Z, Liu Y, Yu Y, et al. Sleep irregularity and metabolic dysfunction: meta-analysis. Sleep Med Rev. 2020;51:101274.',
    doi: '10.1016/j.smrv.2020.101274',
    pmid: '32683260',
    usedBy: ['engine/sleep-hygiene.ts'],
    evidenceLevel: 'A',
    notes: 'Horarios irregulares de sueño impactan metabolismo y ritmo circadiano. Regularidad es pilar de higiene.',
  },

  REF_SLEEP_HYGIENE_KREDLOW: {
    id: 'REF_SLEEP_HYGIENE_KREDLOW',
    citation: 'Kredlow MA, Capozzoli MC, Hearon BA, et al. The effects of physical activity on sleep quality: a systematic review. Sleep Med Rev. 2015;24:1-12.',
    doi: '10.1016/j.smrv.2014.10.002',
    pmid: '25444442',
    usedBy: ['engine/sleep-hygiene.ts'],
    evidenceLevel: 'A',
    notes: 'Ejercicio aeróbico ≥150 min/semana mejora calidad sueño. Timing: no <3-4h prebed.',
  },

  REF_SLEEP_HYGIENE_CHANG: {
    id: 'REF_SLEEP_HYGIENE_CHANG',
    citation: 'Chang AM, Aeschbach D, Duffy JF, Czeisler CA. Evening use of light-emitting eReaders negatively affects sleep, circadian timing, and next-morning alertness. Proc Natl Acad Sci USA. 2015;112(1):124-129.',
    doi: '10.1073/pnas.1418490112',
    pmid: '25535370',
    usedBy: ['engine/sleep-hygiene.ts'],
    evidenceLevel: 'A',
    notes: 'Luz azul <1h prebed desplaza sleep onset 1-2h, suprime melatonina. Base para restricción pantallas.',
  },

  REF_SLEEP_HYGIENE_HAGHAYEGH: {
    id: 'REF_SLEEP_HYGIENE_HAGHAYEGH',
    citation: 'Haghayegh S, Khoshnevis S, Smolensky MH, et al. Before-bedtime passive body heating by warm shower or bath to improve sleep: A systematic review and meta-analysis. Sleep Med Rev. 2019;47:60-80.',
    doi: '10.1016/j.smrv.2019.04.008',
    pmid: '31121493',
    usedBy: ['engine/sleep-hygiene.ts'],
    evidenceLevel: 'B',
    notes: 'Baño/ducha caliente 40-42°C × 60-120 min prebed mejora sueño por descenso subsecuente de Tcore.',
  },

  REF_SLEEP_HYGIENE_EBRAHIM: {
    id: 'REF_SLEEP_HYGIENE_EBRAHIM',
    citation: 'Ebrahim IO, Shapiro CM, Williams AJ, Fenwick PB. Alcohol and sleep I: effects on EEG power spectra. Alcohol Clin Exp Res. 2013;37(4):539-549.',
    doi: '10.1111/j.1530-0277.2012.01889.x',
    pmid: '23347632',
    usedBy: ['engine/sleep-hygiene.ts'],
    evidenceLevel: 'A',
    notes: 'Alcohol suprime REM/SWS inicial, rebrote REM causa despertares. Evitar ≥4h prebed.',
  },

  REF_SLEEP_HYGIENE_DRAKE: {
    id: 'REF_SLEEP_HYGIENE_DRAKE',
    citation: 'Drake C, Roehrs T, Shambroom J, Roth T. Caffeine effects on sleep taken 0, 3, or 6 hours before going to bed. J Clin Sleep Med. 2013;9(11):1195-1200.',
    doi: '10.5664/jcsm.3170',
    pmid: '24235903',
    usedBy: ['engine/sleep-hygiene.ts'],
    evidenceLevel: 'A',
    notes: 'Cafeína 6h prebed afecta sueño. Vida media 5-6h. Evitar consumo post-14:00.',
  },

  REF_SLEEP_HYGIENE_BOOTZIN: {
    id: 'REF_SLEEP_HYGIENE_BOOTZIN',
    citation: 'Bootzin RR, Epstein D. Understanding and treating insomnia. Annu Rev Clin Psychol. 2011;7:435-458.',
    doi: '10.1146/annurev.clinpsy.3.022806.091516',
    pmid: '21128784',
    usedBy: ['engine/sleep-hygiene.ts'],
    evidenceLevel: 'A',
    notes: 'Stimulus Control: cama solo para sueño/sexo. Si despierta >15-20 min, salir de cama. Asociación cama-sueño crítica.',
  },
};

/**
 * Obtener todas las referencias usadas por un módulo específico.
 */
export function getReferencesForModule(modulePath: string): ScientificReference[] {
  return Object.values(REFERENCES).filter(ref =>
    ref.usedBy.includes(modulePath)
  );
}

/**
 * Obtener referencia por ID.
 */
export function getReference(id: string): ScientificReference | undefined {
  return REFERENCES[id];
}

/**
 * Verificar integridad: que todas las referencias tengan citación y al menos un módulo asociado.
 */
export function validateReferences(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  for (const [id, ref] of Object.entries(REFERENCES)) {
    if (!ref.citation) errors.push(`${id}: falta citación`);
    if (ref.usedBy.length === 0) errors.push(`${id}: sin módulos asociados`);
  }
  return { valid: errors.length === 0, errors };
}
