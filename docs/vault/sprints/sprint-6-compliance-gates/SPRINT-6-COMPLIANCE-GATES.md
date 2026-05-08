---
title: "Sprint 6 — Pantallas P0 compliance gates (capas 1-3 de ADR-003)"
date: 2026-05-08
last_synced_with_vault_reality: 2026-05-08
tags: [sprint, sprint-6, compliance, anmat, ley-25326, ley-26529, fase-1, somnosalud]
status: in-progress
parent_debts: []
related:
  - "[[../sprint-5-scaffold-webapp-somnosalud/SPRINT-5-SCAFFOLD-WEBAPP-SOMNOSALUD]]"
  - "[[../sprint-5-5-documentacion-vault/SPRINT-5-5-DOCUMENTACION-VAULT]]"
  - "[[../../architecture/adr/ADR-003-compliance-gates-en-codigo]]"
  - "[[../../concepts/CONVENCIONES-FRONTEND-WEBAPP]]"
  - "[[../../clinical/COMPLIANCE-ARGENTINA]]"
  - "[[../../../../.claude/agents/compliance-anmat]]"
  - "[[../../../../CLAUDE]]"
followup_debts: []
owner: fabio + cowork
participants: [fabio, claude-cowork]
created: 2026-05-08
---

# Sprint 6 — Pantallas P0 compliance gates

> Implementa las **capas 1-3 de [[../../architecture/adr/ADR-003-compliance-gates-en-codigo|ADR-003]]** en código real. Sin estos gates, la webapp NO puede pasar a producción ni siquiera como preview público (regla del agent [[../../../../.claude/agents/compliance-anmat|compliance-anmat]] + checklist Pre-launch público de [[../../clinical/COMPLIANCE-ARGENTINA]]).

## Contexto

Sprint 5 dejó scaffold + welcome page. La pantalla welcome tiene M.N. visible + disclaimer informativo en card, pero el botón "Empezar evaluación" está disabled — porque no hay flow de evaluación que pueda arrancar sin antes pasar gates de:

1. **Disclaimer médico** explícito (Ley 26.529 — paciente debe leer antes de acceder a evaluación clínica).
2. **Consentimiento informado** con checkbox NO pre-marcado (Ley 25.326 art. 6).
3. **Verificación edad** ≥18 hard gate (SAFE-010 del clinical-engine + decisión clínica Pablo Ferrero).

Cada uno tiene **forma específica** de implementarse según ADR-003. Este sprint baja eso a código.

**Persistencia:** sessionStorage (no Supabase todavía — eso es Sprint 11). Cookie `somno_consent_v1` para que middleware pueda verificar server-side. SessionStorage para datos de la evaluación que NO requieren server-side check.

---

## Objetivos

1. **Capa 1 — `middleware.ts`** que bloquee `/eval/*` sin cookie `somno_consent_v1`.
2. **Capa 2 — `app/eval/layout.tsx` + `DisclaimerBanner`** componente que se renderiza en TODAS las pantallas `/eval/*`.
3. **Capa 3 — `/eval/profile`** con verificación edad <18 hard gate.
4. **Pantallas P0** funcionales:
   - `/disclaimer` — texto canónico de disclaimer + M.N. + botón "Continuar".
   - `/terms` — T&C + checkbox consentimiento NO pre-marcado + botón "Aceptar y continuar" deshabilitado hasta que checkbox está marcado.
   - `/eval/profile` — form con DOB + nombre + sexo biológico + peso + altura, validación edad <18 → redirige.
   - `/eval/menor-no-permitido` — pantalla derivación a especialista.
5. **Estado client-side**:
   - `lib/persist.ts` — wrappers sessionStorage type-safe.
   - `hooks/useConsent.ts` — hook que lee/escribe cookie `somno_consent_v1` (1 año TTL, SameSite=Strict).
   - `hooks/usePersistEval.ts` — hook que persiste/lee evaluación parcial en sessionStorage.
6. **Componentes shadcn nuevos**: Checkbox, Input, Label, Alert (para banners de error/info).
7. **Welcome page actualizada**: botón "Empezar evaluación" habilitado, redirige a `/disclaimer`.
8. **Pipeline CI verde** post-cambios (5/5 o 6/6 tasks successful, 55/55 tests).

