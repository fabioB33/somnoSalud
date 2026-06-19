/**
 * Sprint 11 (2026-06-19) — Tests del progress-builder.
 */
import { describe, expect, it } from 'vitest';

import {
  buildProgressInsights,
  computeAverages,
  computeStreaks,
  isGoodNight,
  sleepEfficiency,
  type DiaryEntryWebapp,
} from '@/lib/progress-builder';

function makeEntry(overrides: Partial<DiaryEntryWebapp> = {}): DiaryEntryWebapp {
  return {
    recordedAt: '2026-06-19T08:00:00Z',
    forDate: '2026-06-18',
    sleepLatencyMinutes: 15,
    nightAwakenings: 1,
    totalSleepHours: 7.5,
    timeInBedHours: 8,
    earlyAwakening: 'sometimes',
    subjectiveQuality: 7,
    ...overrides,
  };
}

describe('sleepEfficiency', () => {
  it('calcula porcentaje correctamente', () => {
    const entry = makeEntry({ totalSleepHours: 7.5, timeInBedHours: 8 });
    expect(sleepEfficiency(entry)).toBe(94); // 7.5/8 = 93.75 → round 94
  });

  it('retorna 0 si timeInBed es 0 (defensivo)', () => {
    const entry = makeEntry({ totalSleepHours: 0, timeInBedHours: 0 });
    expect(sleepEfficiency(entry)).toBe(0);
  });
});

describe('isGoodNight', () => {
  it('true cuando eff >= 85 y quality >= 7', () => {
    expect(isGoodNight(makeEntry({ totalSleepHours: 7.5, timeInBedHours: 8, subjectiveQuality: 7 }))).toBe(true);
  });

  it('false cuando eff < 85', () => {
    expect(isGoodNight(makeEntry({ totalSleepHours: 5, timeInBedHours: 8, subjectiveQuality: 9 }))).toBe(false);
  });

  it('false cuando quality < 7 aunque eff sea alto', () => {
    expect(isGoodNight(makeEntry({ totalSleepHours: 7.5, timeInBedHours: 8, subjectiveQuality: 5 }))).toBe(false);
  });
});

describe('computeStreaks', () => {
  it('retorna 0 con array vacío', () => {
    const r = computeStreaks([]);
    expect(r).toEqual({ currentStreakDays: 0, bestStreakDays: 0, totalGoodNights: 0 });
  });

  it('cuenta racha actual correctamente', () => {
    const entries = [
      makeEntry({ recordedAt: '2026-06-15T08:00:00Z', subjectiveQuality: 8 }),
      makeEntry({ recordedAt: '2026-06-16T08:00:00Z', subjectiveQuality: 8 }),
      makeEntry({ recordedAt: '2026-06-17T08:00:00Z', subjectiveQuality: 8 }),
    ];
    const r = computeStreaks(entries);
    expect(r.currentStreakDays).toBe(3);
    expect(r.bestStreakDays).toBe(3);
    expect(r.totalGoodNights).toBe(3);
  });

  it('rompe racha si hay mala noche en el medio', () => {
    const entries = [
      makeEntry({ recordedAt: '2026-06-15T08:00:00Z', subjectiveQuality: 8 }),
      makeEntry({ recordedAt: '2026-06-16T08:00:00Z', subjectiveQuality: 5 }), // mala
      makeEntry({ recordedAt: '2026-06-17T08:00:00Z', subjectiveQuality: 8 }),
    ];
    const r = computeStreaks(entries);
    expect(r.currentStreakDays).toBe(1);
    expect(r.bestStreakDays).toBe(1);
    expect(r.totalGoodNights).toBe(2);
  });
});

describe('computeAverages', () => {
  it('promedia correctamente 3 entries', () => {
    const entries = [
      makeEntry({ totalSleepHours: 6, timeInBedHours: 8, subjectiveQuality: 6 }),
      makeEntry({ totalSleepHours: 7, timeInBedHours: 8, subjectiveQuality: 7 }),
      makeEntry({ totalSleepHours: 8, timeInBedHours: 8, subjectiveQuality: 8 }),
    ];
    const r = computeAverages(entries);
    expect(r.avgSleepHours).toBe(7);
    expect(r.avgTimeInBedHours).toBe(8);
    expect(r.avgSubjectiveQuality).toBe(7);
    expect(r.count).toBe(3);
  });

  it('retorna 0 con array vacío', () => {
    const r = computeAverages([]);
    expect(r.count).toBe(0);
  });
});

describe('buildProgressInsights', () => {
  it('retorna 1 insight neutral si entries < 3', () => {
    const insights = buildProgressInsights([makeEntry(), makeEntry()]);
    expect(insights.length).toBe(1);
    expect(insights[0]?.id).toBe('need-more-data');
    expect(insights[0]?.tone).toBe('neutral');
  });

  it('genera insight positive con buena efficiency promedio', () => {
    const entries = Array.from({ length: 5 }, () =>
      makeEntry({ totalSleepHours: 7.5, timeInBedHours: 8, subjectiveQuality: 8 }),
    );
    const insights = buildProgressInsights(entries);
    expect(insights.some((i) => i.tone === 'positive')).toBe(true);
  });

  it('genera insight attention con efficiency baja', () => {
    const entries = Array.from({ length: 5 }, () =>
      makeEntry({ totalSleepHours: 5, timeInBedHours: 9, subjectiveQuality: 4 }),
    );
    const insights = buildProgressInsights(entries);
    expect(insights.some((i) => i.tone === 'attention')).toBe(true);
  });
});
