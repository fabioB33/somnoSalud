---
title: "ADR-002 — Workspace dependency strategy para somnosalud-clinical-engine"
date: 2026-05-08
last_synced_with_vault_reality: 2026-05-08
tags: [adr, architecture, monorepo, pnpm, turbo, workspace, clinical-engine, somnosalud, accepted]
status: accepted
related:
  - "[[../../sprints/sprint-5-scaffold-webapp-somnosalud/SPRINT-5-SCAFFOLD-WEBAPP-SOMNOSALUD]]"
  - "[[../../sprints/sprint-5-5-documentacion-vault/SPRINT-5-5-DOCUMENTACION-VAULT]]"
  - "[[ADR-001-stack-frontend-webapp-somnosalud]]"
  - "[[../../../../CLAUDE]]"
deciders: [fabio, claude-cowork]
created: 2026-05-08
---

# ADR-002 — Workspace dependency strategy para somnosalud-clinical-engine

## Status

**accepted** (2026-05-08, Sprint 5)

## Contexto

`packages/webapp-somnosalud/` necesita consumir `packages/clinical-engine/` (32 funciones públicas: scoring, safety, recommendations, lab, genetics, references). Hay 3 estrategias posibles para conectar packages en un monorepo pnpm + turbo + Next.js:

1. **Workspace dep `workspace:*`** + transpile.
2. **Workspace dep `workspace:*`** + consumir el `dist/` pre-compilado.
3. **Publicar `clinical-engine` como package npm privado** y consumir vía registry.

Esta ADR documenta la decisión de Sprint 5 (opción 1) y establece el **patrón** que seguirán futuros packages cuando los necesiten (`psg-parser`, `shared-ui`).

## Decisión

`webapp-somnosalud` consume `somnosalud-clinical-engine` como **workspace dependency con transpile en build-time**:

```json
// packages/webapp-somnosalud/package.json
{
  "dependencies": {
    "somnosalud-clinical-engine": "workspace:*"
  }
}
```

```javascript
// packages/webapp-somnosalud/next.config.mjs
const nextConfig = {
  transpilePackages: ['somnosalud-clinical-engine'],
};
```

```typescript
// packages/webapp-somnosalud/app/page.tsx
import { scoreISI } from 'somnosalud-clinical-engine';
```

**Importante:** el package se llama `somnosalud-clinical-engine` (sin scope `@somnosalud/`), por consistencia con el `package.json` original del Sprint 1. Los otros packages (psg-parser, shared-ui, webapp-*) sí usan scope `@somnosalud/`. Hay drift de naming que se resolverá en sprint dedicado a homogeneizar (ver "Drift conocido" abajo).

## Alternativas consideradas

### Alternativa 1 — Workspace dep + transpile (ELEGIDA)

- **Pros:**
  - Hot-reload funcional: cambio en `clinical-engine/src/` se ve inmediato en `webapp-somnosalud` durante `pnpm dev`.
  - Sourcemaps unificados: stack traces apuntan al `.ts` original, no al `dist/.js` compilado.
  - 1 comando install: `pnpm install` resuelve todo.
  - turbo cache funciona transparentemente.
- **Contras:**
  - Requiere `transpilePackages` en `next.config.mjs` (1 línea).
  - Build de `webapp-somnosalud` re-transpila `clinical-engine` (costo: ~1 sec adicional).

### Alternativa 2 — Workspace dep sin transpile (consume dist/)

- **Pros:**
  - Build más rápido (no re-transpila).
  - Más cercano a "uso real como librería externa".
- **Contras:**
  - Requiere `pnpm --filter somnosalud-clinical-engine build` antes de cada build de la webapp. Disciplina extra que se puede olvidar.
  - Sourcemaps rotos (o ausentes) cuando hay error en clinical-engine.
  - Hot-reload roto en dev: cambio en `.ts` no se ve hasta re-build.
- **Por qué no:** el costo de los 2 contras supera el ahorro de 1 segundo de build.

### Alternativa 3 — Publicar como npm package privado

- **Pros:**
  - Versionado real (`1.2.3`).
  - Reutilizable desde proyectos fuera del monorepo.
  - Force decoupling estricto.
- **Contras:**
  - Requiere registry privado (npm Pro / GitHub Packages).
  - Cada cambio en `clinical-engine` = bump version + publish + bump consumers + reinstall.
  - Hot-reload imposible.
  - Costo de mantenimiento para 0 valor real (clinical-engine NO se va a consumir desde fuera del monorepo en horizonte 1-2 años).
- **Por qué no:** premature optimization. El valor de "publicar como package" se justifica solo cuando hay >3 consumers externos. Hoy hay 0.

## Consecuencias

### Positivas

- **DX excelente:** Cowork edita `clinical-engine/src/scoring/isi.ts`, refresh navegador, ve cambio. Sin steps intermedios.
- **Sourcemaps reales:** error en `scoreISI` apunta a `clinical-engine/src/scoring/isi.ts:42`, no al bundle compilado.
- **Build determinístico:** `pnpm build` cross-monorepo invoca turbo, que detecta dependencias y construye en orden correcto. Verificado en Sprint 5: Tasks 5/5 successful.
- **Type safety end-to-end:** TypeScript de la webapp ve los tipos de `clinical-engine` directamente desde `src/index.ts`, no desde `dist/index.d.ts`.

### Negativas

