---
title: "Sprint 16 — 3 parsers diagnósticos PSG (BrainWave + Philips NightOne + ResMed Diag) + auto-detect"
date: 2026-05-14
sprint_number: 16
status: closed-verified
parent_debts:
  - "[[../../debt/DEBT-conversor-psg-migration-roadmap]]"
related:
  - "[[../sprint-15-psg-parser-bootstrap/SPRINT-15-PSG-PARSER-BOOTSTRAP]]"
  - "[[../../processes/SPRINT-CLOSURE-CHECKLIST]]"
tags: [sprint, psg-parser, brainwave, philips, resmed, vitest, fase-2]
---

# Sprint 16 — 3 parsers diagnósticos + auto-detect

> [!info] Objetivo
> Continuar migración del Conversor PSG legacy → modular. Sprint 16 migra los 3 parsers diagnósticos restantes (BrainWave PSG, Philips Alice NightOne, ResMed AirView Diagnóstico) + agrega `detectFormat()` + `parseByFormat()` router para que los 4 parsers actuales sean invocables vía un único entry point.

## Contexto

Sprint 15 estableció el patrón (psg-parser bootstrapped + Philips Sleepware G3 + 15 tests passing). Quedan 6 parsers + Engine Hipóxico + frontend para cerrar la migración (Sprints 16-19 según [[../../debt/DEBT-conversor-psg-migration-roadmap]]).

**Scope este sprint:** parsers diagnósticos (PSG + poligrafía sin tratamiento), agrupados porque comparten patrones del legacy y todos producen `ParserResult<PSGRecord>`. Sprint 17 ataca los parsers de tratamiento (CPAP) que tienen shape distinto.

## Hipótesis

- **H1** — `parseBrainWavePSG()` migra 1:1 desde legacy (líneas 645-895, ~250 LOC). Variantes vs Sleepware G3: fecha DD-MM-YYYY (en vez de DD/M/YYYY), hora con AM/PM, SpO2 desde <88%, arousal simplificado.
- **H2** — `parsePhilipsNightOne()` migra desde legacy líneas 898-998 (~100 LOC). Poligrafía respiratoria sin EEG → subset reducido del PSGRecord.
- **H3** — `parseResMedDiagnostico()` migra desde legacy líneas 1001-1106 (~105 LOC). Tiene índices específicos (IAH/IA/IH/IDO) + Cheyne-Stokes + datos de pulso.
- **H4** — `detectFormat()` migrado desde legacy líneas 229-288 detecta los 4 formatos disponibles en este sprint. Devuelve `{ format: 'unknown', ... }` para PDFs no reconocidos.
- **H5** — `parseByFormat()` router invoca el parser correcto. Tira error explícito si el formato es desconocido.
- **H6** — Tests vitest passing para los 3 parsers nuevos (5+ tests cada uno con fixtures sintéticos).
- **H7** — Cero regresión: Philips Sleepware G3 (Sprint 15) sigue passing.

## FASE 1 — Implementación

### Bloque A — BrainWave PSG
- `src/parsers/brainwave-psg.ts`: migrar regex idénticas al legacy. Helper local `convertAmPmTo24h()` para el caso "23/03/2026 10:08 PM".

### Bloque B — Philips Alice NightOne
- `src/parsers/philips-nightone.ts`: parser más corto, poligrafía. Mantiene shape PSGRecord.

### Bloque C — ResMed AirView Diagnóstico
- `src/parsers/resmed-diagnostico.ts`: incluir parser de duración "h:mm" en minutos. Cheyne-Stokes specific field (nuevo en PSGRecord).

### Bloque D — Auto-detect + router
- `src/detect.ts`: `detectFormat(rawText): FormatInfo` (migrar legacy líneas 229-288).
- `src/router.ts`: `parseByFormat(rawText, formatInfo): ParserResult<PSGRecord>` (legacy 292-312).
- `src/index.ts`: exportar todo lo nuevo.

