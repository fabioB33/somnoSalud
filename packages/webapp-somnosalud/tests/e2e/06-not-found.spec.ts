import { test, expect } from '@playwright/test';

test.describe('T9 — 404 custom para rutas inexistentes', () => {
  test('Visitar /ruta-inexistente → renderiza NotFound custom con Moon icon', async ({
    page,
  }) => {
    const response = await page.goto('/ruta-que-no-existe');

    // Status HTTP debe ser 404 (no 200 con contenido 404 ugly).
    expect(response?.status()).toBe(404);

    // El contenido del custom 404.
    await expect(
      page.getByRole('heading', { name: /Esta página no existe/i }),
    ).toBeVisible();

    await expect(page.getByText(/Error 404/i)).toBeVisible();

    // CTAs visibles.
    await expect(
      page.getByRole('link', { name: /Volver al inicio/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Empezar evaluación/i }),
    ).toBeVisible();
  });

  test('Click "Volver al inicio" en 404 → navega a /', async ({ page }) => {
    await page.goto('/ruta-no-existe-tampoco');
    await page.getByRole('link', { name: /Volver al inicio/i }).click();
    await page.waitForURL('http://localhost:3000/');
    expect(page.url()).toBe('http://localhost:3000/');
  });
});
