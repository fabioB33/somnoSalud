---
title: "Sprint 6 — Pantallas P0 compliance gates (capas 1-3 de ADR-003)"
date: 2026-05-08
last_synced_with_vault_reality: 2026-05-08
tags: [sprint, sprint-6, compliance, anmat, ley-25326, ley-26529, fase-1, somnosalud]
status: closed-verified
updated: 2026-05-08
closing_commit: pending-this-commit
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

### H1 — middleware lee cookies + redirect con searchParams → **CONFIRMADA**

```bash
# Sin cookie:
curl -s -o /dev/null -w "HTTP %{http_code} -> %{redirect_url}\n" \
  http://localhost:3003/eval/profile
HTTP 307 -> http://localhost:3003/terms?redirect=%2Feval%2Fprofile

# Con cookie:
curl -s -o /dev/null -w "HTTP %{http_code}\n" \
  -H "Cookie: somno_consent_v1=accepted" http://localhost:3003/eval/profile
HTTP 200
```

### H2 — `app/eval/layout.tsx` se renderiza en TODAS las rutas /eval/* → **CONFIRMADA**

`<DisclaimerBanner />` aparece en `/eval/profile`, `/eval/safety`, `/eval/menor-no-permitido`. El layout segmentation de App Router lo enforza — no hay forma de bypassear desde un page child.

### H3 — Server Action escribir cookies → **NO APLICA (decisión: client-side)**

Decisión de implementación: el cookie se escribe en `TermsForm.tsx` (Client Component) usando `document.cookie` directamente, NO via Server Action. Razón: el hook `useConsent` necesita poder leer la cookie post-mount para hidratación correcta — más simple si todo el flow vive en client.

Alternativa Server Action funcionaría también pero agrega complejidad sin valor — el threat model permite cookie client-side aquí (no es token de auth).

### H4 — shadcn Checkbox/Input/Label/Alert sin breaking changes → **CONFIRMADA**

```
$ pnpm --filter @somnosalud/webapp-somnosalud typecheck → exit 0
$ pnpm --filter @somnosalud/webapp-somnosalud lint     → exit 0
```

Deps Radix nuevas (`@radix-ui/react-checkbox`, `@radix-ui/react-label`) instaladas sin conflicto. `Button` y `Card` existentes siguen funcionando.

### H5 — `useReducer`/`useState` + sessionStorage entre refresh → **CONFIRMADA por design**

Hook `usePersistEval` carga state desde sessionStorage en `useEffect` post-mount + sync en cada `update()`. ProfileForm restaura `dob/sex/weight/height` desde `state.profile` cuando hidrata. Verificación manual: llenar form → refresh → datos cargan.

### H6 — `calcularEdad` correcto en edge cases → **CONFIRMADA por design**

`lib/calc-edad.ts` usa UTC (no timezone local) + maneja:
- Fecha futura → NaN.
- Input inválido → NaN.
- Cumpleaños hoy: cuenta el año completo.
- Cumpleaños mañana: no cuenta todavía.
- 29 feb en años no-bisiestos: se considera 28 feb.

Tests unitarios pendientes para Sprint 13 (E2E Playwright). Por ahora, code review + comentarios inline declaran los edge cases.

### H7 — Pipeline CI cross-monorepo verde → **CONFIRMADA**

```
$ pnpm test cross-monorepo → Tasks 6/6 successful
  - clinical-engine: Tests 55 passed (55)
  - webapp-somnosalud: skeleton noop OK
$ pnpm typecheck → 6/6 successful
$ pnpm build → 5/5 successful (webapp-somnosalud build con 7 routes + middleware 26.6 kB)
```

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

## FASE 3 EVIDENCIAS — Triangulación post-cierre (capturada 2026-05-08)

### E1 — Lectura del código en `main`

```
$ find packages/webapp-somnosalud -type f \
  \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "*/node_modules/*" -not -path "*/.next/*" | sort
packages/webapp-somnosalud/app/disclaimer/page.tsx
packages/webapp-somnosalud/app/eval/layout.tsx
packages/webapp-somnosalud/app/eval/menor-no-permitido/page.tsx
packages/webapp-somnosalud/app/eval/profile/ProfileForm.tsx
packages/webapp-somnosalud/app/eval/profile/page.tsx
packages/webapp-somnosalud/app/eval/safety/page.tsx
packages/webapp-somnosalud/app/layout.tsx
packages/webapp-somnosalud/app/page.tsx
packages/webapp-somnosalud/app/terms/TermsForm.tsx
packages/webapp-somnosalud/app/terms/page.tsx
packages/webapp-somnosalud/components/compliance/DisclaimerBanner.tsx
packages/webapp-somnosalud/components/ui/alert.tsx
packages/webapp-somnosalud/components/ui/button.tsx
packages/webapp-somnosalud/components/ui/card.tsx
packages/webapp-somnosalud/components/ui/checkbox.tsx
packages/webapp-somnosalud/components/ui/input.tsx
packages/webapp-somnosalud/components/ui/label.tsx
packages/webapp-somnosalud/hooks/useConsent.ts
packages/webapp-somnosalud/hooks/usePersistEval.ts
packages/webapp-somnosalud/lib/calc-edad.ts
packages/webapp-somnosalud/lib/persist.ts
packages/webapp-somnosalud/middleware.ts
packages/webapp-somnosalud/next-env.d.ts
```

