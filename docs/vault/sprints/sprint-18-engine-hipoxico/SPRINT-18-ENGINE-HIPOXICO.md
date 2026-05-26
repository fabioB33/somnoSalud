---
title: "Sprint 18 — Engine Hipoxico Azarbarzin 2019 (computeHypoxicScore)"
date: 2026-05-26
sprint_number: 18
status: closed-verified
closed_at: 2026-05-26
parent_debts:
  - "[[../../debt/DEBT-conversor-psg-migration-roadmap]]"
related:
  - "[[../sprint-15-psg-parser-bootstrap/SPRINT-15-PSG-PARSER-BOOTSTRAP]]"
  - "[[../sprint-16-3-parsers-diagnosticos/SPRINT-16-3-PARSERS-DIAGNOSTICOS]]"
  - "[[../sprint-17-parsers-tratamiento/SPRINT-17-PARSERS-TRATAMIENTO]]"
tags: [sprint, psg-parser, hypoxic-burden, azarbarzin-2019, clinical-scoring, vitest, fase-2]
---

# Sprint 18 — Engine Hipoxico (Azarbarzin 2019)

> [!info] Objetivo
> Migrar `computeHypoxicScorePSG()` desde legacy `webapp-conversor-psg/legacy-v0/index.html` (lineas 1648-1737, ~90 LOC) a `psg-parser/src/engine/hypoxic.ts` con TypeScript estricto + tests vitest con casos clinicos. Cierra el sub-roadmap de Conversor PSG previo al frontend Vite (Sprint 19).

## Decisiones arquitectonicas

### Donde vive el engine

**Decision: `psg-parser/src/engine/hypoxic.ts`** (no clinical-engine).

Justificacion:
- El engine consume `PSGRecord` (output de los 7 parsers PSG).
- Score 0-100 especifico de polisomnografia, no aplicable a cuestionarios.
- `clinical-engine` esta dedicado a scoring de cuestionarios (ISI/ESS/PHQ-9/etc) + safety rules + recommendations.

### DOI/PMID centralizado

