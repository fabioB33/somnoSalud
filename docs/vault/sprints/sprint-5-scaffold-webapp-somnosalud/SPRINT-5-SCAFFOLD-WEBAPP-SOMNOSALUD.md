---
title: "Sprint 5 — Scaffold webapp-somnosalud (Next.js 14 + Tailwind + shadcn/ui + welcome)"
date: 2026-05-08
last_synced_with_vault_reality: 2026-05-08
tags: [sprint, sprint-5, scaffold, nextjs, tailwind, shadcn, webapp, fase-1, somnosalud]
status: in-progress
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

> Captura durante FASE 2.

(A completar mientras se ejecuta el sprint.)

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

## FASE 3 EVIDENCIAS — Triangulación post-cierre

A capturar al cerrar:

E1 — Lectura del código en `main`:
- `find packages/webapp-somnosalud -type f -not -path "*/node_modules/*"` muestra estructura Next.js completa.
- `cat packages/webapp-somnosalud/package.json` muestra deps reales + scripts no-noop.
- `grep "scoreISI" packages/webapp-somnosalud/app/page.tsx` confirma uso del clinical-engine.

E2 — CI local verde:
- `pnpm install --frozen-lockfile` → exit 0.
- `pnpm lint` → 5/5 successful (incluyendo el nuevo `@somnosalud/webapp-somnosalud:lint`).
- `pnpm typecheck` → 5/5 successful.
- `pnpm test` → 5/5 successful (clinical-engine 55/55 + skeletons noop).
- `pnpm build` → 5/5 successful (incluyendo Next.js build real).
- `pnpm --filter @somnosalud/webapp-somnosalud dev` arranca server en :3000 con compilación exitosa.

E3 — Vault consistente:
- Sprint doc cerrado con `status: closed-verified`.
- MASTER-PLAN actualizado.
- Backlinks bidireccionales OK.

---

## FASE 4 CHECKLIST — Sprint Closure

A completar al cierre. Por ahora dejo lista la estructura.

### Bloque A — Sprint doc
- [x] Frontmatter `status: in-progress` (transicionará a `closed-verified` al cierre).
- [x] FASE 0 skills cargadas.
- [x] FASE 1 hipótesis declaradas.
- [ ] FASE 2 LOG con hashes reales.
- [ ] FASE 3 EVIDENCIAS triangulada.
- [ ] FASE 4 CHECKLIST.

### Bloque B — DEBTs padres
- [x] N/A — sprint sin DEBTs padres (es sprint nuevo de feature, no fix).

### Bloque C — Sub-DEBTs
- [ ] Si surgen durante el sprint, crear archivos siguiendo TEMPLATE-DEBT.

### Bloque D — Lesson learned
- [ ] Crear si durante el sprint se falsifica una hipótesis crítica o se detecta patrón sistémico.

### Bloque E — Session note
- [ ] N/A si <3h.

### Bloque F — CLAUDE.md raíz
- [ ] Actualizar si el scaffold introduce decisiones que cambian roadmap o stack.

### Bloque G — DEBT-RADAR
- [ ] N/A — solo 1 DEBT activo (vitest-coverage-output, low).

### Bloque H — MASTER-PLAN
- [ ] Sprint 5 → closed-verified + Sprint 6 redefinido.

### Bloque I — Wikilinks bidireccionales
- [ ] Verificar al cierre.

### Bloque K — Filesystem housekeeping
- [ ] N/A — trabajo en `main`, sin worktree.

### Bloque J — Reporte ejecutivo en chat
- [ ] Pegado al cierre.

---

*Última actualización: 2026-05-08 — sprint en ejecución.*
