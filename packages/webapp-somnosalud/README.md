# `@somnosalud/webapp-somnosalud`

Frontend Next.js 14 (App Router) + Tailwind + shadcn/ui — webapp principal de SomnoSalud para evaluación de trastornos del sueño en 12 pasos.

> **Status (2026-05-08, post-Sprint 5):** scaffold completo + welcome page + workspace dep al `clinical-engine` validado. Pantallas de evaluación (12 pasos) a implementar Sprints 6-8.

## Stack

Para detalle de decisiones técnicas + alternativas + cómo revertir, ver:
- [[../../docs/vault/architecture/adr/ADR-001-stack-frontend-webapp-somnosalud]] — Stack frontend (Next 14 + App Router + Tailwind 3 + shadcn/ui + RSC default).
- [[../../docs/vault/architecture/adr/ADR-002-workspace-dependency-clinical-engine]] — Cómo importamos `somnosalud-clinical-engine`.
- [[../../docs/vault/architecture/adr/ADR-003-compliance-gates-en-codigo]] — Patrón de 6 capas para enforzar compliance ANMAT/Ley 25.326+26.529.

Resumen:
- **Next.js 14.2** App Router (no Pages Router).
- **TypeScript 5.x estricto** (extends `tsconfig.base.json` del root).
- **Tailwind CSS 3.4** (no Tailwind 4 hasta que shadcn lo soporte).
- **shadcn/ui** scaffold manual (no CLI), componentes en `components/ui/`.
- **React Server Components default**, `'use client'` solo donde haya estado interactivo.
- **`somnosalud-clinical-engine`** consumido como `workspace:*` + `transpilePackages`.

Versiones específicas: ver [[../../docs/vault/reference/STACK-INVENTORY-2026-05-08]].

## Quick start

```bash
# Desde el root del repo
pnpm install --frozen-lockfile

# Dev server (Ready in 2s)
pnpm --filter @somnosalud/webapp-somnosalud dev
# → http://localhost:3000 (3001/3002 si están ocupados)

# Build de producción
pnpm --filter @somnosalud/webapp-somnosalud build

# Lint (zero warnings allowed pre-merge)
pnpm --filter @somnosalud/webapp-somnosalud lint

# Typecheck
pnpm --filter @somnosalud/webapp-somnosalud typecheck

# Servidor de prod local
pnpm --filter @somnosalud/webapp-somnosalud start
```

## Estructura de carpetas

```
packages/webapp-somnosalud/
├── app/                          ← Next.js App Router pages + layouts
│   ├── layout.tsx                ← Root layout (Inter font + metadata + Capa 0 robots noindex)
│   ├── page.tsx                  ← Welcome (/) con smoke test scoreISI
│   └── globals.css               ← Tailwind base + shadcn HSL tokens + bg-somno-gradient
├── components/
│   └── ui/                       ← shadcn/ui (Button, Card)
│                                   Más componentes se agregan en Sprint 6+.
├── lib/
│   └── utils.ts                  ← cn() helper (clsx + tailwind-merge)
├── components.json               ← shadcn config (style: default, baseColor: neutral)
├── next.config.mjs               ← transpilePackages clinical-engine + reactStrictMode
├── tailwind.config.ts            ← Paleta SomnoSalud (#1a1a2e → #16213e + accent #818cf8)
├── tsconfig.json                 ← Extends ../../tsconfig.base.json + paths @/*
├── postcss.config.mjs            ← Tailwind + autoprefixer
├── .eslintrc.json                ← extends next/core-web-vitals
├── next-env.d.ts                 ← (auto-generado por Next, no editar)
└── package.json
```

A medida que se implementen pantallas de evaluación, la estructura crecerá según [[../../docs/vault/concepts/CONVENCIONES-FRONTEND-WEBAPP]] §3.

## Comandos canónicos

Ver [[../../docs/vault/reference/STACK-INVENTORY-2026-05-08#Comandos canónicos verificados empíricamente]] para versiones extendidas.

```bash
# Cross-monorepo CI (lo mismo que corre GitHub Actions)
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Cómo agregar pantalla nueva

Ver [[../../docs/vault/concepts/CONVENCIONES-FRONTEND-WEBAPP#7. Cómo agregar pantalla nueva (paso a paso)]] (8 pasos).

Resumen:
1. Crear `app/<ruta>/page.tsx` como Server Component default.
2. Si requiere estado interactivo: extraer a componente client co-located.
3. Importar del `somnosalud-clinical-engine` lo que se necesite.
4. Verificar compliance gates aplicables (capas 1-5 según [[../../docs/vault/architecture/adr/ADR-003-compliance-gates-en-codigo]]).
5. `pnpm lint && typecheck` antes de mergear.

## Cómo agregar componente shadcn

Ver [[../../docs/vault/concepts/CONVENCIONES-FRONTEND-WEBAPP#8. Componentes shadcn nuevos — cómo agregar]].

**Decisión arquitectural ADR-001:** scaffold **manual**, NO `npx shadcn-ui add` (rompe el workspace pnpm).

1. Ir a [ui.shadcn.com/docs/components](https://ui.shadcn.com/docs/components).
2. Copiar el código del componente al archivo `components/ui/<componente>.tsx`.
3. Si requiere deps nuevas: `pnpm --filter @somnosalud/webapp-somnosalud add <dep>`.

## Compliance — qué está implementado y qué falta

Estado al 2026-05-08 (Sprint 5 cerrado):

- ✅ **Capa 0**: `robots: noindex/nofollow` en `app/layout.tsx`.
- ✅ **M.N. Pablo Ferrero 119.783** visible en pill de welcome + footer.
- ✅ **Disclaimer informativo** en card de welcome ("Esta evaluación es orientativa...").
- 🔴 **Capa 1 (middleware)**: Sprint 6.
- 🔴 **Capa 2 (DisclaimerBanner en /eval/layout.tsx)**: Sprint 6.
- 🔴 **Capa 3 (verificación edad <18)**: Sprint 6.
- 🔴 **Capa 4 (safety rules SAFE-010..040)**: Sprint 7.
- 🔴 **Capa 5 (results disclaimer + M.N. + recurso emergencia PHQ-9 ítem 9)**: Sprint 8.
- 🔴 **Persistencia consent en DB**: Sprint 11+ (post-Supabase Sprint 2.B).

Para checklist Pre-launch público completo: [[../../docs/vault/clinical/COMPLIANCE-ARGENTINA#Checklist Pre-launch público]].

## Convenciones operativas

Antes de escribir código nuevo en este package, leer:
- [[../../docs/vault/concepts/CONVENCIONES-FRONTEND-WEBAPP]] (10 secciones: RSC, naming, paths, accesibilidad, performance, etc.).
- [[../../docs/vault/processes/QA-CHECKLIST]] §B (placeholder webapp Fase 1).
- [[../../CLAUDE]] sección "Skills obligatorias" (qué agents invocar antes de qué tarea).

## Licencia

Proprietary — SomnoSalud Team. Director clínico: Dr. Pablo Ferrero (M.N. 119.783).

---

*Última actualización: 2026-05-08 — post-Sprint 5 scaffold completo.*
