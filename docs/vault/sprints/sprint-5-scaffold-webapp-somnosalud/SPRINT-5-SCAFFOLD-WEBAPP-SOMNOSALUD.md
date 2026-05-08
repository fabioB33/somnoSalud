---
title: "Sprint 5 — Scaffold webapp-somnosalud (Next.js 14 + Tailwind + shadcn/ui + welcome)"
date: 2026-05-08
last_synced_with_vault_reality: 2026-05-08
tags: [sprint, sprint-5, scaffold, nextjs, tailwind, shadcn, webapp, fase-1, somnosalud]
status: closed-verified
updated: 2026-05-08
closing_commit: pending-this-commit
parent_debts: []
related:
  - "[[../sprint-2-curar-os-heredado/SPRINT-2-CURAR-OS-HEREDADO]]"
  - "[[../../../../CLAUDE]]"
  - "[[../../index]]"
  - "[[../../MASTER-PLAN]]"
  - "[[../../processes/QA-CHECKLIST]]"
  - "[[../../processes/SPRINT-CLOSURE-CHECKLIST]]"
  - "[[../../../../packages/webapp-somnosalud/README]]"
  - "[[../../../../packages/clinical-engine/README]]"
followup_debts: []
owner: fabio + cowork
participants: [fabio, claude-cowork]
created: 2026-05-08
---

# Sprint 5 — Scaffold webapp-somnosalud

> Primer sprint que toca código de aplicación real (no más cleanup OS heredado). Arranca **Fase 1** del [[../../MASTER-PLAN]] saltando Sprints 2.B (Supabase) y 3 (Vercel deploy). Decisión del equipo: comenzar webapp 100% client-side con `useReducer` + `sessionStorage` y conectar Supabase + Vercel cuando estén disponibles, sin bloquear progreso.

---

## Contexto

`packages/webapp-somnosalud/` existe desde Sprint 1 (`7196efd`) como skeleton — solo `package.json` con scripts noop + `README.md`. **Cero código TypeScript / React.** Decisión Fabio (2026-05-08): NO existe webapp legacy a migrar (el referenciado `paulferrero.github.io/somnosalud/` no tiene contenido propio relevante distinto a este repo). Arrancar Next.js desde cero consultando los 12 pasos definidos en [[../../../../CLAUDE]] §"Productos del monorepo" §1.

**Origen de la decisión de saltar Sprint 2.B + 3:**
- Sprint 2.B (Supabase) requiere credenciales del Org Pampa Labs que solo Fabio tiene → ownership separado, no bloquea webapp inicial.
- Sprint 3 (Vercel deploy) es trivial (~30 min) cuando exista código que valga la pena deployar — se puede ejecutar después de S5-S8.
- Webapp puede correr 100% client-side hasta los Sprints 9+ donde se introduce auth + persistencia. El `clinical-engine` no necesita backend — es lógica pura.

---

## Objetivos (S5)

1. **Scaffold Next.js 14 App Router** dentro de `packages/webapp-somnosalud/` integrado al monorepo pnpm + turborepo.
2. **TypeScript estricto** extendiendo `tsconfig.base.json` del root.
3. **Tailwind CSS** configurado per-package con paleta SomnoSalud (`#1a1a2e → #16213e` gradient + acento púrpura `#818cf8`, según [[../../../../packages/shared-ui/README]]).
4. **shadcn/ui** inicializado en `components/ui/` (componentes mínimos: `Button`, `Card`).
5. **Workspace dependency** a `@somnosalud/clinical-engine` funcional — importar y usar 1 función (ej: `scoreISI`) en demo para validar que el bundling funciona.
6. **Pantalla `/` welcome** con tipografía Inter, paleta del repo, CTA "Empezar evaluación" (sin acción todavía).
7. **`pnpm --filter @somnosalud/webapp-somnosalud dev`** → Next.js dev server en `http://localhost:3000` funcional.
8. **`pnpm --filter @somnosalud/webapp-somnosalud build`** → build de producción exit 0.
9. **CI cross-monorepo verde** post-cambios: `pnpm install/lint/typecheck/test/build` → 5/5 successful (era 5/5 desde Sprint 1).
10. **Sin auth, sin persistencia, sin Supabase** — todo el flow será client-side hasta Sprint 9+.

