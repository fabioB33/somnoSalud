---
title: "Stack Inventory — 2026-05-08 (post-Sprint 5)"
date: 2026-05-08
last_synced_with_vault_reality: 2026-05-08
tags: [reference, stack, inventory, snapshot, somnosalud]
status: snapshot
related:
  - "[[../architecture/adr/ADR-001-stack-frontend-webapp-somnosalud]]"
  - "[[../architecture/adr/ADR-002-workspace-dependency-clinical-engine]]"
  - "[[../sprints/sprint-5-scaffold-webapp-somnosalud/SPRINT-5-SCAFFOLD-WEBAPP-SOMNOSALUD]]"
  - "[[../sprints/sprint-5-5-documentacion-vault/SPRINT-5-5-DOCUMENTACION-VAULT]]"
  - "[[../../../CLAUDE]]"
captured_by: cowork
captured_at: 2026-05-08
---

# Stack Inventory — 2026-05-08 (post-Sprint 5)

> Snapshot **frozen-in-time** del stack real instalado al 2026-05-08 después del Sprint 5 (Scaffold webapp-somnosalud). Capturado vía `pnpm-lock.yaml` empírico, NO desde docs aspiracionales.
>
> Este documento NO se edita después de la fecha de captura. Para futuros snapshots, crear archivo nuevo (`STACK-INVENTORY-YYYY-MM-DD.md`) con `previous_snapshot:` apuntando a este.

## Runtime / herramientas base

| Herramienta | Versión instalada | Notas |
|---|---|---|
| Node.js | **v22.22.1** | Heredada del entorno Fabio (nvm) |
| pnpm | **9.0.0** | Activado vía corepack (`corepack prepare pnpm@9.0.0 --activate`). Update available a 11.0.8 — postergado, 9.x sigue OK. |
| TypeScript (root) | **5.9.3** | Resolvió desde `^5.4.0` declarado |
| turbo | **2.9.10** | Monorepo task runner |
| prettier | **3.8.3** | Formatter (root config) |

## webapp-somnosalud — dependencies (post-Sprint 5)

### Runtime dependencies

| Package | Specifier | Resolved version | Notas |
|---|---|---|---|
| `@radix-ui/react-slot` | `^1.1.0` | **1.2.4** | Usado por shadcn `Button` con `asChild` prop |
| `class-variance-authority` | `^0.7.1` | **0.7.1** | shadcn variant API (`buttonVariants`) |
| `clsx` | `^2.1.1` | **2.1.1** | Combinación de classes condicionales |
| `lucide-react` | `^0.460.0` | **0.460.0** | Icon library de shadcn (Moon, Stethoscope, ShieldCheck, ArrowRight usados en welcome) |
| `next` | `^14.2.18` | **14.2.35** | Framework Next.js (App Router) |
| `react` | `^18.3.1` | **18.3.1** | UI library |
| `react-dom` | `^18.3.1` | **18.3.1** | |
| `somnosalud-clinical-engine` | `workspace:*` | **link:../clinical-engine** | Workspace dep (ver ADR-002) |
| `tailwind-merge` | `^2.5.4` | **2.6.1** | Merge inteligente de classes Tailwind para shadcn `cn()` |
| `tailwindcss-animate` | `^1.0.7` | **1.0.7** | Animations plugin para Tailwind (usado por shadcn) |

### Dev dependencies

| Package | Specifier | Resolved version | Notas |
|---|---|---|---|
| `@types/node` | `^20.0.0` | **20.19.39** | Para Node APIs en dev tooling |
| `@types/react` | `^18.3.12` | **18.3.28** | |
| `@types/react-dom` | `^18.3.1` | **18.3.7** | |
| `autoprefixer` | `^10.4.20` | **10.5.0** | PostCSS plugin |
| `eslint` | `^8.57.1` | **8.57.1** | ESLint 8 (no 9) — eslint-config-next requiere 8.x |
| `eslint-config-next` | `^14.2.18` | **14.2.35** | Match con next |
| `postcss` | `^8.5.0` | **8.5.14** | |
| `tailwindcss` | `^3.4.15` | **3.4.19** | Tailwind 3 (no 4 — ver ADR-001) |
| `typescript` | `^5.4.0` | **5.9.3** | TS estricto |

## clinical-engine — dependencies (sin cambios desde bootstrap)

| Package | Specifier | Resolved version |
|---|---|---|
| `esbuild` (devDep) | `^0.27.3` | **0.27.7** |
| `typescript` (devDep) | `^5.4.0` | **5.9.3** |
| `vitest` (devDep, declarado pero no en lockfile root) | `^2.0.0` | **2.1.9** (resolved transitive) |

## Otros packages — sin deps propias todavía