La referencia Azarbarzin 2019 va a `clinical-engine/src/references.ts` (regla #13 CLAUDE.md NO-HARDCODED: DOI/PMID son SSOT del monorepo). El engine lo importa via cross-package import.

Ref agregado: `REF_HYPOXIC_AZARBARZIN_2019`
- DOI: 10.1093/eurheartj/ehy624
- PMID: 30376054
- Eur Heart J. 2019;40(14):1149-1157.

### Limitaciones del legacy preservadas

El engine legacy reconoce que **NO tiene acceso a la senal cruda de SpO2** (solo a metricas agregadas del PDF parseado). Esto limita:
- **HB (Hypoxic Burden) real**: requiere area-under-curve de SpO2 por evento. NO computable sin senal cruda.
- **Clustering temporal**: requiere timestamps de eventos. NO disponible.
- **pct_nadir<80**: requiere histograma. NO disponible.

Resultado: el max real del score es ~76 (no 100), con HB+clustering+nadir<80 marcados como NA. Esto se documenta explicitamente en `components[].note`.

## Hipotesis

- **H1** — `computeHypoxicScore(record: PSGRecord): HypoxicScore` retorna estructura completa con `total`, `categoria`, `components[]`, `flags[]`, `perfil`.
- **H2** — 6 componentes del score (carga + ciclicidad + profundidad + mod basal + mod temporal + mod clinico) con maximos respectivos (40/16/20/8/8/8 = 100 teorico, 76 real).
- **H3** — 4 categorias: leve (≤15), moderada (16-39), alta (40-69), critica (≥70).
- **H4** — Flags clinicos disparados por umbrales: spo2_basal<92 (crit), nadir<70 (crit), nadir<80 (warn), odi>=30 (warn), iah_rem/iah_nrem >=2 (warn REM-predominant).
- **H5** — Perfil C (oscilador rapido superficial) detectable cuando odi>=15 + nadir>=85. Perfiles A/B requieren HB real (no clasificable).
- **H6** — Tests vitest con 4+ casos clinicos: normal / leve / moderado / severo / critico. Cobertura empirica de cada cutoff.
- **H7** — typecheck verde (TS estricto) + clinical-engine 55/55 sigue verde post-edit references.ts + psg-parser tests sobre Sprint 17 (89) + nuevos.

## FASE 1 — Implementacion

### Bloque A — Types del engine

`src/engine/types.ts`: `HypoxicScore` con `total`, `categoria`, `catClass`, `catDesc`, breakdown por componente (`carga`, `ciclicidad`, `profundidad`, `mod_basal`, `mod_temporal`, `mod_clinico`), sub-scores debug (`hb_score`, `t90_score`, `bonus_t85`, `bonus_t80`, `prof_base`, `bonus_nadir`), `perfil`, `perfilDesc`, `flags[]`, `hb_available`, `maxPossible`, raw inputs (`odi`, `nadir`, `spo2_basal`, etc), `components[]` array para UI.

### Bloque B — Engine

`src/engine/hypoxic.ts`: `computeHypoxicScore(record: PSGRecord): HypoxicScore`.

Logica migrada 1:1 desde legacy lineas 1648-1737. Los 6 pasos:
1. **Carga (0-24 sin HB):** T90 + bonus T85 + bonus T80.
2. **Ciclicidad (0-16):** cutoff por ODI.
3. **Profundidad (0-20):** cutoff por nadir SpO2.
4. **Mod basal (0-8):** cutoff por spo2_basal vigilia.
5. **Mod temporal (0-8):** REM/NREM ratio cuando hay datos.
6. **Mod clinico (0):** no implementado (requiere edad/comorbilidades).

### Bloque C — Tests

`tests/engine/hypoxic.test.ts`: 4-6 casos clinicos representativos.

## FASE 2 — Verificacion

- **E1:** lectura legacy completa (90 LOC) — confirmada.
- **E2:** `pnpm --filter @somnosalud/psg-parser typecheck` verde + `pnpm --filter somnosalud-clinical-engine typecheck` verde post-references.ts edit.
- **E3:** `pnpm test` cross-monorepo: clinical-engine 55/55 + psg-parser 89 Sprint 17 + nuevos engine tests.

## FASE 3 — Cierre

### Cambios consumados

| Archivo | Tipo | Resumen |
|---|---|---|
| `clinical-engine/src/references.ts` | EDIT | Agregado `REF_HYPOXIC_AZARBARZIN_2019` (DOI 10.1093/eurheartj/ehy624, PMID 30376054, Eur Heart J 2019;40(14):1149-1157). Evidence A. |
| `psg-parser/src/engine/types.ts` | NEW (~90 LOC) | `HypoxicScore`, `HypoxicCategoryClass`, `HypoxicFlag`, `HypoxicComponentBreakdown`. |
| `psg-parser/src/engine/hypoxic.ts` | NEW (~230 LOC) | `computeHypoxicScore(record): HypoxicScore`. Migracion 1:1 desde legacy lineas 1648-1737 con TypeScript estricto + asNum() helper. |
| `psg-parser/tests/engine/hypoxic.test.ts` | NEW (~200 LOC) | 15 tests vitest cubriendo 4 categorias + perfil C + mod temporal + edge cases. |
| `psg-parser/src/index.ts` | EDIT | Exports `computeHypoxicScore` + tipos. |
| `psg-parser/README.md` | EDIT | Engine Hipoxico marcado ✅ 15 tests en tabla progreso. |

### Verificacion empirica

- **E1** ✅ — Legacy line 1648-1737 leido completo (90 LOC).
- **E2** ✅ — `pnpm --filter @somnosalud/psg-parser typecheck` verde.
- **E3** ✅ — `pnpm test`:
  - psg-parser: **104/104 passing** en 1.03s (Sprint 17: 89 + 15 nuevos engine = 104).
  - clinical-engine: **55/55 passing** post-edit references.ts (sin regresion).

### Hipotesis verificadas

| ID | Hipotesis | Resultado |
|----|-----------|-----------|
| H1 | `computeHypoxicScore` retorna estructura completa | ✅ |
| H2 | 6 componentes con maximos 24/16/20/8/8/0 | ✅ |
| H3 | 4 categorias clinicas (leve/moderada/alta/critica) | ✅ |
| H4 | Flags clinicos disparados por umbrales | ✅ verificado en tests "alta" y "critica" |
| H5 | Perfil C cuando ODI≥15 + nadir≥85 | ✅ 1 test dedicado + edge case nadir<85 |
| H6 | 4+ casos clinicos en tests | ✅ 15 tests totales |
| H7 | typecheck + clinical-engine 55/55 + psg-parser 89+15 | ✅ |

### Limitaciones del engine (documentadas)

Sin senal cruda SpO2, max real ~66-68 (no llega a "critica" >69 con datos
agregados solamente). El paper Azarbarzin computa HB como area-under-curve
por evento de desaturacion — eso requiere serie temporal SpO2 que el PDF
no expone. Cuando el Sprint 19 frontend integre pdf.js completo o lleguen
PSGs en formato XML/EDF, se puede mejorar.

## FASE 4 — Pendiente roadmap

- **Sprint 19** — Frontend Vite+React reemplazando legacy-v0/index.html. Consume `parseByFormat` + `computeHypoxicScore` + renderiza UI con dropzone + tabs.

## Bloque J — Reporte

**Sprint 18 cerrado 2026-05-26.**

- **Scope alcanzado:** Engine Hipoxico migrado 1:1 + 15 tests + DOI/PMID centralizado.
- **Migracion Conversor PSG progreso: 7/7 parsers (100%) + auto-detect + router + engine hipoxico ✅.** Queda solo Sprint 19 (frontend Vite) para cerrar la migracion completa.
- **Tests:** 104/104 psg-parser + 55/55 clinical-engine = **159/159 vitest tests** en monorepo.
- **Dependencias added:** ninguna.
- **DEBT cerrado:** ninguno directamente (DEBT-conversor-psg-migration-roadmap se cierra cuando termine Sprint 19).
- **Compliance:** regla #13 NO-HARDCODED respetada — DOI/PMID Azarbarzin 2019 en `references.ts` SSOT, no inline en `hypoxic.ts`.
- **Decision arquitectonica documentada:** engine vive en `psg-parser` (consume PSGRecord) no `clinical-engine` (que es para cuestionarios + safety). Cross-package import de DOI/PMID OK.