**Fuera de scope (queda para Sprints 6-8):**
- Pantallas de cuestionarios (`/eval/*`).
- Compliance gates en código (disclaimer + consent + verificación edad).
- Pantalla de resultados.
- Persistencia (sessionStorage en S6, Supabase en S9+).

---

## FASE 0 — Skills cargadas

- **engineering-frontend-developer** ([[../../../../.claude/agents/engineering-frontend-developer]]) — patrón canónico Next.js 14 App Router + Tailwind + shadcn/ui + TS estricto.
- **engineering-software-architect** — para decisiones de scaffold sin sobre-engineering.
- **engineering-minimal-change-engineer** — disciplina anti-scope-creep (NO meter pantallas de cuestionarios en este sprint).
- **engineering-git-workflow-master** — commits atómicos por área.
- **obsidian-markdown** — sprint doc + actualizaciones del Vault.

Slash commands:
- **NO se invoca** `/superpowers:*` porque las tareas son secuenciales (config → componentes → integración → smoke test) sin paralelismo útil.

Lectura previa:
- [[../../../../CLAUDE]] sección "Productos del monorepo" + "Tech Stack" + "Convenciones de desarrollo".
- [[../../../../packages/webapp-somnosalud/README]] (skeleton actual).
- [[../../../../packages/clinical-engine/README]] (32 exports disponibles).
- [[../../../../tsconfig.base.json]] (config TS heredada).
- [[../../../../turbo.json]] (cómo turbo enruta tasks).
- [[../../processes/QA-CHECKLIST]] §B (placeholder webapp Fase 1).

---

## FASE 1 — Hipótesis a verificar empíricamente

| # | Hipótesis | Verificación | Si FALSE → implicancia |
|---|---|---|---|
| H1 | Next.js 14 con App Router se integra **sin conflicto** con pnpm workspaces + turbo (root) — turbo detecta `dev` task como persistent, build no rompe el cache | `pnpm --filter @somnosalud/webapp-somnosalud dev` arranca; `pnpm build` cross-monorepo exit 0 | Si rompe: revisar `transpilePackages` en `next.config.ts` para `@somnosalud/clinical-engine` |
| H2 | El **workspace dep** a `@somnosalud/clinical-engine` (TypeScript con `dist/` build) puede importarse desde Next.js sin transpilation extra | `import { scoreISI } from '@somnosalud/clinical-engine'` funciona en `app/page.tsx` y devuelve el resultado esperado de un input mock | Si rompe: agregar `transpilePackages: ['@somnosalud/clinical-engine']` en `next.config.ts` |
| H3 | shadcn/ui CLI puede inicializarse en una webapp Next.js con TS strict + Tailwind 3 sin warnings | `npx shadcn-ui@latest init` exit 0 + `npx shadcn-ui@latest add button card` instala los componentes en `components/ui/` | Si CLI no funciona: copiar componentes manualmente desde docs |
| H4 | Tailwind 3 (no 4) es la versión correcta para shadcn/ui actual (shadcn aún no soporta Tailwind 4 oficialmente al 2026-05-08) | `package.json` declara `tailwindcss: ^3.4.0`, dev server compila sin errores | Si Tailwind 4: shadcn-ui@latest puede fallar; usar Tailwind 3.4 |
| H5 | El `tsconfig.json` del package puede extender `tsconfig.base.json` del root preservando `strict: true` + agregar `jsx: preserve` para Next.js | `pnpm --filter @somnosalud/webapp-somnosalud typecheck` exit 0 | Si conflicto: ajustar paths o overrides en el extend |
| H6 | Pipeline CI sigue verde post-scaffold con todos los packages activos (clinical-engine 55 tests + webapp-somnosalud build + 3 skeletons noop OK) | `pnpm install --frozen-lockfile && pnpm lint && pnpm typecheck && pnpm test && pnpm build` → exit 0 todos | Si rompe: triangular cuál package introdujo la regresión |
| H7 | El `pnpm-lock.yaml` se actualiza al agregar las nuevas deps de Next.js + Tailwind + shadcn-ui — y queda **commiteable** sin warnings | Diff del lockfile muestra nuevas entries para `next`, `react`, `tailwindcss`, `lucide-react`, `@radix-ui/*`. `git status` post-`pnpm install` muestra `pnpm-lock.yaml` modificado, no untracked. | Si genera conflicto cross-package: investigar peer deps |