**Fuera de scope (Sprint 7+):**
- Pantallas `/eval/safety` (capa 4) y siguientes (cuestionarios).
- Pantalla `/eval/results` (capa 5).
- Tests E2E Playwright (Sprint 13+).
- Persistencia Supabase (Sprint 11+).

---

## FASE 0 — Skills cargadas

- **engineering-frontend-developer** ([[../../../../.claude/agents/engineering-frontend-developer]]) — patrón canónico Next.js 14 App Router + RSC + Server/Client Components.
- **engineering-minimal-change-engineer** — disciplina anti-scope-creep. NO meter pantallas Sprint 7 acá.
- **compliance-anmat** ([[../../../../.claude/agents/compliance-anmat]]) — agent canónico AR/ANMAT. Validar texto canónico del disclaimer + flow de consent + verificación edad.
- **engineering-code-reviewer** — pre-merge para review correctness/security en compliance code.
- **testing-accessibility-auditor** — accesibilidad mínima WCAG 2.1 A en formularios (labels asociados, navegación teclado, contraste).
- **obsidian-markdown** — sprint doc + actualizaciones del Vault.

Lectura previa:
- [[../../architecture/adr/ADR-003-compliance-gates-en-codigo]] — define las capas 1-3 con código de ejemplo.
- [[../../concepts/CONVENCIONES-FRONTEND-WEBAPP]] §1 (RSC vs client), §3 (estructura), §5 (accesibilidad), §7 (cómo agregar pantalla nueva).
- [[../../clinical/COMPLIANCE-ARGENTINA]] §"Disclaimer médico obligatorio (texto canónico)" + §"Política de privacidad".
- [[../../../../packages/clinical-engine/src/safety/rules.ts]] — SAFE-010 edad mínima.
- [[../../../../packages/webapp-somnosalud/app/page.tsx]] — welcome page Sprint 5 a actualizar.

---

## FASE 1 — Hipótesis a verificar empíricamente

| # | Hipótesis | Verificación | Si FALSE → implicancia |
|---|---|---|---|
| H1 | Next.js 14 `middleware.ts` puede leer cookies y hacer `NextResponse.redirect()` con search params preservados | Setear cookie ausente, navegar a `/eval/profile`, ver redirect a `/terms?redirect=/eval/profile`. Setear cookie y navegar, ver acceso permitido. | Si falla: API de middleware cambió, revisar docs Next |
| H2 | `app/eval/layout.tsx` se renderiza en TODAS las rutas `/eval/*` sin posibilidad de override | Crear `/eval/foo/page.tsx` mock, ver que `DisclaimerBanner` aparece sí o sí | Si falla: hay que ponerlo en cada page individual (peor) |
| H3 | `cookies()` de `next/headers` permite escribir cookies desde Server Action | Form `/terms` que escribe cookie + redirige funciona | Si falla: usar Route Handler en lugar de Server Action |
| H4 | shadcn `Checkbox`, `Input`, `Label`, `Alert` se pueden agregar manualmente sin breaking changes a Button + Card existentes | Copiar archivos desde docs shadcn, `pnpm typecheck` exit 0 | Si falla: revisar deps Radix nuevas |
| H5 | `useReducer` + sessionStorage en client component permite persistencia entre refresh sin pérdida de data | Llenar `/eval/profile`, refresh, ver datos preservados | Si falla: usar `localStorage` o reducer persistido |
| H6 | Cálculo edad desde DOB con date-fns o vanilla JS funciona correcto en edge cases (29 feb, leap years, timezone) | Test unitario con casos edge | Si falla: usar lib más robusta (date-fns) |
| H7 | Pipeline CI cross-monorepo sigue verde post-cambios (no-op para clinical-engine y otros packages) | `pnpm install/lint/typecheck/test/build` → 5-6/N successful | Si rompe: investigar |

---

## FASE 1 RESULTADOS — Evidencia empírica

> Captura durante FASE 2.

(A completar mientras se ejecuta el sprint.)

---

## FASE 2 LOG — Cambios aplicados

### Commit 1 — Sprint doc + componentes shadcn nuevos (Checkbox/Input/Label/Alert)

- **Created** este sprint doc.
- **Created** 4 componentes shadcn copiados manualmente.
- **Updated** `pnpm-lock.yaml` con nuevas deps Radix.
- **Updated** `docs/vault/index.md` + `docs/vault/MASTER-PLAN.md`.

### Commit 2 — Estado + helpers (lib/persist + hooks)