- **`transpilePackages` es Next.js-specific:** si en futuro se cambia a Vite (poco probable para webapp principal, posible para webapp-conversor-psg), hay que adaptar. Vite usa `optimizeDeps.include` con sintaxis distinta.
- **Drift de naming:** `somnosalud-clinical-engine` (sin scope) vs `@somnosalud/webapp-*` (con scope). Cosmético pero confuso. Ver sub-sección "Drift conocido".
- **Acoplamiento monorepo:** mientras `clinical-engine` esté como `workspace:*`, no se puede mover el código a otro repo sin trabajo. Aceptable hoy.

### Neutras

- **Bundle size:** Next.js tree-shake correctamente lo que importas. Si `webapp-somnosalud` solo usa `scoreISI`, el bundle final NO incluye `scorePHQ9` ni el resto. Verificado empíricamente Sprint 5: First Load JS 87.4 kB.

## Drift conocido — naming inconsistente

`packages/clinical-engine/package.json` declara `"name": "somnosalud-clinical-engine"` (sin scope). El resto de packages declarados en Sprint 1 usan scope `@somnosalud/*`:

- ✅ `@somnosalud/psg-parser`
- ✅ `@somnosalud/shared-ui`
- ✅ `@somnosalud/webapp-somnosalud`
- ✅ `@somnosalud/webapp-conversor-psg`
- ❌ `somnosalud-clinical-engine` (sin scope)

**Razón histórica:** el `clinical-engine/package.json` viene del bootstrap del 2026-05-07 (commit `69e9c24`) cuando aún no se había decidido el scope `@somnosalud/`. Los otros 4 se crearon en Sprint 1 (commit `7196efd`) cuando el scope ya era convención.

**Por qué no se arregla en este ADR:** cambiar el `name` de un package en monorepo requiere:
1. Update `package.json` del package.
2. Update `package.json` de todos los consumers.
3. Update `tsconfig.json` paths si hay.
4. Update `transpilePackages` en `next.config.mjs`.
5. Update lockfile (`pnpm install` regenera).
6. Update todos los `import` en código.
7. Update referencias en docs.

Es un sprint chico (~30 min) pero merece sub-DEBT explícito para no olvidarlo. **Acción:** crear sub-DEBT al cierre de Sprint 5.5 — `DEBT-clinical-engine-naming-scope`.

## Patrón a seguir para futuros packages

Cuando `psg-parser` (Fase 2 Sprint 14+) o `shared-ui` (Fase 1 Sprint 6-8) necesiten ser consumidos por `webapp-somnosalud` o `webapp-conversor-psg`:

```json
// consumer package.json
{
  "dependencies": {
    "@somnosalud/psg-parser": "workspace:*",
    "@somnosalud/shared-ui": "workspace:*"
  }
}
```

```javascript
// next.config.mjs (si el consumer es Next.js webapp)
const nextConfig = {
  transpilePackages: [
    'somnosalud-clinical-engine',  // legacy naming, ver Drift conocido
    '@somnosalud/psg-parser',
    '@somnosalud/shared-ui',
  ],
};
```

```typescript
import { parsePhilipsSleepwareG3 } from '@somnosalud/psg-parser';
import { Button } from '@somnosalud/shared-ui';
```

**Para `webapp-conversor-psg` (Vite):** reemplazar `transpilePackages` por:

```typescript
// vite.config.ts
export default defineConfig({
  optimizeDeps: {
    include: ['@somnosalud/psg-parser', 'somnosalud-clinical-engine'],
  },
});
```

## Cómo revertir / cambiar

### Si se decide separar `clinical-engine` a repo propio:

1. Crear repo nuevo (`itsomnosalud/clinical-engine` o similar).
2. Copiar `packages/clinical-engine/` al repo nuevo manteniendo historia git con `git filter-repo` o `git subtree split`.
3. Setear CI propio (lint + test + build + publish).
4. Publicar como package npm privado.
5. En `webapp-somnosalud/package.json`, cambiar `"workspace:*"` por `"^1.0.0"`.
6. Quitar `transpilePackages: ['somnosalud-clinical-engine']` de `next.config.mjs`.
7. Crear ADR nueva con `supersedes: ADR-002`.

### Si se decide consumir `dist/` en lugar de transpile:

1. Asegurar que `dev` script de `clinical-engine` incluye `tsc --watch`.
2. Quitar `transpilePackages` de `next.config.mjs`.
3. Verificar empíricamente: editar `clinical-engine/src/`, ver si hot-reload funciona en webapp dev.
4. Si funciona: actualizar este ADR con `superseded: <fecha>` o crear nueva.
5. Si no funciona: revertir.

## Referencias

- [Next.js Docs — transpilePackages](https://nextjs.org/docs/app/api-reference/next-config-js/transpilePackages)
- [pnpm Docs — workspace protocol](https://pnpm.io/workspaces#workspace-protocol-workspace)
- [Turborepo Docs — workspaces](https://turbo.build/repo/docs/handbook/workspaces)
- [Sprint 5 H2 — verificación empírica](../../sprints/sprint-5-scaffold-webapp-somnosalud/SPRINT-5-SCAFFOLD-WEBAPP-SOMNOSALUD.md) del workspace dep funcionando.
- [next.config.mjs del repo](../../../../packages/webapp-somnosalud/next.config.mjs)
- [package.json webapp-somnosalud](../../../../packages/webapp-somnosalud/package.json)
- [package.json clinical-engine](../../../../packages/clinical-engine/package.json) — tiene el naming sin scope.

---

*Última actualización: 2026-05-08 — accepted en Sprint 5.5. Drift de naming pendiente sub-DEBT.*