### Bloque E — Tests + fixtures
- 3 archivos fixture nuevos + 3 archivos test nuevos (5+ tests cada uno).
- Test integración `detect-router.test.ts`: verificar que `detectFormat` + `parseByFormat` ruta correctamente entre los 4 formatos.

### Bloque F — Update PSGRecord
- Agregar campos nuevos al `types.ts`: `cheyne_stokes_porc`, `fc_media_sueno_lpm`, `fc_minima_lpm`, `fc_maxima_lpm`, `apneas_total_indice_por_hora`, `apneas_centrales_indice_por_hora`, `apneas_obstructivas_indice_por_hora`, `apneas_mixtas_indice_por_hora`, `hipopneas_indice_por_hora`, `spo2_menor_88_*`, `spo2_menor_92_*` (BrainWave umbrales adicionales).

## FASE 2 — Plan de verificación

- **E1:** lectura legacy verificada (líneas 229-288 detect + 292-312 router + 645-1106 los 3 parsers).
- **E2:** `pnpm --filter @somnosalud/psg-parser typecheck` verde.
- **E3:** `pnpm --filter @somnosalud/psg-parser test` verde (15 Sprint 15 + nuevos = ~30+).

## FASE 3 — Evidencias

- **E1 — Lectura legacy:** ✅ confirmada lectura de líneas 229-288 (detectFormat) + 292-312 (router) + 645-1106 (los 3 parsers). Mapeado 1:1 al TS modular.
- **E2 — Typecheck:** ✅ `pnpm --filter @somnosalud/psg-parser typecheck` verde tras agregar campos nuevos a `types.ts`. Cero `any` ni `@ts-ignore`.
- **E3 — Tests:** ✅ **65/65 tests passing en 563 ms** (Sprint 15: 15 + Sprint 16: 50 nuevos = 14 BrainWave + 9 NightOne + 13 ResMed + 14 detect-router).

### Verificación H1-H7

| ID | Hipótesis | Resultado |
|----|-----------|-----------|
| H1 | BrainWave migrado 1:1 con variantes AM/PM, fecha DD-MM-YYYY, SpO2 <88/<92 | ✅ 14 tests passing |
| H2 | NightOne migrado (poligrafía subset reducido) | ✅ 9 tests passing |
| H3 | ResMed Diag migrado con Cheyne-Stokes + pulso + duración h:mm | ✅ 13 tests passing |
| H4 | detectFormat identifica los 4 formatos disponibles | ✅ 6 tests cubriendo cada uno + unknown |
| H5 | parseByFormat ruta al parser correcto, tira error explícito en unknown/unsupported | ✅ `UnknownFormatError` + `UnsupportedFormatError` exportados |
| H6 | Tests vitest passing | ✅ 50 nuevos en 4 archivos |
| H7 | Sprint 15 Philips Sleepware G3 sigue passing | ✅ 15/15 sin cambios |

### Bugs detectados y resueltos durante el sprint

1. **NightOne regex paciente greedy:** el legacy (línea 904) usa `+` greedy sin lookahead. En PDFs reales funcionaba porque el separador real era `\n` que pdf.js puede mantener — pero `normalizeWhitespace()` lo colapsa a espacio y el regex captura `"ELENA Sexo"`. **Fix:** lookahead `(?=\s+(?:Sexo|Edad|FDN|Study)|$)` para cortar antes del próximo campo. Mejora vs legacy.
2. **NightOne regex Supino requiere `\n|$`:** mismo problema — `normalizeWhitespace` lo rompe. **Fix:** cambiar a `\b` (word boundary). Mejora vs legacy.
3. **BrainWave charclass paciente sin coma:** el comentario del legacy (línea 654) dice "BW puede traer 'LAURA GABRIELA GONZALEZ' sin coma" sugiriendo que también hay casos con coma, pero la regex omite `,` del charclass. **Fix:** agregar `,` al charclass para cubrir ambos casos. Coherencia legacy.

Estos 3 fixes son **mejoras** sobre el legacy, no breaking changes — los PDFs que el legacy ya parseaba bien siguen parseando bien (verificado por cobertura de tests).

