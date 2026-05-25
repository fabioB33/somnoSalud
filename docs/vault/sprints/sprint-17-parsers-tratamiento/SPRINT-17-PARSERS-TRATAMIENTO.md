---
title: "Sprint 17 — 3 parsers tratamiento (ResMed Trat + BMC Trat + BMC Poligrafo) + 7/7 parsers"
date: 2026-05-24
sprint_number: 17
status: closed-verified
closed_at: 2026-05-24
parent_debts:
  - "[[../../debt/DEBT-conversor-psg-migration-roadmap]]"
related:
  - "[[../sprint-15-psg-parser-bootstrap/SPRINT-15-PSG-PARSER-BOOTSTRAP]]"
  - "[[../sprint-16-3-parsers-diagnosticos/SPRINT-16-3-PARSERS-DIAGNOSTICOS]]"
tags: [sprint, psg-parser, resmed, bmc, cpap, tratamiento, vitest, fase-2]
---

# Sprint 17 — 3 parsers tratamiento + 7/7 parsers PSG migrados

> [!info] Objetivo
> Completar la migracion de parsers PSG legacy → modular. Sprint 17 migra los 3 ultimos parsers (ResMed AirView Tratamiento, BMC Tratamiento, BMC Poligrafia diagnostica) + activa los 3 en el router (sacarlos de `UnsupportedFormatError`). Post-sprint: **7/7 parsers migrados**. DEBT-conversor-psg-migration-roadmap queda con solo Sprint 18 (Engine Hipoxico) + Sprint 19 (frontend Vite) pendientes.

## Contexto

| Sprint | Estado |
|---|---|
| 15 | ✅ Bootstrap + Philips Sleepware G3 (15 tests) |
| 16 | ✅ BrainWave + Philips NightOne + ResMed Diag + detect/router (65 tests) |
| **17** | **Hoy: ResMed Trat + BMC Trat + BMC Poligrafo (3 parsers tratamiento)** |
| 18 | Engine Hipoxico Azarbarzin 2019 |
| 19 | Frontend Vite+React reemplazando legacy HTML |

**Nuevos campos PSGRecord (CPAP tratamiento):**
- `cpap_uso_promedio_min`, `cpap_dias_uso`, `cpap_dias_total`, `cpap_dias_4h_porc`
- `cpap_presion_mediana_cmh2o`, `cpap_presion_p95_cmh2o`
- `cpap_fuga_p95_lpm`
- `estudio_fecha_fin` (para rango de fechas tipo "20/04/2026 - 21/04/2026")

## Hipotesis

- **H1** — `parseResMedTratamiento()` migrado 1:1 desde legacy lineas 1109-1190 (~80 LOC). Reporte CPAP/cumplimiento de AirSense.
- **H2** — `parseBMCTratamiento()` migrado desde lineas 1193-1257 (~65 LOC). Tipo de dispositivo + presion + indices respiratorios.
- **H3** — `parseBMCPoligrafo()` migrado desde lineas 1260-1282 (~22 LOC). Caso especial: mayoria de datos son imagenes, solo extrae paciente + warning en `missing[]`.
- **H4** — Router activa los 3 formatos: deja de tirar `UnsupportedFormatError` para `resmed_tratamiento` / `bmc_tratamiento` / `bmc_poligrafo`.
- **H5** — Tests vitest passing para los 3 parsers nuevos (3-5 tests c/u con fixtures sinteticos). Cobertura empirica > 20 tests nuevos.
- **H6** — Sprints 15-16 siguen verdes (65 tests pre-existentes no se rompen).
- **H7** — typecheck cross-monorepo verde, cero deps pesadas added.

## FASE 1 — Implementacion

### Bloque A — ResMed Tratamiento
- `src/parsers/resmed-tratamiento.ts` — patron similar a ResMed Diag pero con seccion CPAP especifica (uso, presion, fuga). Parser rango de fechas + `estudio_fecha_fin`.

### Bloque B — BMC Tratamiento
- `src/parsers/bmc-tratamiento.ts` — paciente con coma, sexo Masculino/Femenino full, fecha nacimiento formato `YYYY/MM/DD` (no DD/MM/YYYY). Indices respiratorios con notacion (AHI), (AI), (HI), (OAI), (CAI).

### Bloque C — BMC Poligrafo
- `src/parsers/bmc-poligrafo.ts` — minimo: solo paciente + warning en missing[] de que la mayoria de data esta en imagenes. Sprint 18 podria mejorar si Pablo manda PSGs reales para verificar lo que SI esta en texto.

### Bloque D — Types + router
- `src/types.ts` — agregar 8 campos nuevos al `PSGRecord` (cpap_*, estudio_fecha_fin).
- `src/router.ts` — sacar de `UnsupportedFormatError` los 3 formatos + invocar los nuevos parsers.
- `src/index.ts` — barrel exports nuevos.

### Bloque E — Tests + fixtures
- 3 fixtures sinteticos nuevos.
- 3 test files vitest (3-5 tests c/u).
- Update `tests/detect-router.test.ts`: los 3 formatos antes tiraban error, ahora retornan parser real. Cambiar expectations.

### Bloque F — DEBT update + README
- Update `DEBT-conversor-psg-migration-roadmap.md`: marcar Sprint 17 como completed.
- Update `packages/psg-parser/README.md` tabla progreso: 7/7 parsers ✅.

## FASE 2 — Verificacion

- **E1 — typecheck:** `pnpm --filter @somnosalud/psg-parser typecheck` verde.
- **E2 — vitest:** todos passing, incluyendo los 65 pre-existentes + ~20 nuevos = >85 tests.
- **E3 — turbo cross-monorepo:** clinical-engine sigue 55/55, webapp-somnosalud E2E sigue 19/19.

