/**
 * Tests Unitarios — SomnoSalud Clinical Engine
 * ================================================
 * Verifican que cada algoritmo de scoring reproduce los
 * resultados esperados según las publicaciones originales.
 *
 * CONVENCIÓN: cada test documenta qué paper valida y
 * contra qué tabla/punto de corte se compara.
 *
 * Para ejecutar (con ts-jest o vitest):
 *   npx vitest run tests/scoring.test.ts
 *
 * @version 1.0.0
 */

import { describe, test, expect } from 'vitest';
import { scoreISI } from '../src/scoring/isi';
import { scoreESS } from '../src/scoring/ess';
import { scoreSTOPBANG } from '../src/scoring/stop-bang';
import { scorePHQ9 } from '../src/scoring/phq9';
import { scoreGAD7 } from '../src/scoring/gad7';
import { scoreDASS21 } from '../src/scoring/dass21';
import { calculateBMI } from '../src/scoring/bmi';
import {
  evaluateAllSafetyRules,
  safe040_melatoninAnticoagulant,
} from '../src/safety/rules';
import { classifyInsomniaPhenotype } from '../src/engine/phenotype';
import { generateRecommendations } from '../src/engine/recommendations';
import { assessRisk } from '../src/engine/risk-integrator';
import { analyzeLabValue } from '../src/lab/parameters';
import { analyzeVariant } from '../src/lab/genetics';

// ═══════════════════════════════════════════════════════════════
// ISI — Bastien et al. Sleep Med. 2001;2(4):297-307
// ═══════════════════════════════════════════════════════════════