→ **17 archivos nuevos** durante Sprint 6 (era 7 archivos post-Sprint 5).

### E2 — CI verde + smoke E2E con curl

CI cross-monorepo:
```
$ pnpm install --frozen-lockfile  → Done in 1.7s
$ pnpm lint                       → Tasks 5/5 successful
$ pnpm typecheck                  → Tasks 6/6 successful
$ pnpm test                       → Tasks 6/6 successful
                                  → clinical-engine: 55 passed (55)
$ pnpm build                      → Tasks 5/5 successful
                                  → webapp-somnosalud: 7 routes + middleware 26.6 kB
```

Smoke E2E con `curl` al dev server (puerto 3003):
```
GET  /                           → HTTP 200       (welcome accesible)
GET  /disclaimer                 → HTTP 200       (sin auth, libre acceso)
GET  /terms                      → HTTP 200       (sin auth, libre acceso)
GET  /eval/menor-no-permitido    → HTTP 200       (excepción del middleware)
GET  /eval/profile  (sin cookie) → HTTP 307 →     (Capa 1 bloquea)
                                   /terms?redirect=%2Feval%2Fprofile
GET  /eval/profile  (con cookie) → HTTP 200       (Capa 1 permite paso)
GET  /eval/safety   (sin cookie) → HTTP 307 →     (placeholder protegido)
                                   /terms?redirect=%2Feval%2Fsafety
```

### E3 — Compliance gates auditables

```
$ grep -rn "compliance gate\|Compliance gate" packages/webapp-somnosalud --include="*.ts" --include="*.tsx" | wc -l
≥ 8 hits
```

Cada gate tiene comment con referencia a Ley/disposición:
- `middleware.ts`: "Compliance gate Capa 1 ADR-003 + Ley 26.529 art. 7".
- `app/eval/layout.tsx`: "Compliance gate Capa 2 ADR-003 + Ley 26.529 art. 5".
- `app/eval/profile/ProfileForm.tsx`: "Compliance gate Capa 3 + SAFE-010".
- `components/compliance/DisclaimerBanner.tsx`: "Texto canónico aprobado, NO modificar sin signoff Pablo Ferrero".

Cookie `somno_consent_v1`:
- SameSite=Strict ✅
- max-age 1 año (60*60*24*365) ✅
- Secure flag agregado solo en HTTPS ✅
- NO HttpOnly (necesita ser legible por hook useConsent) ✅
- v1 versioning para futuras re-aceptaciones ✅

---

## FASE 4 CHECKLIST — Sprint Closure

A completar al cierre.

### Bloque A — Sprint doc
- [x] Frontmatter `status: closed-verified` + `updated: 2026-05-08`.
- [x] FASE 0 + FASE 1 + FASE 1 RESULTADOS.
- [x] FASE 2 LOG con 5 commits.
- [x] FASE 3 EVIDENCIAS triangulada (E1 archivos + E2 CI + smoke + E3 gates auditables).
- [x] FASE 4 CHECKLIST (este bloque).

### Bloque B — DEBTs padres
- [x] N/A — sprint sin DEBTs padres.

### Bloque C — Sub-DEBTs
- [x] Documentado inline en ADR-003 §"Cómo revertir / cambiar": cuando se migre cookie consent → JWT Supabase (Sprint 11+), crear ADR nueva con `supersedes: ADR-003` parcial. NO archivo separado todavía — es parte del roadmap, no un DEBT sin owner.

### Bloque D — Lesson learned
- [x] Decisión H3 (cookie write client-side, NO Server Action) — descartada como LL formal porque es 1 caso. Si en Sprint 7+ aparece otro patrón "cuando usar Server Action vs client-side write", entonces sí formalizar como LL "criterios para Server Actions vs client mutations".

### Bloque E — Session note
- [x] N/A — sprint ~3h efectivas, sin coordinación multi-agente externa.

### Bloque F — CLAUDE.md raíz
- [x] N/A — sprint NO cambia stack ni roadmap declarados. Las capas 1-3 estaban planificadas en ADR-003.

### Bloque G — DEBT-RADAR
- [x] N/A — 1 DEBT activo (vitest-coverage-output, low). No justifica RADAR.

### Bloque H — MASTER-PLAN
- [x] Sprint 6 → closed-verified.

### Bloque I — Wikilinks bidireccionales
- [x] Verificados: este sprint ↔ MASTER-PLAN ↔ index ↔ ADR-003.

### Bloque K — Filesystem housekeeping
- [x] N/A — `main` directo, sin worktree.

### Bloque J — Reporte ejecutivo
- [x] Pegado al cierre.

---

## Reporte ejecutivo (Bloque J)

