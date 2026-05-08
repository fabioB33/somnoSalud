---
title: "Contar tests por bloques `test()` y `it()` — NO por bloques `describe()`"
date: 2026-05-08
tags: [lesson-learned, testing, vitest, mosaic-counting, empirical-first]
detected_during: sprint-1-cleanup-os-heredado
applies_to: [todo sprint que verifique cobertura de tests, todo análisis pre-trabajo de un repo nuevo]
related:
  - "[[../sprints/sprint-1-cleanup-os-heredado/SPRINT-1-CLEANUP-OS-HEREDADO]]"
  - "[[../../../CLAUDE]]"
owner: fabio + cowork
---

# Contar tests por bloques `test()` y `it()` — NO por bloques `describe()`

## Contexto

Análisis exhaustivo del repo SomnoSalud (2026-05-07 noche). Cowork verificó claim del README + CLAUDE.md de "55+ tests passing". Reportó al usuario: "solo encontré 13 tests, no 55". Concluyó que README/CLAUDE.md tenían claim infundado.

## Qué pasó

Cowork ejecutó `grep -c -E "^(it|test|describe)\(" packages/clinical-engine/tests/scoring.test.ts` → resultado `13`. **Pero la regex contaba bloques `describe()` que arrancan en columna 0**, ignorando los `test()` indentados con 2 espacios. La estructura del archivo era:

```ts
describe('ISI Scoring (Bastien et al. 2001)', () => {
  test('score 0 → no clinical insomnia', () => { ... });
  test('score 7 → upper bound of no insomnia', () => { ... });
  test('score 8 → subthreshold insomnia', () => { ... });
  // ... 6 tests más
});
describe('ESS Scoring (Johns 1991)', () => {
  test('score 0 → normal', () => { ... });
  // ... 4 tests más
});
// ... 11 describe más
```

Cuando finalmente Cowork ejecutó `pnpm --filter somnosalud-clinical-engine test`, vitest reportó `Tests 55 passed (55)` — el claim del README era correcto. Mi análisis previo había fabricado un problema inexistente que llevó al usuario a desconfiar (justificadamente) del estado del repo.

## Qué aprendimos

**Regla: nunca contar tests con regex de `describe`. Siempre invocar el test runner.**

Razones:
1. `describe` agrupa, no testea — un `describe` puede contener N tests o cero.
2. Los tests pueden estar declarados con `test()` o `it()` (alias).
3. Los tests pueden estar indentados con cualquier nivel.
4. Tests dinámicos (`describe.each`, `test.each`) no se ven con grep.
5. El test runner tiene la verdad: corre y reporta el conteo definitivo.

Esto es una manifestación específica de la regla #8 EMPIRICAL-FIRST-BEFORE-PLAN del [[../../../CLAUDE]]: si tu análisis va a generar una propuesta de fix (en este caso "actualizar CLAUDE.md a número real"), triangulá la evidencia ANTES. Una de esas evidencias debe ser **correr la herramienta canónica del dominio**, no inferir desde patrones de texto.

## Cómo aplicar a futuros sprints

### Para tests:

```bash
# ❌ MAL — contás bloques sintácticos, no tests
grep -c "^describe(" tests/foo.test.ts

# ✅ BIEN — corrés el runner, capturás el reporte oficial
pnpm test --reporter=verbose 2>&1 | grep -E "Tests\s+\d+ passed"
# o
npx vitest run --reporter=json | jq '.testResults[].assertionResults | length'
```

Para hacer el conteo en el repo SomnoSalud:

```bash
pnpm --filter somnosalud-clinical-engine test 2>&1 | tail -10
# Esperar línea: "Tests  55 passed (55)"
```

### Para otros claims del CLAUDE.md / README:

Antes de reportar al usuario "el claim X del CLAUDE.md está mal", aplicar al menos 2 de estas verificaciones:

1. **Run la herramienta canónica del dominio** (test runner, build runner, type checker).
2. **Lectura del archivo de salida real** (no del código fuente que lo genera).
3. **Comparar con un baseline conocido** (ej: el último CI verde reportado).

Si solo tenés 1 evidencia (grep + intuición), declararlo como "hipótesis a verificar", no como "claim falso".

## Costo del error

- Tiempo perdido: ~30 minutos del usuario revisando si el claim era falso.
- Erosión de confianza: el usuario ahora tiene que dudar de cada otro hallazgo del análisis hasta que se verifique.
- Trabajo innecesario potencial: si Fabio hubiera aceptado mi recomendación de "actualizar CLAUDE.md a 13 tests", habría quedado peor (claim verdadero degradado a falso).

## Mitigación implementada

Esta misma LL existe como artefacto del Vault. Cualquier sprint futuro que cuente tests verifica esta nota antes (`grep -r "lesson-learned" docs/vault/lessons-learned/`).

---

*Lección aprendida formalizada 2026-05-08 mañana, durante Sprint 1.*