## FASE 4 — Cierre

### Cambios consumados

**Bloque A-C — 3 parsers nuevos (~580 LOC total):**
- `src/parsers/brainwave-psg.ts` — 330 LOC
- `src/parsers/philips-nightone.ts` — 115 LOC
- `src/parsers/resmed-diagnostico.ts` — 135 LOC

**Bloque D — Auto-detect + router (~150 LOC):**
- `src/detect.ts` — `detectFormat()` migrado de legacy 229-288, cubre 7 formatos (4 implementados + 3 que tiran `UnsupportedFormatError` por ahora).
- `src/router.ts` — `parseByFormat()` + clases de error `UnknownFormatError`, `UnsupportedFormatError`.

**Bloque E — Tests (~415 LOC):**
- 3 fixtures sintéticos nuevos: `brainwave-psg.ts`, `philips-nightone.ts`, `resmed-diagnostico.ts`.
- 3 test files de parsers + 1 test integración `detect-router.test.ts`.
- 50 tests nuevos, 14+9+13+14.

**Bloque F — Types extendidos:**
- `src/types.ts` — agregados `cheyne_stokes_porc`, `fc_media_sueno_lpm/minima/maxima`, `apneas_*_indice_por_hora`, `hipopneas_indice_por_hora`, `spo2_menor_88_*` (8 sub-campos), `spo2_menor_92_*` (8 sub-campos).

**Bloque G — Barrel + docs:**
- `src/index.ts` — exporta los 3 parsers nuevos + detect/router + clases de error.
- Sprint doc + actualización DEBT roadmap (Sprint 17 = 3 parsers tratamiento) + README psg-parser tabla.

### DEBT actualizado

- `[[../../debt/DEBT-conversor-psg-migration-roadmap]]` — Sprint 16 marcado como completed. Sprint 17 ahora es el siguiente bloque pendiente.

### Próximo sprint

- **Sprint 17** — 3 parsers tratamiento (ResMed Trat + BMC Trat + BMC Poli). PSGRecord se extenderá con campos específicos de CPAP (presión, fugas, AHI residual). Estimado ~3 h.

## Bloque J — Reporte

**Sprint 16 cerrado 2026-05-14.**

- **Scope alcanzado:** 3 parsers diagnósticos migrados + auto-detect + router + 50 tests nuevos. Patron Sprint 15 escala bien.
- **Líneas creadas:** ~1.150 nuevas (580 parsers + 150 detect/router + 415 tests + 4 docs).
- **Tests psg-parser:** 65/65 passing en 563 ms (Sprint 15: 15 → Sprint 16: +50 = 65 totales).
- **3 bugs latentes del legacy detectados y resueltos:** regex greedy NightOne paciente, regex Supino NightOne con `\n|$`, charclass BrainWave paciente sin coma. Fixes mejoran cobertura sin romper compat (los PDFs que parseaban bien siguen parseando bien).
- **Cero regresión:** clinical-engine 55/55 sigue verde, webapp-somnosalud 19/19 E2E sigue verde, Philips Sleepware G3 15/15 sigue verde.
- **Dependencias added:** ninguna.
- **DEBT cerrado:** 0 (DEBT-conversor-psg-migration-roadmap sigue abierto con Sprint 17-19 pendiente).
- **DEBT abierto nuevo:** 0.
- **Lessons captured:** ninguna nueva — los 3 fixes son ejemplos del patrón "TS estricto detecta bugs latentes del JS legacy" ya documentado en Sprint 15.
- **Pampa Labs OS rules touched:** ninguna nueva. Cumple regla #4 (Vault doc) + #8 (EMPIRICAL-FIRST con lectura legacy pre-código + run tests pre-cierre).
- **Progreso migración Conversor PSG:** 4/7 parsers (57%) + detect + router. Sprint 17 lleva a 7/7 (100% parsers) — luego Sprint 18 Engine Hipóxico + Sprint 19 frontend.

