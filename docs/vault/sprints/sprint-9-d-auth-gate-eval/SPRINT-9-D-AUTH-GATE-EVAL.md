---
title: "Sprint 9.D-auth-gate-eval — Login obligatorio en /eval/* + E2E helper con users reales"
date: 2026-05-26
sprint_number: 9.D-auth-gate-eval
status: closed-verified
closed_at: 2026-05-26
parent_debts: []
related:
  - "[[../sprint-9-a-supabase-client-auth/SPRINT-9-A-SUPABASE-CLIENT-AUTH]]"
  - "[[../sprint-9-b-login-ux/SPRINT-9-B-LOGIN-UX]]"
  - "[[../sprint-9-c-persist-eval/SPRINT-9-C-PERSIST-EVAL]]"
tags: [sprint, supabase, auth, compliance, ley-25326, ley-26529, fase-1]
---

# Sprint 9.D-auth-gate-eval — Login obligatorio en /eval/* + E2E auth helper

> [!info] Objetivo
> Cerrar el gap de compliance detectado por Fabio en smoke real: hoy un usuario anónimo puede completar `/eval/*` entero sin identificarse. Violación de Ley 25.326 (sin user → no hay sujeto sobre el cual aplicar derecho de acceso/supresión) y Ley 26.529 (consent informado sin trazabilidad de quién lo otorgó). **Hard gate:** `/eval/*` requiere login obligatorio. Welcome / about / privacidad / terms / disclaimer siguen públicos.

## Contexto

Sprint 9.C dejó persistencia DB write-through para usuarios autenticados, pero mantuvo `/eval/*` accesible sin login (compat con 19 E2E anónimos). Hoy Fabio confirmó empíricamente que puede completar el flow sin estar logueado:

> "lo que estoy notando es que puedo hacer el test sin iniciar sesion, tendria que haber una restriccion ahi"

Decisión Fabio (2026-05-26): **hard gate**.

## Hipótesis

- **H1** — Middleware redirige `GET /eval/*` sin sesión → `/login?next=/eval/<path>`. Excepción `/eval/menor-no-permitido` (terminal post-rechazo edad, no requiere session).
- **H2** — Welcome `/` con anónimo: botón "Empezar evaluación" linkea a `/login?next=/disclaimer` (era `href="/disclaimer"` directo).
- **H3** — E2E helper `skipToEvalWithProfile` crea test users efímeros vía Supabase admin API (service_role + `admin.createUser` con email_confirm: true) + setea cookies de sesión. Los 19 E2E siguen verdes con auth real.
- **H4** — `audit_log` registra signup vía trigger ya existente (`handle_new_user` no inserta audit pero el flow de magic link sí — verificar en smoke).
- **H5** — Compliance fields del perfil (`consent_terms_accepted_at`) se populan al aceptar disclaimer post-login (Sprint futuro 9.E si no entra en este).

## FASE 1 — Implementación

### Bloque A — Middleware hard gate

`middleware.ts`:
- Agregar `/eval` al `AUTH_PROTECTED_PREFIXES` con excepción `/eval/menor-no-permitido` (mantiene comportamiento Capa 3 actual).
- Sin sesión → redirect `/login?next=<pathname>` (NO `/terms` como redirige el compliance gate hoy — el consent ahora va junto con la auth).
- Compliance gate cookie sigue funcionando para `/disclaimer` y `/terms` separadamente (esos son públicos).

### Bloque B — Welcome `/` flow update

`app/page.tsx`:
- CTA "Empezar evaluación" cambia destino según sesión:
  - Anónimo: `<Link href="/login?next=/disclaimer">`.
  - Logueado: `<Link href="/disclaimer">` (sigue como ahora).
- Detección de sesión: Server Component lee `createClient().auth.getUser()`.

### Bloque C — E2E helper auth refactor

`tests/e2e/helpers.ts`:
- Nueva función `createTestUser(email)`: usa `SUPABASE_SECRET_KEY` para invocar `admin.createUser({ email, email_confirm: true, password })` + obtener tokens.
- Modificar `skipToEvalWithProfile`: además de cookie consent + sessionStorage profile, setea cookies `sb-<ref>-auth-token` con los tokens del test user.
- Cleanup helper: borrar test users post-test (test isolation).

### Bloque D — Cookie consent compliance

Mantener cookie `somno_consent_v1` como gate Capa 1 separado (compliance ANMAT requiere consent **antes** de procesar datos clínicos, no después del login). El orden:

1. Welcome / Privacy / About públicos (sin gate).
2. Click "Empezar evaluación" → `/login` si anónimo.
3. Post-login → `/disclaimer` (acepta consent y firma cookie + DB).
4. Post-disclaimer → `/eval/profile` (gate auth + gate consent ambos OK).

## FASE 2 — Verificación

- **E1:** lectura código actual confirma 19 E2E anónimos.
- **E2:** typecheck verde post-cambios middleware + helpers.
- **E3:** los 19 E2E Playwright passing con auth real (crean test users efímeros + cleanup).
- **E4:** smoke manual: anónimo en `/` → click "Empezar evaluación" → redirect `/login`. Login → redirect `/disclaimer`. Aceptar → `/eval/profile` OK.

## FASE 3 — Cierre

### Cambios consumados