`packages/psg-parser/`, `packages/shared-ui/`, `packages/webapp-conversor-psg/` son skeleton con scripts noop (creados Sprint 1, commit `7196efd`). Cuando se implementen (Fase 2 / Sprint 6+), capturar nuevo inventory.

## Peer dependency warnings observadas en `pnpm install`

```
WARN  6 deprecated subdependencies found:
  @humanwhocodes/config-array@0.13.0   ← transitive de eslint 8.57
  @humanwhocodes/object-schema@2.0.3   ← transitive de eslint 8.57
  glob@10.3.10                         ← transitive
  glob@7.2.3                           ← transitive
  inflight@1.0.6                       ← transitive
  rimraf@3.0.2                         ← transitive
```

**Análisis:** todos los warnings vienen de **eslint 8.57** (deprecated en favor de eslint 9 + flat config). No hay solución inmediata — `eslint-config-next@14.2.35` aún no soporta eslint 9. Cuando subamos a Next 15+, eslint-config-next-15 soporta eslint 9 y los warnings desaparecen.

**Bloqueante:** no.
**Riesgo:** bajo (subdependencias internas, no ejecutables propias).
**Acción:** monitorear release notes de `eslint-config-next` cada release de Next.

## Bundle metrics post-Sprint 5

Capturado vía `pnpm --filter @somnosalud/webapp-somnosalud build`:

```
Route (app)                     Size      First Load JS
┌ ○ /                           138 B     87.4 kB
└ ○ /_not-found                 872 B     88.1 kB

+ First Load JS shared by all   87.2 kB
  ├ chunks/5b8f0dd8-*.js        53.6 kB
  ├ chunks/749-*.js             31.7 kB
  └ other shared chunks         1.86 kB
```

**Análisis:**
- **First Load JS welcome page: 87.4 kB.** Razonable. Target Sprint 12: <150 kB.
- **`/` y `/_not-found` ambos prerendered como static.** Build-time evaluation OK.
- Bundle base (87.2 kB shared) = Next.js runtime + React + scoreISI inline.

## Comandos canónicos verificados empíricamente

```bash
# Install
pnpm install --frozen-lockfile          # 2.5s primera vez, 800ms con cache

# Dev server
pnpm --filter @somnosalud/webapp-somnosalud dev
  # → Ready in 2s, http://localhost:3000 (3001/3002 si están ocupados)

# Build
pnpm --filter @somnosalud/webapp-somnosalud build
  # → Compiled successfully, prerender static

# Lint (zero warnings allowed)
pnpm --filter @somnosalud/webapp-somnosalud lint

# Typecheck
pnpm --filter @somnosalud/webapp-somnosalud typecheck

# Cross-monorepo (turbo)
pnpm install/lint/typecheck/test/build
  # → 5-6/N tasks successful, clinical-engine 55/55 tests passing
```

## Próximas adiciones planeadas al stack

Siguiendo MASTER-PLAN [[../MASTER-PLAN]]:

| Sprint | Adición prevista | Por qué |
|---|---|---|
| 6 | shadcn components: `Form`, `Input`, `Label`, `Checkbox`, `Select`, `Dialog` | Compliance gates (consent + edad) |
| 7 | shadcn components: `RadioGroup`, `Slider`, `Progress` | Cuestionarios ISI/PHQ-9/etc. |
| 7+ | `@hookform/resolvers` + `react-hook-form` + `zod` | Validación de forms (decisión pendiente, posible alternativa: native HTML5) |
| 9-10 | `@supabase/supabase-js` + `@supabase/ssr` | Auth + persistencia (post-Sprint 2.B) |
| 12 | `@sentry/nextjs` | Error tracking |
| 12 | `resend` | Email transaccional |
| 13 | `@playwright/test` | E2E testing |

## Próximas evaluaciones sugeridas

- **2026-08-08 (3 meses post)**: re-evaluar Tailwind 4 (¿shadcn ya soporta?).
- **2026-08-08**: re-evaluar Next.js 15 (¿LTS estable?).
- **2026-11-08 (6 meses post)**: re-evaluar todo el stack para deprecation/CVE check.
- **Cualquier release de Next.js**: verificar release notes de `eslint-config-next` por si los warnings deprecated desaparecen.

## Cómo regenerar este inventory

```bash
# Versiones runtime
node -v
pnpm -v

# Specifiers + resolved versions de un package
awk '/packages\/<package>:/,/^[a-z]/ { print }' pnpm-lock.yaml

# Bundle metrics
pnpm --filter @somnosalud/webapp-somnosalud build  # output al final muestra Route + Size

# Pipeline cross-monorepo
pnpm install --frozen-lockfile && pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

---

*Capturado: 2026-05-08 — snapshot frozen, NO editar después de esta fecha. Para futuros: nuevo archivo con `previous_snapshot: STACK-INVENTORY-2026-05-08`.*
