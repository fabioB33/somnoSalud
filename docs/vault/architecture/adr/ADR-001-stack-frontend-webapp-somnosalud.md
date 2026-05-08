---
title: "ADR-001 — Stack frontend webapp-somnosalud (Next.js 14 + App Router + Tailwind 3 + shadcn/ui + RSC default)"
date: 2026-05-08
last_synced_with_vault_reality: 2026-05-08
tags: [adr, architecture, frontend, nextjs, tailwind, shadcn, somnosalud, accepted]
status: accepted
related:
  - "[[../../sprints/sprint-5-scaffold-webapp-somnosalud/SPRINT-5-SCAFFOLD-WEBAPP-SOMNOSALUD]]"
  - "[[../../sprints/sprint-5-5-documentacion-vault/SPRINT-5-5-DOCUMENTACION-VAULT]]"
  - "[[ADR-002-workspace-dependency-clinical-engine]]"
  - "[[ADR-003-compliance-gates-en-codigo]]"
  - "[[../../../../CLAUDE]]"
deciders: [fabio, claude-cowork]
created: 2026-05-08
---

# ADR-001 — Stack frontend webapp-somnosalud

## Status

**accepted** (2026-05-08, Sprint 5)

## Contexto

`packages/webapp-somnosalud/` arrancaba como skeleton vacío post-Sprint 1. Sprint 5 implementó el scaffold completo Next.js + framework de UI + estilos. Las **decisiones técnicas** que se tomaron afectan a todo el desarrollo Frontend de Fase 1 (Sprints 5-13) y Fase 3 (Sprints 20-34) — merecen ADR formal en lugar de vivir solo en commit messages.

CLAUDE.md raíz declara stack genérico ("Next.js 14 (App Router) + Tailwind + shadcn/ui"). Esta ADR captura las **decisiones específicas dentro de ese stack** y por qué se eligieron.

## Decisión

Stack frontend de `webapp-somnosalud`:

1. **Next.js 14** (no Next.js 15).
2. **App Router** (no Pages Router).
3. **TypeScript 5.x estricto** extendiendo `tsconfig.base.json` del root.
4. **Tailwind CSS 3.4** (no Tailwind 4).
5. **shadcn/ui** scaffolded **manualmente** (no vía CLI), con componentes copiados a `components/ui/` local del package.
6. **React Server Components (RSC) por default**, `'use client'` solo donde haya estado interactivo o handlers de eventos.
7. **Path alias `@/*`** apuntando al root del package (`packages/webapp-somnosalud/`).
8. **`next.config.mjs`** (no `.ts`) por limitación de Next 14.

## Alternativas consideradas

### Decisión 1 — Next.js 15 vs 14

- **Next 15 pros:** soporta `next.config.ts`, Turbopack default en dev (más rápido), mejor caching de RSC.
- **Next 15 contras:** requiere Node 20.18+ (estamos en 22.22, OK), pero al **2026-05-08 no es estable** todavía — release candidate de mayo 2026 con bugs reportados en GitHub Issues. Stack maduro = Next 14.
- **Por qué no:** estabilidad > features modernas en proyecto regulatorio (ANMAT). Subir a Next 15 cuando sea LTS.

### Decisión 2 — App Router vs Pages Router

- **Pages Router pros:** más maduro (años en producción), más recursos en internet, simpler mental model para devs juniors.
- **Pages Router contras:** Server Components no son first-class, future-incompatible (Next 15+ deprecará features de Pages).
- **Por qué App Router:** roadmap del proyecto incluye Server Actions (Sprint 9+ con Supabase Auth), RSC para reducir bundle, layout segmentation. App Router es el camino.

### Decisión 3 — TypeScript estricto

- Solo opción real. Regla #6 del CLAUDE.md: zero `any`, zero `@ts-ignore` sin justificación. `tsconfig.base.json` ya define `strict: true`. Heredamos.

### Decisión 4 — Tailwind 3 vs 4

- **Tailwind 4 pros:** CSS-first config, performance mejorada, `@import` simplificado.
- **Tailwind 4 contras:** **shadcn/ui aún no soporta Tailwind 4 oficialmente al 2026-05-08**. Issues abiertos en su repo. Adoptar Tailwind 4 = perder shadcn.
- **Por qué Tailwind 3.4:** shadcn/ui es prioritario (ahorra ~40h de implementar Button + Card + Form + Dialog + Select + Checkbox + ... desde cero). Subir a Tailwind 4 cuando shadcn lo soporte.

### Decisión 5 — shadcn/ui manual vs CLI

- **CLI shadcn-ui pros:** `npx shadcn-ui@latest add button` es 1 comando.
- **CLI shadcn-ui contras:** invoca **`npm install`** internamente — cancela los benefits del workspace pnpm + turbo cache. También sobrescribe `package.json` sin merge inteligente.
- **Por qué manual:** el output del CLI son archivos públicos en sus docs. Copiarlos manualmente toma 5 min más pero preserva el control total del `package.json` y respeta el monorepo. Sin pérdida de fidelidad.
- **Cuándo reconsiderar:** si shadcn lanza CLI con flag `--no-install` o detecta workspaces, volver al CLI.

### Decisión 6 — RSC default vs `'use client'` everywhere

