import { test, expect } from '@playwright/test';

import { skipToEvalWithProfile, acceptConsent } from './helpers';

test.describe('Capa 1 — middleware bloquea /eval/* sin cookie', () => {
  test('T2: /eval/profile sin cookie redirige a /terms con searchParam', async ({
    page,
  }) => {
    // Sin pre-setear cookie.
    const response = await page.goto('/eval/profile');
    // Esperamos redirect a /terms?redirect=...
    await page.waitForURL(/\/terms\?redirect=/);
    expect(page.url()).toContain('/terms');
    expect(page.url()).toContain('redirect=%2Feval%2Fprofile');
  });

  test('/eval/profile con cookie consent permite acceso', async ({ page }) => {
    await skipToEvalWithProfile(page, { age: 30 });
    const response = await page.goto('/eval/profile');
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole('heading', { name: /Datos personales/i }),
    ).toBeVisible();
  });

  test('/eval/menor-no-permitido NO requiere consent (exception del middleware)', async ({
    page,
  }) => {
    // SIN cookie.
    const response = await page.goto('/eval/menor-no-permitido');
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole('heading', {
        name: /no disponible para menores/i,
      }),
    ).toBeVisible();
  });
});

test.describe('Capa 3 — verificación edad <18', () => {
  test('T3: DOB que da edad 16 → redirige a /eval/menor-no-permitido', async ({
    page,
  }) => {
    // Aceptar consent via UI real para testear flujo end-to-end.
    await acceptConsent(page);

    // En /eval/profile, ingresar DOB que da 16 años.
    const today = new Date();
    const dob16 = new Date(
      today.getFullYear() - 16,
      today.getMonth(),
      today.getDate(),
    );
    await page.locator('#dob').fill(dob16.toISOString().slice(0, 10));
    await page.locator('#sex').selectOption('male');
    await page.locator('#weight').fill('60');
    await page.locator('#height').fill('165');
    await page.getByRole('button', { name: /^Continuar/ }).click();

    // Debe redirigir a la pantalla de menor.
    await page.waitForURL(/\/eval\/menor-no-permitido/);
    await expect(
      page.getByRole('heading', {
        name: /no disponible para menores/i,
      }),
    ).toBeVisible();
  });

  test('DOB que da edad 18 (límite exacto) → permite continuar a /eval/safety', async ({
    page,
  }) => {
    await acceptConsent(page);

    // Edad 18 exacto.
    const today = new Date();
    const dob18 = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate(),
    );
    await page.locator('#dob').fill(dob18.toISOString().slice(0, 10));
    await page.locator('#sex').selectOption('female');
    await page.locator('#weight').fill('60');
    await page.locator('#height').fill('165');
    await page.getByRole('button', { name: /^Continuar/ }).click();

    await page.waitForURL(/\/eval\/safety/);
    expect(page.url()).toContain('/eval/safety');
  });
});

test.describe('Capa 4 — safety rules (SAFE-040 anticoagulantes, severity restrict)', () => {
  test('T4: warfarina en medicaciones → muestra warning + checkbox acknowledge, NO bloquea', async ({
    page,
  }) => {
    await skipToEvalWithProfile(page, { age: 35, sex: 'male' });
    await page.goto('/eval/safety');

    // Marcar warfarina como medicación.
    await page.locator('#medications').fill('warfarina, metformina');
    await page.getByRole('button', { name: /^Continuar/ }).click();

    // SAFE-040 es severity 'restrict' (no 'block') — muestra Alert warning
    // con el detalle de la regla disparada + checkbox "entiendo y quiero seguir".
    // El paciente queda en /eval/safety hasta que reconozca la restriccion.
    await expect(
      page.getByText(/restricciones detectadas/i),
    ).toBeVisible({ timeout: 5000 });
    // Buscar el SAFE-040 con el contenido específico (no la mención genérica del header).
    await expect(
      page.getByText(/SAFE-040: Paciente toma anticoagulante/i),
    ).toBeVisible();

    // Sin acknowledge, otro click Continuar deberia seguir mostrando warning.
    expect(page.url()).toContain('/eval/safety');
  });

  test('Warfarina + acknowledge → continua a /eval/isi (recomendaciones restringidas)', async ({
    page,
  }) => {
    await skipToEvalWithProfile(page, { age: 35, sex: 'male' });
    await page.goto('/eval/safety');

    await page.locator('#medications').fill('warfarina');
    await page.getByRole('button', { name: /^Continuar/ }).click();

    // Esperar a que aparezca el warning.
    await expect(
      page.getByText(/restricciones detectadas/i),
    ).toBeVisible({ timeout: 5000 });

    // Marcar checkbox "entiendo y quiero continuar".
    await page.getByLabel(/entiendo las restricciones/i).click();

    // Submit otra vez.
    await page.getByRole('button', { name: /^Continuar/ }).click();

    // Ahora SI deberia avanzar a /eval/isi.
    await page.waitForURL(/\/eval\/isi/, { timeout: 5000 });
    expect(page.url()).toContain('/eval/isi');
  });
});