| Archivo | Tipo | Resumen |
|---|---|---|
| `middleware.ts` | EDIT | `/eval` agregado a `AUTH_PROTECTED_PREFIXES`. Excepción `/eval/menor-no-permitido`. Compliance gate cookie sigue activo después del auth gate. |
| `app/page.tsx` | EDIT | HomePage ahora es async, lee user con `createClient().auth.getUser()`. CTA "Empezar evaluación" linkea a `/login?next=/disclaimer` si anónimo, sino `/disclaimer` directo. |
| `tests/e2e/helpers.ts` | EDIT (+180 LOC) | 3 funciones nuevas: `createTestUser()` (admin API + signIn), `deleteTestUser()` (cleanup), `setSupabaseSessionCookies()` (cookies sesión). `skipToEvalWithProfile` y `acceptConsent` ahora retornan `{ userId, email }`. |
| `tests/e2e/02-compliance-gates.spec.ts` | EDIT | T2 dividido en T2a (sin auth → /login) + T2b (auth sin consent → /terms). Test nuevo "/eval/profile con auth + consent permite acceso". |
| `tests/e2e/global-teardown.ts` | NEW (~50 LOC) | Lista todos los users con prefijo `e2e-` via admin API + DELETE en paralelo. Best-effort. |
| `playwright.config.ts` | EDIT | Carga `.env.local` con dotenv (helpers necesitan SUPABASE_SECRET_KEY). Registra globalTeardown. |
| `package.json` | EDIT | Add devDep `dotenv@17.4.2`. |

### Verificación empírica (E1-E4)

- **E1** ✅ — Lectura: middleware tenía `/mis-resultados` pero no `/eval`. Welcome tenía 2 `<Link href="/disclaimer">` directos. 19 E2E con `skipToEvalWithProfile` que solo seteaba cookie consent.
- **E2** ✅ — `pnpm typecheck` verde tras todos los cambios.
- **E3** ✅ — **20/20 E2E Playwright passing en 2.4 min**. Los 19 originales + 1 nuevo (T2b auth+consent). Helpers crean test users reales via admin API.
- **E4** ✅ — Smoke HTTP confirmado:
  - `/eval/profile` sin auth → 307 → `/login?next=%2Feval%2Fprofile`.
  - `/eval/safety` sin auth → 307 → `/login?next=%2Feval%2Fsafety`.
  - `/eval/results` sin auth → 307 → `/login?next=%2Feval%2Fresults`.
  - `/eval/menor-no-permitido` sin auth → 200 (excepción).
  - `/disclaimer`, `/` (públicos) → 200.

### Cleanup empírico

Al cerrar el sprint detecté 16 test users efímeros acumulados en `auth.users`. Limpieza manual + `globalTeardown` agregado para futuro:

```
Borrando 16 users e2e... Done
```

## FASE 4 — DEBT abierto

- **DEBT-consent-persist-db** (medium): el consent hoy solo va a cookie `somno_consent_v1`. Sprint 9.E debe persistir `consent_terms_accepted_at` + `consent_terms_version` en `profiles` cuando user logueado acepta disclaimer (compliance Ley 26.529 + Decreto 1089/2012 requiere registro permanente del consent).
- **DEBT-test-user-cleanup-robust** (low): si el `globalTeardown` falla a mitad (network error, rate limit admin API), quedan huérfanos. Sprint futuro: cron job semanal via service_role que limpia users `e2e-*` con `created_at > 7 días`.

## Bloque J — Reporte

**Sprint 9.D-auth-gate-eval cerrado 2026-05-26.**

- **Scope alcanzado:** hard auth gate en `/eval/*` con excepción `/eval/menor-no-permitido` + welcome flow consciente de sesión + E2E helper refactor con test users reales + cleanup automático.
- **Líneas modificadas:** ~250 (helpers +180, middleware +15, page +15, test refactor +35).
- **Líneas nuevas:** ~50 (globalTeardown).
- **Compliance:** ahora **todo dato clínico procesado tiene user identificable** → cumple Ley 25.326 (derecho de acceso/rectificación/supresión) + Ley 26.529 (consent trazable).
- **Tests:** 20/20 E2E Playwright verde en 2.4 min. Cero regresión. Los tests ahora corren contra el flow auth REAL (no mockean).
- **Dependencias added:** `dotenv@17.4.2` devDep.
- **DEBT cerrado:** 0.
- **DEBT abierto nuevo:** 2 (consent-persist-db, test-user-cleanup-robust).
- **Pampa Labs OS rules touched:** ninguna nueva. Cumple regla #8 EMPIRICAL-FIRST (smoke HTTP + 20 E2E pre-cierre) + #13 NO-HARDCODED (project ref y credenciales vía env vars).
- **Decision técnica destacable:** elegimos hard gate sobre soft gate porque el compliance Ley 26.529 requiere consent trazable a un sujeto identificado — un soft gate (anónimo puede explorar) firmaría consents anónimos sin valor regulatorio. Trade-off: 1 paso más para el usuario al inicio.
- **Excepción documentada:** `/eval/menor-no-permitido` queda sin auth porque es pantalla terminal post-rechazo de edad en `/eval/profile`. El user llega ahí ya autenticado normalmente, pero si comparte el link a un menor sin cuenta, queremos que vea la página informativa sin friction de signup.