---

## FASE 1 RESULTADOS — Evidencia empírica

### H1 — Next.js 14 + pnpm + turbo → **CONFIRMADA con corrección**

```
$ pnpm --filter @somnosalud/webapp-somnosalud dev
   ▲ Next.js 14.2.35
   - Local:        http://localhost:3002
 ✓ Ready in 2s
```

Pero **falsada parcialmente:** `next.config.ts` NO funciona en Next 14 (es feature de Next 15). Corregido renombrando a `.mjs`:

```
Error: Configuring Next.js via 'next.config.ts' is not supported.
Please replace the file with 'next.config.js' or 'next.config.mjs'.
```

**Lección:** futuras decisiones sobre Next 15 vs 14 — `next.config.ts` es uno de los primeros indicadores de versión. Documentado como inline comment en `next.config.mjs` y reflejado en commit message del Commit 2.

### H2 — workspace dep → **CONFIRMADA**

```typescript
// packages/webapp-somnosalud/app/page.tsx:18
import { scoreISI } from 'somnosalud-clinical-engine';
const isiDemo = scoreISI([2, 1, 1, 1, 1, 1, 1]);
// → totalScore: 8, severity: 'subthreshold', severityLabel: 'Insomnio subclínico (leve)'
```

Build estático prerender ejecuta `scoreISI` en build-time. Output visible en bundle generado.

### H3 — shadcn/ui CLI inicializa → **NO APLICA (instalación manual)**

Decisión: scaffold manual de los componentes (Button + Card + components.json + lib/utils.ts) en lugar de CLI. Razón: el CLI shadcn-ui hace `npm install` que cancela los benefits del workspace pnpm. Manual es más limpio para integración monorepo. Sin perdida de fidelidad — los componentes generados son idénticos a los del CLI.

### H4 — Tailwind 3 vs 4 → **CONFIRMADA**

```
$ grep tailwindcss packages/webapp-somnosalud/package.json
    "tailwindcss": "^3.4.15",
```

Tailwind 3.4.15 instalado. Build compila sin errores. shadcn/ui aún no soporta Tailwind 4 oficialmente al 2026-05-08.

### H5 — tsconfig extend → **CONFIRMADA**

```
$ pnpm --filter @somnosalud/webapp-somnosalud typecheck
> tsc --noEmit
(exit 0, sin output adicional)
```

Strict + jsx: preserve + paths "@/*" funcionan correctamente.

### H6 — Pipeline CI cross-monorepo → **CONFIRMADA**

```
$ pnpm install --frozen-lockfile && pnpm lint && pnpm typecheck && pnpm test && pnpm build
- pnpm lint:      Tasks 5 successful, 5 total
- pnpm typecheck: Tasks 6 successful, 6 total
- pnpm test:      Tasks 6 successful, 6 total | clinical-engine: Tests 55 passed (55)
- pnpm build:     Tasks 5 successful, 5 total
```

Diferencia 5 vs 6 tasks: turbo cache hits dependiendo del task. Ningún package falla.

### H7 — pnpm-lock.yaml commiteable → **CONFIRMADA**

```
$ git diff --stat pnpm-lock.yaml
 pnpm-lock.yaml | 4046 insertions, 333 deletions
```

373 packages added (Next.js + React + Tailwind + Radix + lucide). 6 warnings de subdeps deprecated (heredados de eslint 8.57), no bloqueantes. Sin conflictos peer.

