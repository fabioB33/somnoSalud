import { test, expect } from '@playwright/test';

import { skipToEvalWithProfile, skipToResults } from './helpers';

test.describe('T7 — Results redirige si flow incompleto', () => {
  test('Visitar /eval/results sin completar flow → redirige al primer paso faltante', async ({
    page,
  }) => {
    // Cookie consent OK + profile en sessionStorage, pero NADA mas
    // (sin safety, sin cuestionarios). buildResults debería detectar
    // missingSteps = ['safety', 'isi', ...] y redirigir a /eval/safety.
    await skipToEvalWithProfile(page);

    await page.goto('/eval/results');

    // Redirige a /eval/safety (primer paso faltante después de profile).
    await page.waitForURL(/\/eval\/safety/, { timeout: 5000 });
    expect(page.url()).toContain('/eval/safety');
  });
});

test.describe('T8 — Reset Dialog → sessionStorage limpio + redirect /', () => {
  test('Click "Empezar de nuevo" → Dialog visible → confirmar → sessionStorage limpio', async ({
    page,
  }) => {
    await skipToResults(page);
    await page.goto('/eval/results');

    await expect(
      page.getByRole('heading', { name: /Tus resultados/i }),
    ).toBeVisible({ timeout: 10_000 });

    // Verificar que hay state ANTES del reset.
    const stateBefore = await page.evaluate(() => {
      return window.sessionStorage.getItem('somno_eval_v1');
    });
    expect(stateBefore).not.toBeNull();
    expect(stateBefore!.length).toBeGreaterThan(50);

    // Click "Empezar de nuevo" → abre Dialog.
    await page.getByRole('button', { name: /Empezar de nuevo/i }).click();

    // Dialog visible con título.
    await expect(
      page.getByRole('heading', {
        name: /¿Empezar una evaluación nueva\?/i,
      }),
    ).toBeVisible();

    // Confirmar.
    await page.getByRole('button', { name: /Sí, empezar de nuevo/i }).click();

    // Redirect a /.
    await page.waitForURL('http://localhost:3000/', { timeout: 5000 });

    // sessionStorage borrado.
    const stateAfter = await page.evaluate(() => {
      return window.sessionStorage.getItem('somno_eval_v1');
    });
    expect(stateAfter).toBeNull();
  });

  test('Click "Cancelar" en Dialog → no se borra nada, vuelve a /eval/results', async ({
    page,
  }) => {
    await skipToResults(page);
    await page.goto('/eval/results');

    await expect(
      page.getByRole('heading', { name: /Tus resultados/i }),
    ).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: /Empezar de nuevo/i }).click();
    await expect(
      page.getByRole('heading', { name: /¿Empezar una evaluación nueva\?/i }),
    ).toBeVisible();

    // Cancelar.
    await page.getByRole('button', { name: /^Cancelar$/i }).click();

    // sessionStorage sigue intacto.
    const stateAfter = await page.evaluate(() => {
      return window.sessionStorage.getItem('somno_eval_v1');
    });
    expect(stateAfter).not.toBeNull();
    expect(stateAfter!.length).toBeGreaterThan(50);

    // Sigue en /eval/results.
    expect(page.url()).toContain('/eval/results');
  });
});
