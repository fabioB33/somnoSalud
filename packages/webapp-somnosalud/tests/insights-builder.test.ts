/**
 * Sprint 14 (2026-06-19) — Tests del insights-builder.
 */
import { describe, expect, it } from 'vitest';

import {
  buildAcompanamientoInsight,
  buildAllInsights,
  buildCuerpoInsight,
  buildDescansoInsight,
  buildRespiracionInsight,
  buildResumenInsight,
} from '@/lib/insights-builder';
import type { BuildResultsOutput } from '@/lib/results-builder';

function makeResults(
  overrides: Partial<Record<string, unknown>> = {},
): BuildResultsOutput {
  return {
    complete: true,
    bmi: { value: 22, category: 'normal' },
    isi: { score: 5, severity: 'no_insomnia',  },
    ess: { score: 6, level: 'normal' },
    stopBang: { score: 1, risk: 'low', positiveCount: 1 },
    phq9: {
      score: 3,
      severity: 'minimal',
      suicidalIdeation: false,
      suicidalIdeationCharacterization: 'none',
    },
    gad7: { score: 2, severity: 'minimal' },
    dass21: {
      depression: { score: 0, severity: 'normal' },
      anxiety: { score: 0, severity: 'normal' },
      stress: { score: 0, severity: 'normal' },
    },
    phenotype: { phenotype: 'none', label: 'Sin fenotipo', description: '...' },
    risk: { level: 'clear', label: 'Sin riesgo', summary: '...' },
    recommendations: { daily: [] },
    precision: { score: 0.8 },
    labPanel: null,
    geneticProfile: null,
    ...overrides,
  } as unknown as BuildResultsOutput;
}

describe('buildRespiracionInsight', () => {
  it('retorna empty cuando results es null', () => {
    const r = buildRespiracionInsight(null);
    expect(r.tone).toBe('neutral');
    expect(r.id).toBe('respiracion');
  });

  it('urgent con risk high', () => {
    const r = buildRespiracionInsight(makeResults({ stopBang: { score: 6, risk: 'high', positiveCount: 6 } }));
    expect(r.tone).toBe('urgent');
    expect(r.derivationNote).not.toBeNull();
  });

  it('attention con risk intermediate', () => {
    const r = buildRespiracionInsight(makeResults({ stopBang: { score: 3, risk: 'intermediate', positiveCount: 3 } }));
    expect(r.tone).toBe('attention');
  });

  it('positive con risk low', () => {
    const r = buildRespiracionInsight(makeResults());
    expect(r.tone).toBe('positive');
    expect(r.derivationNote).toBeNull();
  });
});

describe('buildDescansoInsight', () => {
  it('urgent con ISI severe', () => {
    const r = buildDescansoInsight(makeResults({
      isi: { score: 22, severity: 'severe' },
    }));
    expect(r.tone).toBe('urgent');
  });

  it('attention con clinicallySignificant', () => {
    const r = buildDescansoInsight(makeResults({
      isi: { score: 12, severity: 'moderate' },
      phenotype: { phenotype: 'onset', label: 'Inicio', description: '...' },
    }));
    expect(r.tone).toBe('attention');
    expect(r.body).toContain('iniciar el sueño');
  });

  it('positive sin significancia', () => {
    const r = buildDescansoInsight(makeResults());
    expect(r.tone).toBe('positive');
  });
});

describe('buildAcompanamientoInsight', () => {
  it('urgent con suicidalIdeation true', () => {
    const r = buildAcompanamientoInsight(makeResults({
      phq9: { score: 3, severity: 'minimal', suicidalIdeation: true, suicidalIdeationCharacterization: 'thought' },
    }));
    expect(r.tone).toBe('urgent');
    expect(r.body).toContain('0800-999-0091');
  });

  it('urgent con PHQ-9 severe sin ideacion', () => {
    const r = buildAcompanamientoInsight(makeResults({
      phq9: { score: 20, severity: 'severe', suicidalIdeation: false, suicidalIdeationCharacterization: 'none' },
    }));
    expect(r.tone).toBe('urgent');
  });

  it('attention con PHQ-9 moderate', () => {
    const r = buildAcompanamientoInsight(makeResults({
      phq9: { score: 10, severity: 'moderate', suicidalIdeation: false, suicidalIdeationCharacterization: 'none' },
    }));
    expect(r.tone).toBe('attention');
  });

  it('positive con minimal', () => {
    const r = buildAcompanamientoInsight(makeResults());
    expect(r.tone).toBe('positive');
  });
});

describe('buildCuerpoInsight', () => {
  it('attention con obesidad I', () => {
    const r = buildCuerpoInsight(makeResults({ bmi: { value: 32, category: 'obesity_1' } }));
    expect(r.tone).toBe('attention');
  });

  it('positive con normal', () => {
    const r = buildCuerpoInsight(makeResults());
    expect(r.tone).toBe('positive');
  });

  it('attention con bajo peso', () => {
    const r = buildCuerpoInsight(makeResults({ bmi: { value: 17, category: 'underweight' } }));
    expect(r.tone).toBe('attention');
  });
});

describe('buildResumenInsight', () => {
  it('positive cuando todos son positivos', () => {
    const r = buildResumenInsight(makeResults());
    expect(r.tone).toBe('positive');
  });

  it('urgent cuando hay al menos 1 urgent', () => {
    const r = buildResumenInsight(makeResults({
      stopBang: { score: 6, risk: 'high', positiveCount: 6 },
    }));
    expect(r.tone).toBe('urgent');
    expect(r.summary).toContain('1');
  });

  it('attention cuando hay attention pero no urgent', () => {
    const r = buildResumenInsight(makeResults({
      bmi: { value: 27, category: 'overweight' },
      isi: { score: 12, severity: 'moderate' },
    }));
    expect(r.tone).toBe('attention');
  });
});

describe('buildAllInsights', () => {
  it('retorna 5 insights en orden', () => {
    const r = buildAllInsights(makeResults());
    expect(r.length).toBe(5);
    expect(r.map((i) => i.id)).toEqual([
      'resumen',
      'respiracion',
      'descanso',
      'acompanamiento',
      'cuerpo',
    ]);
  });

  it('retorna 5 insights neutral cuando results null', () => {
    const r = buildAllInsights(null);
    expect(r.length).toBe(5);
    expect(r.every((i) => i.tone === 'neutral')).toBe(true);
  });
});