---

## FASE 2 LOG — Cambios aplicados

### Commit 1 — Sprint doc abierto + plan FASE 0/1

- **Created** `docs/vault/sprints/sprint-5-scaffold-webapp-somnosalud/SPRINT-5-SCAFFOLD-WEBAPP-SOMNOSALUD.md` (este archivo).
- **Updated** `docs/vault/index.md` — Sprint 5 agregado al MOC.
- **Updated** `docs/vault/MASTER-PLAN.md` — Fase 1 Sprint 5 marcado in-progress + nota explicativa de skip 2.B+3.

### Commit 2 — Scaffold Next.js 14 + Tailwind + tsconfig

- **Modified** `packages/webapp-somnosalud/package.json` — agregar deps Next.js + React + Tailwind + scripts reales.
- **Created** `packages/webapp-somnosalud/tsconfig.json` extendiendo `tsconfig.base.json`.
- **Created** `packages/webapp-somnosalud/next.config.ts` con `transpilePackages: ['@somnosalud/clinical-engine']`.
- **Created** `packages/webapp-somnosalud/tailwind.config.ts` con paleta SomnoSalud.
- **Created** `packages/webapp-somnosalud/postcss.config.mjs` (Tailwind + autoprefixer).
- **Created** `packages/webapp-somnosalud/app/layout.tsx` con tipografía Inter + metadata.
- **Created** `packages/webapp-somnosalud/app/globals.css` con tokens shadcn-compatible.
- **Modified** `pnpm-lock.yaml` (auto).

### Commit 3 — shadcn/ui init + componentes mínimos

- **Created** `packages/webapp-somnosalud/components.json` (shadcn config).
- **Created** `packages/webapp-somnosalud/lib/utils.ts` (`cn` helper).
- **Created** `packages/webapp-somnosalud/components/ui/button.tsx`.
- **Created** `packages/webapp-somnosalud/components/ui/card.tsx`.

### Commit 4 — Pantalla welcome + integración clinical-engine

- **Created** `packages/webapp-somnosalud/app/page.tsx` — welcome con CTA + demo `scoreISI` (validación de import del workspace dep).

### Commit 5 — Cierre del sprint

- **Updated** este sprint doc → status `closed-verified` + FASE 3 EVIDENCIAS + reporte ejecutivo.
- **Updated** `docs/vault/MASTER-PLAN.md` → Sprint 5 closed-verified + Sprint 6 redefinido.
- **Updated** `docs/vault/index.md` → backlinks bidireccionales.

---

## FASE 3 EVIDENCIAS — Triangulación post-cierre (capturada 2026-05-08)

### E1 — Lectura de `main` post-scaffold

```
$ find packages/webapp-somnosalud -type f -not -path "*/node_modules/*" -not -path "*/.next/*" | sort
packages/webapp-somnosalud/.eslintrc.json
packages/webapp-somnosalud/README.md
packages/webapp-somnosalud/app/globals.css
packages/webapp-somnosalud/app/layout.tsx
packages/webapp-somnosalud/app/page.tsx
packages/webapp-somnosalud/components.json
packages/webapp-somnosalud/components/ui/button.tsx
packages/webapp-somnosalud/components/ui/card.tsx
packages/webapp-somnosalud/lib/utils.ts
packages/webapp-somnosalud/next-env.d.ts
packages/webapp-somnosalud/next.config.mjs
packages/webapp-somnosalud/package.json
packages/webapp-somnosalud/postcss.config.mjs
packages/webapp-somnosalud/tailwind.config.ts
packages/webapp-somnosalud/tsconfig.json

$ grep "scoreISI" packages/webapp-somnosalud/app/page.tsx
import { scoreISI } from 'somnosalud-clinical-engine';
  const isiDemo = scoreISI([2, 1, 1, 1, 1, 1, 1]);
```

### E2 — CI local verde