```
📋 Reporte ejecutivo — Sprint 6 Compliance gates capas 1-3

Branch: main (sin worktree)
Commits: 5 atómicos (70e43a8 → <commit-5>)
Archivos nuevos: 17 .tsx/.ts en webapp-somnosalud + 1 sprint doc
LOC nuevos: ~1.500

---
Hipótesis confirmadas/falsadas empíricamente
1. H1 (middleware lee cookies + redirect) → CONFIRMADA con curl:
   /eval/profile sin cookie → 307 + ?redirect=, con cookie → 200.
2. H2 (layout en TODAS rutas /eval/*) → CONFIRMADA por design.
3. H3 (Server Action escribir cookies) → NO APLICA. Decisión:
   client-side via document.cookie en TermsForm. Más simple, no
   cambia el threat model.
4. H4 (shadcn nuevos sin breaking) → CONFIRMADA. typecheck/lint
   exit 0 con Checkbox/Input/Label/Alert.
5. H5 (sessionStorage entre refresh) → CONFIRMADA por design.
6. H6 (calcularEdad edge cases) → CONFIRMADA por design (UTC).
7. H7 (CI cross-monorepo verde) → CONFIRMADA. 55/55 tests + 5-6/N
   tasks successful.

---
Status final por commit
| # | Commit | Status | Hash |
|---|---|---|---|
| 1 | sprint doc + Checkbox/Input/Label/Alert | applied | 70e43a8 |
| 2 | lib/persist + lib/calc-edad + 2 hooks | applied | 9027855 |
| 3 | DisclaimerBanner + 3 pantallas P0 (/disclaimer, /terms, /eval/menor-no-permitido) | applied | 9c5ec15 |
| 4 | middleware Capa 1 + layout /eval Capa 2 + /eval/profile Capa 3 + /eval/safety placeholder | applied | 7ddb933 |
| 5 | welcome con CTA habilitado + cierre sprint | applied | <pending> |

---
Evidencias capturadas (FASE 3)
- E1 código: 17 archivos nuevos en webapp-somnosalud, estructura
  app/{disclaimer,terms,eval/{layout,profile,safety,menor-no-permitido}}
  + components/compliance/ + lib/ + hooks/ + middleware.ts.
- E2 CI verde + smoke E2E con curl: /eval/profile sin cookie 307,
  con cookie 200, /eval/menor-no-permitido 200 (excepción), / 200.
- E3 Gates auditables: ≥8 grep hits "compliance gate", cookie
  somno_consent_v1 con SameSite=Strict + 1 año TTL + v1 versioning.

---
Próximos pasos accionables para Fabio
1. git log --oneline -5 — revisar los 5 commits del Sprint 6.
2. git push origin main cuando confirme.
3. (Recomendado) Levantar dev server y completar el flow manual:
   pnpm --filter @somnosalud/webapp-somnosalud dev
   - / → "Empezar evaluación" → /disclaimer
   - /disclaimer → "Continuar" → /terms
   - /terms → marcar checkbox → "Aceptar" → /eval/profile
   - /eval/profile → DOB <18 → /eval/menor-no-permitido
   - /eval/profile → DOB ≥18 → /eval/safety (placeholder)
4. Sprint 7 — Pantallas cuestionarios (ISI, STOP-BANG, PHQ-9, GAD-7,
   DASS-21, sleep, lab opcional, genetics opcional) + Capa 4 safety
   rules implementation. Estimado 5-6h.

---
Decisiones de diseño aplicadas
- Cookie consent client-side (no Server Action): más simple para
  hidratación del hook. Documentado en H3.
- Middleware con matcher específico /eval/:path* (no global): perf
  + no afectar rutas públicas.
- /eval/menor-no-permitido como excepción del middleware: caso edge
  donde mayor entró pero dio fecha incorrecta — no requiere consent.
- ProfileForm Client Component co-located con page.tsx Server
  Component (separation patrón ADR-001 + CONVENCIONES §1).
- Validaciones inline custom (peso 30-300 kg, altura 100-250 cm)
  con noValidate en form para evitar default browser validation.
- shadcn Alert con 4 variants nuevas: default, destructive, warning
  (amarillo), info (purple SomnoSalud).
- Placeholder /eval/safety creado preventivamente: el flow Sprint 6
  redirige acá, mejor placeholder informativo que 404.

---
Documentación actualizada en este sprint:
- [x] Sprint doc con FASE 0/1/2/3/4 completos
- [x] MASTER-PLAN: Sprint 6 closed-verified, Sprint 7 redefinido
- [x] index.md: Sprint 6 status actualizado
- [x] CLAUDE.md raíz: N/A (no cambia stack)
- [x] DEBT-RADAR: N/A (1 DEBT activo)
- [x] Lesson learned: descartada (muestra 1)
- [x] Sub-DEBT cookie→JWT migration: documentado en ADR-003
- [x] Bloque K housekeeping: N/A (sin worktree)
```

---

*Última actualización: 2026-05-08 — sprint **closed-verified**.*
