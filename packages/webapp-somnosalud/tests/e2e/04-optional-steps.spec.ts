import { test, expect } from '@playwright/test';

import { skipToEvalWithProfile } from './helpers';

test.describe('T6 — Lab + Genetics opcionales (botón Saltar)', () => {
  test('Lab: click "Saltar este paso" → sessionStorage.lab queda undefined + navega a /eval/genetics', async ({
    page,
  }) => {
    await skipToEvalWithProfile(page);
    await page.goto('/eval/lab');

    await expect(page.getByRole('heading', { name: /laboratorio/i })).toBeVisible();

    await page.getByRole('button', { name: /Saltar este paso/i }).click();

    await page.waitForURL(/\/eval\/genetics/);

    // Verificar sessionStorage: state.lab debe ser undefined.
    const labState = await page.evaluate(() => {
      const raw = window.sessionStorage.getItem('somno_eval_v1');
      if (!raw) return null;
      const state = JSON.parse(raw);
      return state.lab;
    });
    expect(labState).toBeUndefined();
  });

  test('Genetics: click "Saltar y ver resultados" → sessionStorage.genetics undefined + navega a /eval/results', async ({
    page,
  }) => {
    await skipToEvalWithProfile(page);
    await page.goto('/eval/genetics');

    await expect(page.getByRole('heading', { name: /Variantes genéticas/i })).toBeVisible();

    await page.getByRole('button', { name: /Saltar y ver resultados/i }).click();

    await page.waitForURL(/\/eval\/results/);

    const geneticsState = await page.evaluate(() => {
      const raw = window.sessionStorage.getItem('somno_eval_v1');
      if (!raw) return null;
      const state = JSON.parse(raw);
      return state.genetics;
    });
    expect(geneticsState).toBeUndefined();
  });
});