- **`'use client'` everywhere pros:** simpler mental model, no hay diferencia entre Server y Client.
- **`'use client'` everywhere contras:** bundle size mayor (todos los componentes shipean al client incluso si no necesitan), pierde benefits de Server Components (data fetching directo, secret env vars, streaming).
- **Por qué RSC default:** App Router pattern canónico. Welcome page + disclaimer + T&C + resultados (parcialmente) son perfectamente Server-renderable. Sólo cuestionarios interactivos (Sprint 7) requieren `'use client'`. Mantiene bundle mínimo.

### Decisión 7 — Path `@/*`

- Convención canónica Next.js (template oficial usa `@/*`).
- Evita rutas relativas frágiles (`../../components/ui/button`).
- Sin alternativa real.

### Decisión 8 — `next.config.mjs` vs `.ts`

- Quería usar `.ts` por consistencia con resto del proyecto, **pero Next 14 no lo soporta** (es feature de Next 15+):
  ```
  Error: Configuring Next.js via 'next.config.ts' is not supported.
  Please replace the file with 'next.config.js' or 'next.config.mjs'.
  ```
- Falsada empíricamente en H1 del Sprint 5. Renombrado a `.mjs`.
- **Cuándo cambiar:** al subir a Next 15+, renombrar a `.ts`.

## Consecuencias

### Positivas

- **Stack maduro:** Next 14 LTS, Tailwind 3.4, shadcn/ui battle-tested. Bajo riesgo en proyecto regulatorio.
- **RSC default:** bundle inicial 87.4 kB First Load JS (medido empíricamente Sprint 5). Bueno para mobile-first AR (target Sprint 12).
- **Workspace integrado:** `pnpm install --frozen-lockfile` sin sorpresas, turbo cache funciona, `pnpm dev` Ready in 2s.
- **Path `@/*`:** refactors fáciles, code reviews limpias.

### Negativas

- **Tailwind 3 vs 4 lock-in:** mientras shadcn/ui no soporte Tailwind 4, no podemos upgrade. Riesgo: que Tailwind 3 entre en maintenance-only mode antes que shadcn migre. Mitigación: monitorear roadmap shadcn cada 3 meses.
- **shadcn manual = cada componente nuevo requiere copiar manual:** ~5 min cada vez vs 30 seg con CLI. Sub-costo: mayor disciplina al no usar el CLI ni siquiera para componentes nuevos. Mitigación: cuando se necesiten >3 componentes nuevos en un sprint, considerar arrancar el CLI **fuera del workspace** y copiar el output (sin tocar el `package.json`).
- **`next.config.mjs` (no `.ts`):** archivo no tiene type-checking de TypeScript. Errores tipográficos en config se detectan en runtime, no en build. Mitigación: schema interno de `NextConfig` está documentado, mantenerlo simple.
- **Next 14 no recibe bugfixes nuevos:** una vez que Next 15 sea LTS, Next 14 entra en deprecation. Prevista migración Sprint 13-14 (post-Fase 1).

### Neutras

- **Bundle base 87.4 kB:** es el costo de Next.js + React + Tailwind runtime. No reducible sin cambiar de framework.
- **App Router learning curve:** hay 2-3 conceptos nuevos (RSC, Server Actions, layouts segmentation). Cowork ya los conoce. Si Fabio se incorpora, requiere onboarding ~2h.

## Cómo revertir / cambiar

### Si en el futuro se decide subir a Next 15:

1. `pnpm --filter @somnosalud/webapp-somnosalud add next@latest react@latest react-dom@latest`.
2. Renombrar `next.config.mjs` → `next.config.ts` (Next 15+ lo soporta).
3. Verificar que `transpilePackages` sigue funcionando (sintaxis no cambió).
4. Run `pnpm test/lint/typecheck/build` cross-monorepo. Si falla, revertir.
5. Crear ADR nueva con `supersedes: ADR-001`.

### Si se decide cambiar a Tailwind 4 (cuando shadcn lo soporte):

1. Esperar a que shadcn anuncie soporte oficial estable.
2. Actualizar `tailwind.config.ts` → `tailwind.config.css` (sintaxis nueva Tailwind 4).
3. Actualizar `globals.css` con nuevas directivas.
4. Revisar todos los componentes en `components/ui/` para arreglar incompatibilidades.
5. Crear ADR nueva con `supersedes: ADR-001` (parcial).

### Si se decide volver al CLI shadcn:

1. Verificar que shadcn lanzó `--no-install` o detecta pnpm workspaces.
2. Run `npx shadcn-ui@latest init` con flag apropiado.
3. Actualizar este ADR con `superseded: <fecha>` y crear ADR nueva.

## Referencias

- [Next.js 14 Docs - App Router](https://nextjs.org/docs/14/app)
- [shadcn/ui Docs](https://ui.shadcn.com/docs)
- [Tailwind CSS v3 → v4 migration guide](https://tailwindcss.com/docs/upgrade-guide)
- [Sprint 5 — donde se aplicaron estas decisiones](../../sprints/sprint-5-scaffold-webapp-somnosalud/SPRINT-5-SCAFFOLD-WEBAPP-SOMNOSALUD.md) — ver FASE 1 RESULTADOS H1-H5.
- [next.config.mjs del repo](../../../../packages/webapp-somnosalud/next.config.mjs)
- [tailwind.config.ts del repo](../../../../packages/webapp-somnosalud/tailwind.config.ts)
- [tsconfig.json del repo](../../../../packages/webapp-somnosalud/tsconfig.json)

---

*Última actualización: 2026-05-08 — accepted en Sprint 5.5.*