- **Created** `lib/persist.ts` — wrappers sessionStorage type-safe.
- **Created** `lib/calc-edad.ts` — cálculo edad desde DOB.
- **Created** `hooks/useConsent.ts` — read/write cookie `somno_consent_v1`.
- **Created** `hooks/usePersistEval.ts` — read/write sessionStorage `somno_eval_v1`.

### Commit 3 — Componentes compliance + pantallas P0

- **Created** `components/compliance/DisclaimerBanner.tsx`.
- **Created** `app/disclaimer/page.tsx`.
- **Created** `app/terms/page.tsx` con Server Action que setea cookie.
- **Created** `app/eval/menor-no-permitido/page.tsx`.

### Commit 4 — Capa 1 middleware + Capa 2 layout + Capa 3 profile

- **Created** `middleware.ts` (Capa 1).
- **Created** `app/eval/layout.tsx` (Capa 2).
- **Created** `app/eval/profile/page.tsx` (Capa 3).

### Commit 5 — Welcome actualizada + cierre sprint

- **Updated** `app/page.tsx` — habilitar botón "Empezar evaluación" → `/disclaimer`. Eliminar smoke test card del clinical-engine.
- **Updated** este sprint doc → status `closed-verified`.
- **Updated** `docs/vault/MASTER-PLAN.md` + `index.md`.

---

## FASE 3 EVIDENCIAS — Triangulación post-cierre

A capturar al cerrar.

### E1 — Lectura del código en `main`

- `find packages/webapp-somnosalud/app -type f -name "*.tsx"` muestra 7+ archivos nuevos.
- `find packages/webapp-somnosalud/components/compliance -type f` muestra DisclaimerBanner.
- `cat packages/webapp-somnosalud/middleware.ts` confirma Capa 1.

### E2 — CI verde + smoke local

- `pnpm install/lint/typecheck/test/build` → 5-6/N successful.
- `pnpm dev` arranca, navegar manualmente:
  - `/` → click "Empezar evaluación" → redirige a `/disclaimer`.
  - `/disclaimer` → leer + click "Continuar" → `/terms`.
  - `/terms` → checkbox NO marcado → botón disabled. Marcar → habilitado → click → cookie set → redirect a `/eval/profile`.
  - `/eval/profile` → DOB que da edad <18 → redirige `/eval/menor-no-permitido`.
  - `/eval/profile` → DOB que da edad ≥18 → permanece + datos persisten en sessionStorage.
  - Refresh `/eval/profile` con datos previos → datos cargados desde sessionStorage.
  - Navegar directo `/eval/profile` sin cookie consent → redirige a `/terms?redirect=/eval/profile`.

### E3 — Compliance gates auditables

- `grep -rn "compliance gate" packages/webapp-somnosalud/` muestra comments en cada gate.
- DisclaimerBanner visible en `/eval/profile`, `/eval/menor-no-permitido`.
- Cookie `somno_consent_v1` con SameSite=Strict + httpOnly=false (sí, debe ser legible client-side para hooks) + 1 año TTL.

---

## FASE 4 CHECKLIST — Sprint Closure

A completar al cierre.

### Bloque A — Sprint doc
- [x] Frontmatter `status: in-progress`.
- [x] FASE 0 + FASE 1.
- [ ] FASE 2 LOG con 5 commits.
- [ ] FASE 3 EVIDENCIAS.
- [ ] FASE 4 CHECKLIST.

### Bloque B — DEBTs padres
- [x] N/A — sprint sin DEBTs padres.

### Bloque C — Sub-DEBTs
- [ ] Probable: `DEBT-cookie-consent-jwt-migration` para Sprint 11+ migración a JWT Supabase. Crear al cierre.

### Bloque D — Lesson learned
- [ ] Considerar al cierre.

### Bloque E — Session note
- [ ] N/A si <3h.

### Bloque F — CLAUDE.md raíz
- [ ] N/A si no cambia stack ni roadmap.

### Bloque G — DEBT-RADAR
- [ ] N/A.

### Bloque H — MASTER-PLAN
- [ ] Sprint 6 → closed-verified.

### Bloque I — Wikilinks bidireccionales
- [ ] Verificar al cierre.

### Bloque K — Filesystem housekeeping
- [x] N/A — `main` directo.

### Bloque J — Reporte ejecutivo
- [ ] Pegado al cierre.

---

*Última actualización: 2026-05-08 — sprint en ejecución.*
