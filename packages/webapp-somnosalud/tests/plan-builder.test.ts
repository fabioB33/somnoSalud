/**
 * Sprint 10 (2026-06-19) — Tests del plan-builder.
 */
import { describe, expect, it } from 'vitest';

import { buildPlanFromResults } from '@/lib/plan-builder';
import type { BuildResultsOutput } from '@/lib/results-builder';

describe('buildPlanFromResults — sin resultados', () => {
  it('retorna solo base hygiene cuando results es null', () => {
    const plan = buildPlanFromResults(null);
    expect(plan.items.length).toBe(3);
    expect(plan.items.map((i) => i.id)).toEqual(['luz_manana', 'horario', 'respiracion']);
    expect(plan.hasApneaSign).toBe(false);
    expect(plan.hasMoodSign).toBe(false);
    expect(plan.phenotype).toBe(null);
  });

  it('retorna solo base hygiene cuando results NO está complete', () => {
    const incompleteResults: BuildResultsOutput = {
      complete: false,
      missingSteps: ['profile'],
      nextRoute: '/eval/profile',
    };
    const plan = buildPlanFromResults(incompleteResults);
    expect(plan.items.length).toBe(3);
    expect(plan.items.every((i) => !i.fromEngine)).toBe(true);
  });
});

describe('buildPlanFromResults — completo con recommendations', () => {
  const makeCompleteResults = (overrides: Partial<Record<string, unknown>> = {}): BuildResultsOutput =>
    ({
      complete: true,
      bmi: { value: 22, category: 'normal' },
      isi: { score: 5, severity: 'subclinical', clinicallySignificant: false },
      ess: { score: 6, level: 'normal' },
      stopBang: { score: 1, risk: 'low', positiveCount: 1 },
      phq9: { score: 3, severity: 'minimal', suicidalIdeation: false, suicidalIdeationCharacterization: 'none' },
      gad7: { score: 2, severity: 'minimal' },
      dass21: {
        depression: { score: 0, severity: 'normal' },
        anxiety: { score: 0, severity: 'normal' },
        stress: { score: 0, severity: 'normal' },
      },
      phenotype: { phenotype: 'none', label: 'Sin fenotipo', description: '...' },
      risk: { level: 'clear', label: 'Sin riesgo', summary: '...' },
      recommendations: {
        daily: [
          { id: 'cafeina', title: 'Cafeína antes 15h', category: 'higiene' },
          { id: 'pantallas', title: 'Sin pantallas última hora', category: 'higiene' },
        ],
      },
      precision: { score: 0.8 },
      labPanel: null,
      geneticProfile: null,
      ...overrides,
    } as unknown as BuildResultsOutput);

  it('agrega items del motor sin duplicar base', () => {
    const plan = buildPlanFromResults(makeCompleteResults());
    expect(plan.items.length).toBe(5);
    const ids = plan.items.map((i) => i.id);
    expect(ids).toContain('luz_manana');
    expect(ids).toContain('cafeina');
    expect(ids).toContain('pantallas');
    expect(plan.items.find((i) => i.id === 'cafeina')?.fromEngine).toBe(true);
    expect(plan.items.find((i) => i.id === 'luz_manana')?.fromEngine).toBe(false);
  });

  it('NO duplica ítems con mismo id que la base', () => {
    const dup = makeCompleteResults({
      recommendations: {
        daily: [{ id: 'luz_manana', title: 'Luz mañana', category: 'higiene' }],
      },
    });
    const plan = buildPlanFromResults(dup);
    expect(plan.items.length).toBe(3);
    expect(plan.items.find((i) => i.id === 'luz_manana')?.fromEngine).toBe(false);
  });

  it('detecta hasApneaSign con stopBang.risk === intermediate', () => {
    const r = makeCompleteResults({
      stopBang: { score: 4, risk: 'intermediate', positiveCount: 4 },
    });
    const plan = buildPlanFromResults(r);
    expect(plan.hasApneaSign).toBe(true);
  });

  it('detecta hasMoodSign con phq9.severity === moderate', () => {
    const r = makeCompleteResults({
      phq9: {
        score: 12,
        severity: 'moderate',
        suicidalIdeation: false,
        suicidalIdeationCharacterization: 'none',
      },
    });
    const plan = buildPlanFromResults(r);
    expect(plan.hasMoodSign).toBe(true);
  });

  it('phenotype string viene del enum (no del label)', () => {
    const r = makeCompleteResults({
      phenotype: { phenotype: 'onset', label: 'Inicio', description: '...' },
    });
    const plan = buildPlanFromResults(r);
    expect(plan.phenotype).toBe('onset');
  });
});
