import { test, expect } from '@playwright/test';

import { skipToResults } from './helpers';

test.describe('T1 — Happy path completo', () => {
  test('Flow welcome → resultados con scoring visible (pre-popula sessionStorage)', async ({
    page,
  }) => {
    // Pre-poblamos sessionStorage con responses canónicas (paciente sin red flags).
    // Este test verifica que /eval/results renderiza correctamente con datos
    // completos — el flow paso a paso de los 12 forms está cubierto por
    // tests específicos de cada Capa (02-compliance-gates).
    await skipToResults(page);

    await page.goto('/eval/results');

    // Esperar a que ResultsContent hidrate y renderice scoring.
    await expect(
      page.getByRole('heading', { name: /Tus resultados/i }),
    ).toBeVisible({ timeout: 10_000 });

    // El score precision esperado para paciente "sin labs ni genetics".
    // Vemos al menos el label "Confianza del análisis:" visible.
    await expect(page.getByText(/Confianza del análisis/i)).toBeVisible();

    // Accordion sections deberian estar visibles (default expanded: resumen + recomendaciones).
    await expect(page.getByText(/Resumen de scoring/i)).toBeVisible();
    await expect(page.getByText(/Recomendaciones personalizadas/i)).toBeVisible();

    // ISI score esperado: paciente respondio [1,1,1,1,1,1,1] = total 7 = no_insomnia.
    // Buscamos el texto del scoring.
    await expect(page.getByText(/Sin insomnio/i).first()).toBeVisible();

    // Disclaimer reforzado debe estar visible (arriba Y abajo).
    const importantMarks = page.getByText(/IMPORTANTE — leé antes de implementar/i);
    expect(await importantMarks.count()).toBeGreaterThanOrEqual(1);

    // M.N. visible en footer.
    await expect(page.getByText(/M\.N\.\s*119\.783/).first()).toBeVisible();
  });

  test('Botones "Imprimir" y "Empezar de nuevo" visibles en /eval/results', async ({
    page,
  }) => {
    await skipToResults(page);
    await page.goto('/eval/results');

    await expect(
      page.getByRole('button', { name: /Imprimir.*PDF/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Empezar de nuevo/i }),
    ).toBeVisible();
  });

  test('?debug=1 muestra panel JSON raw', async ({ page }) => {
    await skipToResults(page);
    await page.goto('/eval/results?debug=1');

    await expect(
      page.getByText(/Debug: JSON raw del clinical-engine/i),
    ).toBeVisible();
  });
});
