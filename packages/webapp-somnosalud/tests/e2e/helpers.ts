import type { Page } from '@playwright/test';

/**
 * Helpers reusables para los tests E2E del flow de evaluacion.
 *
 * Sprint 9.D (2026-05-26): /eval/* requiere login obligatorio. Los helpers
 * que llevan al user a /eval/* deben primero crear un test user efimero
 * via Supabase admin API + setear las cookies de sesion. Despues sigue
 * el flow normal con cookie consent + sessionStorage profile.
 *
 * Cada helper deja el estado en una pantalla especifica para que el
 * test puede continuar desde ahi. Algunos helpers usan
 * page.evaluate(sessionStorage) para acelerar el setup cuando NO se
 * esta probando ese paso particular del flow.
 */

/**
 * Crea un test user efimero via Supabase admin API + retorna los tokens
 * de sesion para setear en cookies del browser. Requiere SUPABASE_SECRET_KEY
 * en process.env (cargado en playwright.config via dotenv).
 *
 * El email es aleatorio para evitar colision entre runs. Para cleanup
 * post-test, ver `deleteTestUser(userId)`.
 */
export async function createTestUser(): Promise<{
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !secretKey) {
    throw new Error(
      'Test users requieren NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SECRET_KEY en .env.local',
    );
  }

  const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.somnosalud.local`;
  const password = `Test-${Math.random().toString(36).slice(2, 18)}!`;

  // 1. Crear user via admin API (email_confirm: true skipea verificacion).
  const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      apikey: secretKey,
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  if (!createRes.ok) {
    throw new Error(
      `createTestUser admin.createUser falló: ${createRes.status} ${await createRes.text()}`,
    );
  }
  const created = (await createRes.json()) as { id: string };

  // 2. Sign in para obtener access + refresh tokens (no podemos con admin
  // API porque devuelve solo metadata, no tokens activos).
  const signInRes = await fetch(
    `${supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      method: 'POST',
      headers: {
        apikey: secretKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    },
  );
  if (!signInRes.ok) {
    throw new Error(
      `createTestUser signIn falló: ${signInRes.status} ${await signInRes.text()}`,
    );
  }
  const session = (await signInRes.json()) as {
    access_token: string;
    refresh_token: string;
  };

  return {
    userId: created.id,
    email,
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
  };
}

/**
 * Borra el test user creado por createTestUser via admin API.
 * Llamar en `afterEach` o `afterAll` para mantener auth.users limpia.
 *
 * Best-effort: si falla, NO rompe el test (solo log).
 */
export async function deleteTestUser(userId: string): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !secretKey) return;

  try {
    await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        apikey: secretKey,
        Authorization: `Bearer ${secretKey}`,
      },
    });
  } catch (err) {
    // Best-effort: log y seguir. Cleanup job admin periodico maneja los
    // huerfanos si esto fallara.
    console.warn('[e2e cleanup] deleteTestUser fallo:', err);
  }
}

/**
 * Setea las cookies de sesion Supabase en el browser context para que el
 * middleware reconozca al user como autenticado. Cookie name sigue la
 * convencion `sb-<project-ref>-auth-token` que usa @supabase/ssr.
 */
export async function setSupabaseSessionCookies(
  page: Page,
  tokens: { accessToken: string; refreshToken: string },
): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0];

  // @supabase/ssr serializa la session en formato JSON base64 con prefijo.
  // Replicamos el formato esperado para que el middleware pueda parsearlo.
  const sessionValue = JSON.stringify({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
  });
  const encoded = `base64-${Buffer.from(sessionValue).toString('base64')}`;

  await page.context().addCookies([
    {
      name: `sb-${projectRef}-auth-token`,
      value: encoded,
      domain: 'localhost',
      path: '/',
      expires: Math.floor(Date.now() / 1000) + 3600,
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
  ]);
}

/**
 * Setea sesion auth (test user efimero) + cookie consent + sessionStorage
 * profile para saltar los pasos welcome/login/disclaimer/terms/profile
 * cuando un test arranca desde mas adelante en el flow.
 *
 * Despues llamar a esto, page.goto('/eval/safety') etc. funciona sin
 * redirects ni del auth gate ni del compliance gate.
 *
 * **Importante:** retorna `userId` del test user creado. El test puede
 * usarlo en `afterEach` para llamar `deleteTestUser(userId)` y mantener
 * limpio el auth.users del project.
 */
export async function skipToEvalWithProfile(
  page: Page,
  options: {
    age?: number; // anos, default 30 → DOB calculado
    sex?: 'male' | 'female' | 'prefer_not_to_say';
    weightKg?: number;
    heightCm?: number;
  } = {},
): Promise<{ userId: string; email: string }> {
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

  // Sprint 9.D: crear test user + setear cookies de sesion (auth gate).
  const testUser = await createTestUser();
  await setSupabaseSessionCookies(page, {
    accessToken: testUser.accessToken,
    refreshToken: testUser.refreshToken,
  });

  // Setear cookie consent (compliance gate Capa 1).
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

  return { userId: testUser.userId, email: testUser.email };
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
 * Crea test user + acepta T&C (consent cookie via UI real). Util cuando
 * queremos probar el flujo de consent + no skipearlo.
 *
 * Sprint 9.D: /disclaimer requiere auth, asi que pre-creamos test user
 * antes de navegar. Retorna userId para cleanup del test.
 */
export async function acceptConsent(
  page: Page,
): Promise<{ userId: string; email: string }> {
  const testUser = await createTestUser();
  await setSupabaseSessionCookies(page, {
    accessToken: testUser.accessToken,
    refreshToken: testUser.refreshToken,
  });

  await page.goto('/disclaimer');
  await page.getByRole('link', { name: /Continuar a términos/i }).click();
  await page.waitForURL(/\/terms/);
  await page.getByRole('checkbox', { name: /Leí y acepto/i }).check();
  await page.getByRole('button', { name: /Aceptar y continuar/i }).click();
  await page.waitForURL(/\/eval\/profile/);

  return { userId: testUser.userId, email: testUser.email };
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