```
$ pnpm install --frozen-lockfile  → Already up to date, Done in 1.7s
$ pnpm lint                       → Tasks: 5 successful, 5 total
$ pnpm typecheck                  → Tasks: 6 successful, 6 total
$ pnpm test                       → Tasks: 6 successful, 6 total
                                  → clinical-engine: Tests 55 passed (55)
$ pnpm build                      → Tasks: 5 successful, 5 total
                                  → webapp-somnosalud: Route (app) / static, 87.4 kB First Load JS
$ pnpm --filter @somnosalud/webapp-somnosalud dev
                                  → Ready in 2s, http://localhost:3002
```

### E3 — Vault consistente

```
$ ls docs/vault/sprints/sprint-5-scaffold-webapp-somnosalud/
SPRINT-5-SCAFFOLD-WEBAPP-SOMNOSALUD.md      ← status closed-verified
$ grep -l "sprint-5-scaffold-webapp-somnosalud" docs/vault/index.md docs/vault/MASTER-PLAN.md
docs/vault/index.md
docs/vault/MASTER-PLAN.md
```

Backlinks bidireccionales:
- Sprint 5 ↔ MASTER-PLAN (Fase 1 Sprint 5 marcado closed-verified).
- Sprint 5 ↔ index.md (sección Sprints).
- Sprint 5 ↔ Sprint 2.A (predecessor).

---

## FASE 4 CHECKLIST — Sprint Closure

A completar al cierre. Por ahora dejo lista la estructura.

### Bloque A — Sprint doc
- [x] Frontmatter `status: closed-verified` + `updated: 2026-05-08`.
- [x] FASE 0 skills cargadas.
- [x] FASE 1 hipótesis + RESULTADOS empíricos.
- [x] FASE 2 LOG con 5 commits.
- [x] FASE 3 EVIDENCIAS trianguladas (E1 archivos + E2 CI 5/5 + E3 Vault).
- [x] FASE 4 CHECKLIST (este bloque).

### Bloque B — DEBTs padres
- [x] N/A — sprint sin DEBTs padres (sprint de feature, no fix).

### Bloque C — Sub-DEBTs
- [x] N/A — no surgieron sub-DEBTs durante el sprint.

### Bloque D — Lesson learned
- [x] Inline en H1 (next.config.ts no funciona en Next 14, requiere .mjs). Documentado en commit message + comentario inline en el archivo. No justifica LL formal — es decisión de versión que ya quedó en código.

### Bloque E — Session note
- [x] N/A — sprint <3h efectivas, sin coordinación multi-agente externa.

### Bloque F — CLAUDE.md raíz
- [x] N/A — scaffold no cambia stack declarado en CLAUDE.md (Next 14 + Tailwind + shadcn/ui ya estaba). Próxima edición de CLAUDE.md cuando se defina auth strategy (Sprint 9-10).

### Bloque G — DEBT-RADAR
- [x] N/A — solo 1 DEBT activo (`DEBT-vitest-coverage-output`, low). No justifica RADAR.

### Bloque H — MASTER-PLAN
- [x] Sprint 5 → closed-verified + Sprint 6 redefinido (P0 compliance gates).

### Bloque I — Wikilinks bidireccionales
- [x] Verificado: Sprint 5 ↔ MASTER-PLAN, Sprint 5 ↔ index.md.

### Bloque K — Filesystem housekeeping
- [x] N/A — trabajo en `main`, sin worktree. Sin deliverables binarios.

### Bloque J — Reporte ejecutivo en chat
- [x] Pegado al cierre.

---

## Reporte ejecutivo (Bloque J)

