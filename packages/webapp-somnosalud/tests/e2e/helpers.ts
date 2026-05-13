import type { Page } from '@playwright/test';

/**
 * Helpers reusables para los tests E2E del flow de evaluacion.
 *
 * Cada helper deja el estado en una pantalla especifica para que el
 * test puede continuar desde ahi. Algunos helpers usan
 * page.evaluate(sessionStorage) para acelerar el setup cuando NO se
 * esta probando ese paso particular del flow.
 */

/**
 * Setea cookie de consent + sessionStorage de profile para saltar
 * los pasos welcome/disclaimer/terms/profile cuando un test
 * arranca desde mas adelante en el flow.
 *
 * Despues llamar a esto, page.goto('/eval/safety') etc. funciona
 * sin redirect.
 */
export async function skipToEvalWithProfile(
  page: Page,
  options: {
    age?: number; // anos, default 30 → DOB calculado
    sex?: 'male' | 'female' | 'prefer_not_to_say';
    weightKg?: number;
    heightCm?: number;
  } = {},
): Promise<void> {
  const age = options.age ?? 30;
  const sex = options.sex ?? 'male';
  const weightKg = options.weightKg ?? 75;
  const heightCm = options.heightCm ?? 175;

  // Calcular DOB ISO 8601 que de exactamente `age` anos.
  const today = new Date();
  const dob = new Date(
    today.getFullYear() - age,
    today.getMonth(),
    today.getDate(),
  );
  const dobIso = dob.toISOString().slice(0, 10);

  // Setear cookie consent BEFORE navegar (middleware Capa 1).
  await page.context().addCookies([
    {
      name: 'somno_consent_v1',
      value: 'accepted',
      domain: 'localhost',
      path: '/',
      expires: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      httpOnly: false,
      secure: false,
      sameSite: 'Strict',
    },
  ]);

  // Setear sessionStorage profile via inicializar la pagina home + evaluate.
  await page.goto('/');
  await page.evaluate(
    ({ dobIso, sex, weightKg, heightCm }) => {
      const state = {
        profile: {
          dateOfBirth: dobIso,
          biologicalSex: sex,
          weightKg,
          heightCm,
        },
      };
      window.sessionStorage.setItem('somno_eval_v1', JSON.stringify(state));
    },
    { dobIso, sex, weightKg, heightCm },
  );
}

/**
 * Pre-popula sessionStorage con state completo de evaluacion. Util
 * para tests que necesitan llegar a /eval/results sin completar 12 pasos.
 *
 * Responses canonicas: paciente adulto SIN red flags.
 */
export async function skipToResults(page: Page): Promise<void> {
  await skipToEvalWithProfile(page);

  const today = new Date();
  const dobIso = new Date(today.getFullYear() - 30, 0, 1).toISOString().slice(0, 10);

  await page.evaluate((dobIso) => {
    const state = {
      profile: {
        dateOfBirth: dobIso,
        biologicalSex: 'male',
        weightKg: 75,
        heightCm: 175,
      },
      safety: {
        pregnancyStatus: 'no',
        isPregnant: false,
        currentMedications: [],
        anticoagulantFlag: false,
        medicalConditions: [],
        allergies: [],
        shiftWork: false,
      },
      isi: [1, 1, 1, 1, 1, 1, 1], // total 7 = no_insomnia
      ess: [0, 0, 0, 0, 0, 0, 0, 0], // total 0 = normal
      stopBang: {
        snoring: false,
        tired: false,
        observed: false,
        pressure: false,
        neckOver40cm: false,
      },
      phq9: [0, 0, 0, 0, 0, 0, 0, 0, 0], // total 0 = minimal
      gad7: [0, 0, 0, 0, 0, 0, 0],
      dass21: Array(21).fill(0),
      sleep: {
        sleepLatencyMin: 15,
        totalHoursAsleep: 7.5,
        timeInBedHours: 8,
        awakeningsPerNight: 1,
        qualitySubjective: 7,
        bedtimeTypical: '23:00',
        wakeTimeTypical: '07:00',
      },
    };
    window.sessionStorage.setItem('somno_eval_v1', JSON.stringify(state));
  }, dobIso);
}

/**
 * Acepta T&C (consent cookie via UI real). Util cuando queremos
 * probar el flujo de consent + no skipearlo.
 */
export async function acceptConsent(page: Page): Promise<void> {
  await page.goto('/disclaimer');
  await page.getByRole('link', { name: /Continuar a términos/i }).click();
  await page.waitForURL(/\/terms/);
  await page.getByRole('checkbox', { name: /Leí y acepto/i }).check();
  await page.getByRole('button', { name: /Aceptar y continuar/i }).click();
  await page.waitForURL(/\/eval\/profile/);
}

/**
 * Fill ProfileForm con DOB que de la edad indicada. Submit + espera
 * navegacion al siguiente paso.
 */
export async function fillProfile(
  page: Page,
  options: {
    age: number;
    sex?: 'male' | 'female';
    weightKg?: number;
    heightCm?: number;
  },
): Promise<void> {
  const today = new Date();
  const dob = new Date(
    today.getFullYear() - options.age,
    today.getMonth(),
    today.getDate(),
  );
  const dobIso = dob.toISOString().slice(0, 10);

  await page.locator('#dob').fill(dobIso);
  await page.locator('#sex').selectOption(options.sex ?? 'male');
  await page.locator('#weight').fill(String(options.weightKg ?? 75));
  await page.locator('#height').fill(String(options.heightCm ?? 175));
  await page.getByRole('button', { name: /Continuar/ }).click();
}