## FASE 3 — Cierre

### Cambios consumados

| Archivo | Tipo | Líneas |
|---|---|---|
| `src/parsers/resmed-tratamiento.ts` | NEW | ~130 |
| `src/parsers/bmc-tratamiento.ts` | NEW | ~100 |
| `src/parsers/bmc-poligrafo.ts` | NEW | ~45 |
| `tests/fixtures/resmed-tratamiento.ts` | NEW | ~40 |
| `tests/fixtures/bmc-tratamiento.ts` | NEW | ~35 |
| `tests/fixtures/bmc-poligrafo.ts` | NEW | ~20 |
| `tests/parsers/resmed-tratamiento.test.ts` | NEW (9 tests) | ~85 |
| `tests/parsers/bmc-tratamiento.test.ts` | NEW (10 tests) | ~70 |
| `tests/parsers/bmc-poligrafo.test.ts` | NEW (4 tests) | ~40 |
| `tests/detect-router.test.ts` | REWRITE | ~150 |
| `src/router.ts` | EDIT | activa 3 formatos, saca de UnsupportedFormatError |
| `src/types.ts` | EDIT | +8 campos CPAP + `estudio_fecha_fin` |
| `src/index.ts` | EDIT | exports nuevos |

### Verificación empírica

- **typecheck:** ✅ `pnpm typecheck` verde (tras agregar 8 campos a PSGRecord).
- **vitest:** ✅ **89/89 tests passing en 615 ms** (Sprint 15: 15 + Sprint 16: 50 + Sprint 17: +24 = 89).
- **Sin regresión:** los 65 tests pre-existentes (Sleepware/BrainWave/NightOne/ResMed Diag/detect-router) siguen verdes.

### 3 bugs greedy regex detectados y resueltos durante

Igual que Sprint 16 (regex greedy del legacy que `normalizeWhitespace` rompe), encontramos 3 patrones nuevos:

1. **`parseResMedTratamiento` paciente:** `/Identificación del paciente:\s*([A-ZÁÉÍÓÚÑa-záéíóúñ ]+)/` capturaba `PEREZ Juan Edad` cuando había `Edad: 60` después. **Fix:** lookahead `(?=\s+(?:Edad|Fecha|FDN|AirSense|\d{1,2}\/)|$)`.
2. **`parseResMedTratamiento` dispositivo:** `/(AirSense\s*\d+\s*\w+)/i` capturaba `AirSense 11 1` cuando había `1/5/2026` después (el `1` matcheaba `\w+`). **Fix:** restringir el sufijo a tokens alfabéticos `(?:\s+[A-Za-z][A-Za-z\s]*?)?\b`.
3. **`parseBMCTratamiento` + `parseBMCPoligrafo` paciente:** mismo greedy que NightOne en Sprint 16. **Fix preventivo:** lookahead `(?=\s+(?:Género|Genero|Sexo|Edad|Fecha|Tipo|FDN|BMC|SW)|$)`.

Estos 3 fixes son **mejoras sobre el legacy** — los PDFs que el legacy parseaba bien siguen funcionando (verificado por cobertura de tests).

### Hipótesis verificadas

| ID | Hipótesis | Resultado |
|----|-----------|-----------|
| H1 | ResMed Trat 1:1 con uso/presión/fugas | ✅ 9 tests |
| H2 | BMC Trat con AHI/AI/HI/OAI/CAI + fecha invertida | ✅ 10 tests |
| H3 | BMC Poligrafo con warning explícito | ✅ 4 tests |
| H4 | Router activa 3 formatos | ✅ detect-router.test.ts verifica los 3 |
| H5 | Tests passing | ✅ 24 nuevos |
| H6 | Sprints 15-16 siguen verdes | ✅ 65/65 sin cambios |
| H7 | typecheck verde + cero deps added | ✅ |

## FASE 4 — Pendiente roadmap

- **Sprint 18** — Engine Hipoxico Azarbarzin 2019 (5-7 h). Migrar `computeHypoxicScorePSG()` del legacy líneas 1648-1738 a `src/engine/hypoxic.ts` + tests con casos clínicos.
- **Sprint 19** — Frontend Vite+React reemplaza legacy-v0/index.html. Coexistencia hasta paridad confirmada.

## Bloque J — Reporte

**Sprint 17 cerrado 2026-05-24.**

- **Scope alcanzado:** 3 parsers tratamiento (~275 LOC TS estricto) + 24 tests vitest + extension `PSGRecord` con 8 campos CPAP + activación 3 formatos en router.
- **Migración Conversor PSG progreso: 7/7 parsers (100%)** ✅. Quedan Engine Hipóxico (Sprint 18) + frontend Vite (Sprint 19) para cerrar la migración completa.
- **Líneas creadas:** ~700 totales (parsers + fixtures + tests + sprint doc).
- **Tests psg-parser:** 89/89 passing en 615 ms.
- **3 bugs latentes legacy detectados y resueltos** (greedy regex paciente + dispositivo). Patrón heredado del legacy donde el `\n` separador hacía que las regex funcionaran, pero post `normalizeWhitespace` los lookaheads son obligatorios.
- **Cero regresión:** clinical-engine 55/55 + Sleepware/BrainWave/NightOne/ResMed Diag siguen passing.
- **DEBT abierto nuevo:** 0. DEBT-conversor-psg-migration-roadmap actualizado con Sprint 17 completed.
- **Pampa Labs OS rules touched:** ninguna nueva. Cumple regla #12 VAULT-NAMING-ASCII-LOWERCASE (sprint dir `sprint-17-parsers-tratamiento`) + regla #4 documentación Vault.

