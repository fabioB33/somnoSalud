---
title: "Sprint 15 — psg-parser bootstrap + Philips Sleepware G3 parser piloto"
date: 2026-05-14
sprint_number: 15
status: closed-verified
parent_debts:
  - "[[../../debt/DEBT-conversor-psg-migration-roadmap]]"
related:
  - "[[../../processes/SPRINT-CLOSURE-CHECKLIST]]"
tags: [sprint, psg-parser, philips, sleepware-g3, typescript, vitest, fase-2, bootstrap]
---

# Sprint 15 — psg-parser bootstrap + Philips Sleepware G3 parser piloto

> [!info] Objetivo
> Arrancar la migración del Conversor PSG legacy (1.887 LOC HTML monolítico) al package modular `packages/psg-parser/` con TypeScript estricto. Este sprint establece el patrón: bootstrap del package + 1 parser piloto (Philips Sleepware G3, el más complejo del legacy) + tests vitest con fixtures sintéticos. Sprints 16-19 completan los 6 parsers restantes + Engine Hipóxico + frontend Vite+React.

## Contexto

El Conversor PSG legacy vive en `packages/webapp-conversor-psg/legacy-v0/index.html`: 1.887 LOC con 7 parsers + Engine Hipóxico + dropzone UI + CSV/ZIP export, todo inline. Sigue funcionando standalone vía `python3 -m http.server`. El package `psg-parser/` está skeleton (solo package.json + README).

**Decisión de estrategia (acordada con Fabio 2026-05-14):** fraccionar la migración Fase 2 en 5 sprints chicos en vez de 1 grande de 25-35 h. Permite parar entre sprints y entregar valor incremental.

**Plan multi-sprint:**
- **Sprint 15 (este, ~3-5 h):** bootstrap psg-parser + parser piloto Philips Sleepware G3 + tests fixtures sintéticos.
- **Sprint 16 (~3-4 h):** BrainWave + Philips NightOne + ResMed Diagnóstico.
- **Sprint 17 (~3 h):** ResMed Tratamiento + BMC Tratamiento + BMC Poligrafo.
- **Sprint 18 (~5-7 h):** Engine Hipóxico modular + tests con DOI Azarbarzin 2019.
- **Sprint 19 (~5-8 h):** Frontend Vite + React reemplazando legacy-v0/index.html. Coexistencia temporal hasta paridad funcional.

**Decisiones técnicas de scope (este sprint):**
- Tests con **fixtures sintéticos** (no PSGs reales todavía — evita bloqueo esperando data de Pablo). DEBT abierto al final para reemplazar por reales en Sprint 18-19.
- Legacy `legacy-v0/index.html` **coexiste** con el nuevo build. Cero downtime, archive solo cuando paridad confirmada Sprint 19.

## Hipótesis

- **H1** — psg-parser package se builda verde con `tsc` (mismo patrón que clinical-engine: target ES2020 + strict + outDir dist/).
- **H2** — `parsePhilipsSleepwareG3()` migrada a TypeScript estricto sin `any` ni `@ts-ignore`. Regex idénticas al legacy → output idéntico.
- **H3** — Tests vitest passing con fixtures sintéticos que cubren: parser exitoso, missing fields, edge case decimal español (coma decimal), n/d handling, datos parciales.
- **H4** — Output shape `PSGRecord` mapea 1:1 con los campos que el legacy produce (verificable por inspección).
- **H5** — `pnpm install` no agrega deps pesadas — solo dev (vitest, esbuild, typescript) heredadas del workspace.

## FASE 1 — Implementación

### Bloque A — Bootstrap psg-parser

- `packages/psg-parser/package.json` — scripts reales (build/test/typecheck) + devDeps vitest + esbuild + typescript heredados del workspace.
- `packages/psg-parser/tsconfig.json` — copia del de clinical-engine.
- `packages/psg-parser/README.md` — actualizar con scope real Sprint 15+.

### Bloque B — Types + utils compartidos