describe('ISI Scoring (Bastien et al. 2001)', () => {
  test('score 0 → no clinical insomnia', () => {
    const r = scoreISI([0, 0, 0, 0, 0, 0, 0]);
    expect(r.totalScore).toBe(0);
    expect(r.severity).toBe('no_insomnia');
  });

  test('score 7 → upper bound of no insomnia', () => {
    const r = scoreISI([1, 1, 1, 1, 1, 1, 1]);
    expect(r.totalScore).toBe(7);
    expect(r.severity).toBe('no_insomnia');
  });

  test('score 8 → subthreshold insomnia', () => {
    const r = scoreISI([2, 1, 1, 1, 1, 1, 1]);
    expect(r.totalScore).toBe(8);
    expect(r.severity).toBe('subthreshold');
  });

  test('score 14 → upper bound subthreshold', () => {
    const r = scoreISI([2, 2, 2, 2, 2, 2, 2]);
    expect(r.totalScore).toBe(14);
    expect(r.severity).toBe('subthreshold');
  });

  test('score 15 → moderate insomnia', () => {
    const r = scoreISI([3, 2, 2, 2, 2, 2, 2]);
    expect(r.totalScore).toBe(15);
    expect(r.severity).toBe('moderate');
  });

  test('score 22 → severe insomnia', () => {
    const r = scoreISI([4, 3, 3, 3, 3, 3, 3]);
    expect(r.totalScore).toBe(22);
    expect(r.severity).toBe('severe');
  });

  test('max score 28 → severe', () => {
    const r = scoreISI([4, 4, 4, 4, 4, 4, 4]);
    expect(r.totalScore).toBe(28);
    expect(r.severity).toBe('severe');
  });

  test('rejects wrong number of items', () => {
    expect(() => scoreISI([0, 0, 0] as any)).toThrow();
  });

  test('rejects out-of-range values', () => {
    expect(() => scoreISI([0, 0, 5, 0, 0, 0, 0])).toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════
// ESS — Johns MW. Sleep. 1991;14(6):540-545
// ═══════════════════════════════════════════════════════════════

describe('ESS Scoring (Johns 1991)', () => {
  test('score 0 → normal', () => {
    const r = scoreESS([0, 0, 0, 0, 0, 0, 0, 0]);
    expect(r.totalScore).toBe(0);
    expect(r.severity).toBe('normal');
  });

  test('score 10 → upper bound normal', () => {
    const r = scoreESS([2, 1, 1, 1, 1, 1, 2, 1]);
    expect(r.totalScore).toBe(10);
    expect(r.severity).toBe('normal');
  });

  test('score 11 → mild', () => {
    const r = scoreESS([2, 1, 1, 2, 1, 1, 2, 1]);
    expect(r.totalScore).toBe(11);
    expect(r.severity).toBe('mild');
  });

  test('score 18 → severe', () => {
    const r = scoreESS([3, 2, 2, 3, 2, 2, 2, 2]);
    expect(r.totalScore).toBe(18);
    expect(r.severity).toBe('severe');
  });

  test('max score 24 → severe', () => {
    const r = scoreESS([3, 3, 3, 3, 3, 3, 3, 3]);
    expect(r.totalScore).toBe(24);
    expect(r.severity).toBe('severe');
  });
});

// ═══════════════════════════════════════════════════════════════
// PHQ-9 — Kroenke et al. J Gen Intern Med. 2001;16(9):606-613
// ═══════════════════════════════════════════════════════════════

describe('PHQ-9 Scoring (Kroenke et al. 2001)', () => {
  test('score 0 → minimal', () => {
    const r = scorePHQ9([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(r.totalScore).toBe(0);
    expect(r.severity).toBe('minimal');
  });

  test('score 4 → minimal (upper bound)', () => {
    const r = scorePHQ9([1, 1, 1, 1, 0, 0, 0, 0, 0]);
    expect(r.totalScore).toBe(4);
    expect(r.severity).toBe('minimal');
  });

  test('score 5 → mild', () => {
    const r = scorePHQ9([1, 1, 1, 1, 1, 0, 0, 0, 0]);
    expect(r.totalScore).toBe(5);
    expect(r.severity).toBe('mild');
  });

  test('score 10 → moderate', () => {
    const r = scorePHQ9([1, 1, 1, 1, 1, 1, 1, 1, 2]);
    expect(r.totalScore).toBe(10);
    expect(r.severity).toBe('moderate');
  });

  test('score 15 → moderately severe', () => {
    const r = scorePHQ9([2, 2, 2, 2, 2, 2, 2, 1, 0]);
    expect(r.totalScore).toBe(15);
    expect(r.severity).toBe('moderately_severe');
  });

  test('score 20 → severe', () => {
    const r = scorePHQ9([3, 2, 2, 3, 2, 2, 2, 2, 2]);
    expect(r.totalScore).toBe(20);
    expect(r.severity).toBe('severe');
  });

});

// ═══════════════════════════════════════════════════════════════
// GAD-7 — Spitzer et al. Arch Intern Med. 2006;166(10):1092-1097
// ═══════════════════════════════════════════════════════════════

describe('GAD-7 Scoring (Spitzer et al. 2006)', () => {
  test('score 0 → minimal', () => {
    const r = scoreGAD7([0, 0, 0, 0, 0, 0, 0]);
    expect(r.totalScore).toBe(0);
    expect(r.severity).toBe('minimal');
  });

  test('score 5 → mild', () => {
    const r = scoreGAD7([1, 1, 1, 1, 1, 0, 0]);
    expect(r.totalScore).toBe(5);
    expect(r.severity).toBe('mild');
  });

  test('score 10 → moderate (clinical threshold)', () => {
    const r = scoreGAD7([2, 1, 1, 2, 1, 2, 1]);
    expect(r.totalScore).toBe(10);
    expect(r.severity).toBe('moderate');
  });

  test('score 15 → severe', () => {
    const r = scoreGAD7([3, 2, 2, 2, 2, 2, 2]);
    expect(r.totalScore).toBe(15);
    expect(r.severity).toBe('severe');
  });
});

// ═══════════════════════════════════════════════════════════════
// DASS-21 — Lovibond & Lovibond 1995
// ═══════════════════════════════════════════════════════════════

describe('DASS-21 Scoring (Lovibond & Lovibond 1995)', () => {
  test('all zeros → normal in all subscales', () => {
    const responses = new Array(21).fill(0) as any;
    const r = scoreDASS21(responses);
    expect(r.depressionScore).toBe(0);
    expect(r.anxietyScore).toBe(0);
    expect(r.stressScore).toBe(0);
    expect(r.depressionSeverity).toBe('normal');
    expect(r.anxietySeverity).toBe('normal');
    expect(r.stressSeverity).toBe('normal');
  });

  test('scores are multiplied by 2', () => {
    // Set depression items (indices 2,4,9,12,15,16,20) to 1, rest to 0
    const responses = new Array(21).fill(0) as any;
    [2, 4, 9, 12, 15, 16, 20].forEach(i => responses[i] = 1);
    const r = scoreDASS21(responses);
    // Raw sum = 7, ×2 = 14 → moderate depression
    expect(r.depressionScore).toBe(14);
    expect(r.depressionSeverity).toBe('moderate');
    expect(r.anxietyScore).toBe(0);
    expect(r.stressScore).toBe(0);
  });

  test('max scores → extremely severe in all', () => {
    const responses = new Array(21).fill(3) as any;
    const r = scoreDASS21(responses);
    // Each subscale: 7 items × 3 = 21 raw × 2 = 42
    expect(r.depressionScore).toBe(42);
    expect(r.anxietyScore).toBe(42);
    expect(r.stressScore).toBe(42);
    expect(r.depressionSeverity).toBe('extremely_severe');
    expect(r.anxietySeverity).toBe('extremely_severe');
    expect(r.stressSeverity).toBe('extremely_severe');
  });

  test('depression cutoff boundary: 9 → normal, 10 → mild', () => {
    // Need depression raw = 5 → ×2 = 10 → mild
    // Set 5 of 7 depression items to 1
    const resp1 = new Array(21).fill(0) as any;
    [2, 4, 9, 12, 15].forEach(i => resp1[i] = 1); // raw=5, ×2=10
    expect(scoreDASS21(resp1).depressionSeverity).toBe('mild');

    // raw=4 → ×2=8 → normal
    const resp2 = new Array(21).fill(0) as any;
    [2, 4, 9, 12].forEach(i => resp2[i] = 1); // raw=4, ×2=8
    expect(scoreDASS21(resp2).depressionSeverity).toBe('normal');
  });
});

// ═══════════════════════════════════════════════════════════════
// STOP-BANG — Chung et al. Anesthesiology. 2008;108(5):812-821
// ═══════════════════════════════════════════════════════════════

describe('STOP-BANG Scoring (Chung et al. 2008)', () => {
  const basePatient = {
    dateOfBirth: '1980-01-01',
    biologicalSex: 'male' as const,
    weightKg: 80,
    heightCm: 175,
  };

  test('all negative → low risk (score 0-1 depending on gender)', () => {
    const r = scoreSTOPBANG(
      { snoring: false, tired: false, observed: false, pressure: false, neckOver40cm: false },
      { ...basePatient, biologicalSex: 'female', dateOfBirth: '2000-01-01', weightKg: 60 }
    );
    expect(r.totalScore).toBeLessThanOrEqual(2);
    expect(r.risk).toBe('low');
  });

  test('all positive manual + male + age >50 + BMI >35 → high risk', () => {
    const r = scoreSTOPBANG(
      { snoring: true, tired: true, observed: true, pressure: true, neckOver40cm: true },
      { ...basePatient, dateOfBirth: '1960-01-01', weightKg: 130 } // BMI ~42
    );
    expect(r.totalScore).toBe(8);
    expect(r.risk).toBe('high');
  });

  test('score 3-4 → intermediate risk', () => {
    const r = scoreSTOPBANG(
      { snoring: true, tired: true, observed: false, pressure: false, neckOver40cm: false },
      basePatient // male, age ~46, BMI ~26
    );
    // snoring=1 + tired=1 + male=1 = 3
    expect(r.totalScore).toBe(3);
    expect(r.risk).toBe('intermediate');
  });
});

// ═══════════════════════════════════════════════════════════════
// BMI — WHO 2004
// ═══════════════════════════════════════════════════════════════

describe('BMI Calculation (WHO 2004)', () => {
  test('normal weight', () => {
    const r = calculateBMI(70, 175);
    expect(r.bmi).toBeCloseTo(22.86, 1);
    expect(r.category).toBe('normal');
    expect(r.isApneaRiskFactor).toBe(false);
  });

  test('obese class I → apnea risk factor', () => {
    const r = calculateBMI(100, 175);
    expect(r.bmi).toBeCloseTo(32.65, 1);
    expect(r.category).toBe('obese_I');
    expect(r.isApneaRiskFactor).toBe(true);
    expect(r.isSTOPBANGPositive).toBe(false);
  });

  test('obese class III → STOP-BANG positive', () => {
    const r = calculateBMI(130, 170);
    expect(r.bmi).toBeGreaterThan(35);
    expect(r.isSTOPBANGPositive).toBe(true);
  });

  test('rejects invalid weight', () => {
    expect(() => calculateBMI(-10, 170)).toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════
// Safety Rules
// ═══════════════════════════════════════════════════════════════

describe('Safety Rules', () => {
  test('SAFE-040: warfarina → blocks melatonin', () => {
    const r = safe040_melatoninAnticoagulant(['Warfarina 5mg']);
    expect(r.triggered).toBe(true);
    expect(r.blockedRecommendations).toContain('melatonin');
  });

  test('SAFE-040: no anticoagulants → clear', () => {
    const r = safe040_melatoninAnticoagulant(['Losartán', 'Metformina']);
    expect(r.triggered).toBe(false);
  });

  test('evaluateAllSafetyRules: minor blocks all', () => {
    const r = evaluateAllSafetyRules(
      { dateOfBirth: '2015-01-01', biologicalSex: 'male', weightKg: 50, heightCm: 160 },
      { isPregnant: false },
      []
    );
    expect(r.anyBlocking).toBe(true);
    expect(r.maxSeverity).toBe('block');
  });
});

// ═══════════════════════════════════════════════════════════════
// Phenotype Classifier
// ═══════════════════════════════════════════════════════════════

describe('Insomnia Phenotype Classifier', () => {
  const baseSleep = {
    sleepLatencyMinutes: 10,
    nightAwakenings: 0,
    earlyMorningAwakeningMinutes: 0,
    totalSleepHours: 7.5,
    timeInBedHours: 8,
  };

  test('ISI <8 → no insomnia', () => {
    const r = classifyInsomniaPhenotype(baseSleep, 5);
    expect(r.phenotype).toBe('none');
  });

  test('high latency + ISI ≥8 → onset', () => {
    const r = classifyInsomniaPhenotype(
      { ...baseSleep, sleepLatencyMinutes: 45 },
      15
    );
    expect(r.phenotype).toBe('onset');
    expect(r.hasOnsetComponent).toBe(true);
  });

  test('frequent awakenings + ISI ≥8 → maintenance', () => {
    const r = classifyInsomniaPhenotype(
      { ...baseSleep, nightAwakenings: 3 },
      16
    );
    expect(r.phenotype).toBe('maintenance');
    expect(r.hasMaintenanceComponent).toBe(true);
  });

  test('both patterns + ISI ≥8 → mixed', () => {
    const r = classifyInsomniaPhenotype(
      { ...baseSleep, sleepLatencyMinutes: 40, nightAwakenings: 3 },
      18
    );
    expect(r.phenotype).toBe('mixed');
  });
});

// ═══════════════════════════════════════════════════════════════
// Recommendations Engine
// ═══════════════════════════════════════════════════════════════

describe('Recommendations Engine', () => {
  test('phenotype none → no recommendations', () => {
    const r = generateRecommendations('none', []);
    expect(r.primary.length).toBe(0);
  });

  test('onset phenotype → excludes melatonin (circadian/jetlag only)', () => {
    const r = generateRecommendations('onset', []);
    const allRecs = [...r.primary, ...r.adjunctive, ...r.optional];
    expect(allRecs.some(rec => rec.id === 'melatonin')).toBe(false);
  });

  test('blocked supplements → no supplements in results', () => {
    const r = generateRecommendations('mixed', ['ALL_SUPPLEMENTS']);
    const allRecs = [...r.primary, ...r.adjunctive, ...r.optional];
    expect(allRecs.every(rec => rec.category === 'behavioral')).toBe(true);
  });

  test('anxiety flag → relaxation boosted to primary', () => {
    const r = generateRecommendations('onset', [], true, false);
    expect(r.primary.some(rec => rec.id === 'relaxation')).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// Risk Integrator
// ═══════════════════════════════════════════════════════════════

describe('Risk Integrator', () => {
  test('all normal → low risk', () => {
    const r = assessRisk({
      isiTotal: 5, essTotal: 6, stopBangTotal: 1,
      phq9Total: 3, gad7Total: 2,
      dass21StressScore: 10, bmi: 23, sleepEfficiencyPercent: 90,
    });
    expect(r.overallRisk).toBe('low');
    expect(r.triggeredFlags.length).toBe(0);
  });

  test('high STOP-BANG → severe + PSG referral', () => {
    const r = assessRisk({
      isiTotal: 10, essTotal: 12, stopBangTotal: 6,
      phq9Total: 3, gad7Total: 2,
      dass21StressScore: 10, bmi: 36, sleepEfficiencyPercent: 80,
    });
    expect(r.overallRisk).toBe('severe');
    expect(r.referralReasons.some(r => r.includes('polisomnografía'))).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// Lab & Genetics
// ═══════════════════════════════════════════════════════════════

describe('Lab Parameters', () => {
  test('vitamin D 50 → optimal', () => {
    const r = analyzeLabValue('vitD', 50);
    expect(r.status).toBe('optimal');
  });

  test('vitamin D 15 → deficient', () => {
    const r = analyzeLabValue('vitD', 15);
    expect(r.status).toBe('deficient');
  });

  test('ferritin 50 → suboptimal (below 75 threshold)', () => {
    const r = analyzeLabValue('ferritin', 50);
    expect(r.status).toBe('suboptimal');
  });
});

describe('Genetic Variants', () => {
  test('CLOCK C/C → significant impact', () => {
    const r = analyzeVariant('CLOCK', 'C/C');
    expect(r.impact).toBe('significant');
  });

  test('ADORA2A T/T → high caffeine sensitivity', () => {
    const r = analyzeVariant('ADORA2A', 'T/T');
    expect(r.impact).toBe('significant');
  });

  test('COMT Met/Met → slow catecholamine degradation', () => {
    const r = analyzeVariant('COMT', 'Met/Met');
    expect(r.impact).toBe('significant');
  });

  test('unknown gene → throws', () => {
    expect(() => analyzeVariant('BRCA1', 'A/A')).toThrow();
  });
});