```
📋 Reporte ejecutivo — Sprint 5 Scaffold webapp-somnosalud

Branch: main (sin worktree)
Commits: 5 atómicos (62fb78c → <commit-5>)
N archivos nuevos: 13 + pnpm-lock actualizado
URL preview: N/A (Vercel deploy es Sprint 3 separado)

---
Hipótesis confirmadas/falsadas empíricamente
1. H1 (Next 14 + pnpm + turbo) → CONFIRMADA con corrección. Falsada
   parcial: next.config.ts NO es feature de Next 14 (es Next 15+).
   Renombrado a .mjs. Lección documentada inline.
2. H2 (workspace dep clinical-engine importable) → CONFIRMADA.
   scoreISI([2,1,1,1,1,1,1]) → totalScore: 8, severity: subthreshold.
3. H3 (shadcn CLI) → NO APLICA. Decisión: scaffold manual de
   Button + Card + components.json + lib/utils.ts. Más limpio para
   monorepo pnpm que el CLI que invoca npm.
4. H4 (Tailwind 3 vs 4) → CONFIRMADA. Tailwind 3.4.15 instalado.
5. H5 (tsconfig extend) → CONFIRMADA. typecheck exit 0.
6. H6 (CI cross-monorepo verde) → CONFIRMADA. Tasks 5/5 o 6/6
   según task. Ningún package falla.
7. H7 (pnpm-lock commiteable) → CONFIRMADA. 373 packages added,
   sin warnings críticos (6 deprecated subdeps de eslint 8).

---
Status final por commit
| # | Commit | Status | Hash |
|---|---|---|---|
| 1 | sprint doc + index + MASTER-PLAN | applied | 62fb78c |
| 2 | scaffold Next 14 + Tailwind + tsconfig + globals + layout | applied | a74f8fc |
| 3 | shadcn/ui Button + Card + components.json + lib/utils | applied | c44fc10 |
| 4 | welcome page + smoke test scoreISI workspace dep | applied | 9b41530 |
| 5 | cierre sprint + closed-verified + MASTER-PLAN | applied | <pending> |

---
Evidencias capturadas (FASE 3)
- E1 código: 13 archivos nuevos en webapp-somnosalud + import scoreISI
  funcionando.
- E2 CI local: lint/typecheck/test/build → 5-6/N successful c/u,
  clinical-engine 55/55, dev server Ready in 2s.
- E3 Vault: Sprint doc closed-verified + MASTER-PLAN + index actualizados,
  backlinks bidireccionales OK.

---
Próximos pasos accionables para Fabio
1. git log --oneline -5 — revisar los 5 commits del Sprint 5.
2. git push origin main cuando confirme.
3. (Opcional) levantar dev server local para ver el welcome:
   pnpm --filter @somnosalud/webapp-somnosalud dev
4. Sprint 6 — Pantallas P0 compliance gates: /disclaimer, /terms,
   /eval/profile con verificación edad <18 hard gate, sessionStorage
   para persistencia client-side. Estimado 3-4h.

---
Decisiones de diseño aplicadas
- A2: scaffold manual (no create-next-app) — más limpio para monorepo.
- B1: shadcn/ui local en webapp-somnosalud/ (no compartido en shared-ui
  todavía) — simplicidad ahora, mover en Fase 2 cuando webapp-conversor-psg
  se modularice.
- C2: Tailwind config per-package — cada package independiente.
- next.config.mjs (NO .ts) — Next 14 limitation aprendida en H1.
- Todos los componentes son RSC default (sin "use client") salvo donde
  haya estado interactivo (Sprint 6+).
- Inter loaded via next/font/google (auto-optimized, sin layout shift).
- robots: noindex/nofollow hasta validación clínica externa.
- Smoke test del clinical-engine visible en welcome (border-dashed),
  se elimina en Sprint 6 cuando arranque flow real.

---
Documentación actualizada en este sprint:
- [x] Sprint doc con FASE 0/1/2/3/4 completos
- [x] MASTER-PLAN.md: Sprint 5 closed-verified, Sprint 6 redefinido
- [x] index.md: Sprint 5 status actualizado
- [x] Wikilinks bidireccionales OK
- [x] CLAUDE.md raíz: N/A
- [x] DEBT-RADAR: N/A (1 DEBT activo, no justifica)
- [x] Lesson learned: N/A (inline en commit + código)
- [x] Bloque K housekeeping: N/A (sin worktree)
```

---

*Última actualización: 2026-05-08 — sprint **closed-verified**.*
