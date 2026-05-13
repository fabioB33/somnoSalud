import { test, expect } from '@playwright/test';

import { skipToEvalWithProfile } from './helpers';

test.describe('T5 — PHQ-9 ítem 9 (ideación suicida) detection LIVE', () => {
  test('Marcar ítem 9 con valor ≥ 1 dispara CrisisHotlineCard reinforced inmediatamente', async ({
    page,
  }) => {
    await skipToEvalWithProfile(page);

    // Saltar directo a /eval/phq9 (sin completar pasos anteriores — el middleware
    // solo bloquea por cookie consent, que ya seteamos).
    await page.goto('/eval/phq9');
    await expect(
      page.getByRole('heading', { name: /PHQ-9.*Salud mental/i }),
    ).toBeVisible();

    // Inicialmente NO debería estar visible el CrisisHotlineCard reinforced
    // (variant default puede estar abajo, pero el reforzado solo aparece al
    // marcar item 9).
    await expect(
      page.getByText(/Detectamos que marcaste pensamientos de hacerte daño/i),
    ).not.toBeVisible();

    // PHQ-9 tiene 9 items, cada uno con 4 opciones (value 0-3, labels Nunca/
    // Varios dias/Mas de la mitad/Casi todos). El ítem 9 (idx 8) es
    // "Pensamientos de que estarías mejor muerto/a o de hacerte daño".
    // El input radio se llama "phq9-item-8" (instrument-item-N convention
    // del QuestionnaireForm).
    // Marcar el ítem 9 con valor 1 ("Varios días").
    // Click en el label (pill) en vez del input directo — el input es sr-only
    // y los pills son los touch targets (Sprint 8.5 UX).
    await page.locator('label[for="phq9-item-8-opt-1"]').click();

    // Esperar a que aparezca el reforzado.
    await expect(
      page.getByText(/Detectamos que marcaste pensamientos de hacerte daño/i),
    ).toBeVisible({ timeout: 3000 });
  });

  test('Si vuelvo a marcar ítem 9 con valor 0 → reinforced desaparece, vuelve el default', async ({
    page,
  }) => {
    await skipToEvalWithProfile(page);
    await page.goto('/eval/phq9');

    // Marcar item 9 con 2 (Más de la mitad de los días).
    await page.locator('label[for="phq9-item-8-opt-2"]').click();
    await expect(
      page.getByText(/Detectamos que marcaste pensamientos de hacerte daño/i),
    ).toBeVisible({ timeout: 3000 });

    // Cambiar a 0 (Nunca).
    await page.locator('label[for="phq9-item-8-opt-0"]').click();

    // Reinforced desaparece, default vuelve al footer.
    await expect(
      page.getByText(/Detectamos que marcaste pensamientos de hacerte daño/i),
    ).not.toBeVisible();

    // El default ("Si necesitás ayuda urgente") sigue visible siempre — Decisión E3.
    await expect(page.getByText(/Si necesitás ayuda urgente/i)).toBeVisible();
  });
});