- `src/types.ts` — `PSGRecord` interface (todos opcionales), `ParserResult<T>`, `FormatInfo`, `EquipmentFormat` discriminated union.
- `src/utils.ts` — helpers: `parseSpanishDate`, `parseHour`, `titleCase`, `num`, `normalizeWhitespace`.
- `src/index.ts` — barrel exports.

### Bloque C — Parser Philips Sleepware G3

- `src/parsers/philips-sleepware-g3.ts` — `parsePhilipsSleepwareG3(rawText: string): ParserResult<PSGRecord>`.
- Migración 1:1 desde legacy líneas 316-636 (321 LOC). Sin cambiar regex ni shape.
- Helper local `get(re, name)` igual al del legacy.

### Bloque D — Tests

- `tests/fixtures/philips-sleepware-g3.ts` — strings sintéticos basados en patterns reales del legacy.
- `tests/parsers/philips-sleepware-g3.test.ts` — 5+ tests:
  1. Parse exitoso completo (datos paciente + arquitectura + respiratorio + spo2).
  2. Missing campos → `missing[]` poblado correctamente.
  3. Edge case: decimales con coma española → convertidos a punto.
  4. Edge case: "n/d" o "--" → `num()` retorna "".
  5. Parse parcial: solo paciente (resto missing) → no crash.

## FASE 2 — Plan de verificación

### Triangulación E1/E2/E3

- **E1** — Lectura del legacy: ✅ confirmado arriba (parsePhilipsSleepwareG3 líneas 316-636, ~321 LOC, helpers utils inline líneas 175-200).
- **E2** — `pnpm --filter @somnosalud/psg-parser test` verde.
- **E3** — `pnpm --filter @somnosalud/psg-parser typecheck` verde.

### No rompe otros packages

- `pnpm typecheck` (raíz) sigue verde — psg-parser no exporta nada usado por webapp-somnosalud todavía.

## FASE 3 — Evidencias

- **E1 — Lectura del legacy:** ✅ verificada lectura completa de `legacy-v0/index.html` líneas 162-636 (parser Philips Sleepware G3 + helpers utils). Mapeado 1:1 a `src/parsers/philips-sleepware-g3.ts` (533 LOC TypeScript con tipos) + `src/utils.ts` (helpers compartidos).
- **E2 — `pnpm test` psg-parser:** ✅ **15/15 tests passing** en 8 ms. clinical-engine sigue 55/55 (cero regresión cross-package).
- **E3 — `pnpm typecheck` psg-parser:** ✅ verde. Bug detectado y corregido durante: index signature `string | number | undefined` no asignable directo a `number?` → coerción con typeof guard.

### Verificación H1-H5

| ID | Hipótesis | Resultado |
|----|-----------|-----------|
| H1 | Package se builda verde con tsc | ✅ Confirmada (typecheck verde, mismo patrón clinical-engine) |
| H2 | Parser TS estricto sin `any` ni `@ts-ignore` | ✅ Confirmada (solo 2 `as number` justificados para index signature) |
| H3 | Tests vitest con fixtures sintéticos passing | ✅ 15/15 cubren: paciente, estudio, arquitectura, estadificación, hipnograma, IAH/RDI, SpO2/ODI/T90, posición, missing fields, edge cases (decimales, latencia 0, texto vacío, num() helper) |
| H4 | Shape `PSGRecord` mapea 1:1 con legacy | ✅ Validado por inspección: nombres de campos idénticos, regex idénticas, output validado contra fixture |
| H5 | Cero deps pesadas added | ✅ Solo devDeps vitest + esbuild + typescript del workspace (ya presentes en clinical-engine) |

## FASE 4 — Cierre

### Cambios consumados

**Bloque A — Bootstrap package:**
- `packages/psg-parser/package.json` (scripts reales: build/test/typecheck/lint/clean)
- `packages/psg-parser/tsconfig.json` (copia del clinical-engine: target ES2020, strict, outDir dist)
- `packages/psg-parser/vitest.config.ts` (mismo pattern clinical-engine)
- `packages/psg-parser/README.md` (rewrite con tabla de progreso 7 parsers + uso + status)

**Bloque B — Types + utils + parser:**
- `src/types.ts` — `PSGRecord` ancho (todos opcionales) + `ParserResult<T>` + `FormatInfo` + `EquipmentFormat` + `StudyType` (~100 campos enumerados explícitamente + index signature dinámico)
- `src/utils.ts` — helpers `parseSpanishDate`, `parseHour`, `titleCase`, `num`, `normalizeWhitespace` (migrados 1:1 desde legacy líneas 175-200)
- `src/parsers/philips-sleepware-g3.ts` — `parsePhilipsSleepwareG3(rawText): ParserResult<PSGRecord>` (320 LOC TS estricto)
- `src/index.ts` — barrel exports

**Bloque C — Tests:**
- `tests/fixtures/philips-sleepware-g3.ts` — 4 fixtures sintéticos: completo / mínimo / decimal / no-determinado
- `tests/parsers/philips-sleepware-g3.test.ts` — 15 tests organizados en 3 describes (completo / mínimo / edge cases)

**Bloque D — Documentación:**
- `docs/vault/sprints/sprint-15-psg-parser-bootstrap/SPRINT-15-PSG-PARSER-BOOTSTRAP.md` (este doc)
- `docs/vault/debt/DEBT-conversor-psg-migration-roadmap.md` (nuevo)
- `docs/vault/MASTER-PLAN.md` + `docs/vault/index.md` updates

### DEBT abierto en este sprint

- `[[../../debt/DEBT-conversor-psg-migration-roadmap]]` — registra Sprints 16-19 pendientes con scope estimado de cada uno + sub-DEBT futuro para PDFs reales anonimizados de Pablo. Priority: medium.

### Próximo sprint candidato

- **Sprint 16** — Migrar 3 parsers más siguiendo patrón Sprint 15: BrainWave (PSG, similar a Sleepware G3), Philips Alice NightOne (poligrafía sin EEG), ResMed AirView Diagnóstico (poligrafía con OData). Estimado ~3-4 h.
- Alternativa: **Sprint 2.B + 9-supabase** (backend SomnoSalud webapp) si se prefiere terminar el flow client-side antes que el Conversor.

## Bloque J — Reporte

**Sprint 15 cerrado 2026-05-14.**

- **Scope alcanzado:** bootstrap `psg-parser/` package + parser piloto Philips Sleepware G3 + 15 tests vitest passing + DEBT roadmap para Sprints 16-19. Cero deps pesadas added. Cero regresión en clinical-engine (55/55 sigue verde).
- **Líneas creadas:** ~950 nuevas (types 200 + utils 80 + parser 320 + tests/fixtures 320 + sprint doc + DEBT + README rewrite).
- **Tests psg-parser:** 15/15 passing en 8 ms. Cobertura: paciente, estudio, arquitectura, estadificación, hipnograma, respiratorio, SpO2, posición, missing fields, edge cases.
- **Bug detectado y resuelto durante:** TypeScript estricto reveló que index signature `number | string | undefined` no es asignable directo a campo tipado `number?` — fix con typeof guard. Lesson aplicada: en migraciones JS→TS estricto, los index signatures requieren coerción explícita.
- **DEBT cerrado:** 0.
- **DEBT abierto:** 1 (`DEBT-conversor-psg-migration-roadmap` con sub-roadmap Sprints 16-19).
- **Lessons captured:** ninguna nueva — fricción esperada de migración JS→TS, resuelta con patrón típico.
- **Pampa Labs OS rules touched:** ninguna nueva. Cumple regla #12 VAULT-NAMING-ASCII-LOWERCASE (sprint dir `sprint-15-psg-parser-bootstrap`), regla #4 documentación Vault, regla #8 EMPIRICAL-FIRST (lectura legacy + run tests pre-cierre).
- **Estado del monorepo post-sprint:** 4 packages activos (clinical-engine 55 tests, psg-parser 15 tests, webapp-somnosalud 19 E2E, webapp-conversor-psg legacy funcional). Total tests: 89 + 19 E2E.

