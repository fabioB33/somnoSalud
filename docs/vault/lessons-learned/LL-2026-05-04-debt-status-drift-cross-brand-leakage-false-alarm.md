---
title: "Lesson Learned — DEBT status drift causó falso alarma de 4 horas en cross-brand-leakage (Sprint 73.R ya había resuelto el bug)"
date: 2026-05-04
tags: [lesson-learned, vault, debt-management, empirical-first, multi-tenancy, sprint-73r, sprint-72h, drift, postmortem]
status: documented
related:
  - "[[../debt/DEBT-2026-04-27-agency-overview-cross-brand-leakage]]"
  - "[[../processes/VERIFICATION-QUERY-SCHEMA]]"
  - "[[../../CLAUDE]]"
  - "[[../sessions/2026-05-03-cowork-fonseca-design-system-fonts-internal-only-law]]"
detected_by: jorge (instinto humano post-Cowork plan)
---

# Lesson Learned — DEBT status drift causó falso alarma de 4 horas

## Contexto inmediato

Domingo 2026-05-03 noche / lunes 2026-05-04 madrugada. Reunión Lure programada para lunes 12-17hs ART (Gabriel + Sol + Federico Traficante). Las 3 demos previas con Lure habían fallado. Jorge me pidió revisar el vault para ver qué DEBTs podían bloquear el demo.

## Lo que casi sucede

Cowork (yo) hizo lo siguiente:
1. **Leí los DEBTs `code-pending-merge`** del directorio `docs/vault/debt/`.
2. Encontré `DEBT-2026-04-27-agency-overview-cross-brand-leakage.md` con `status: code-pending-merge` y `fix_branch: feat/sprint-72h-multitenancy-routing-context`, `fix_commit: 94f95e3`.
3. **Verifiqué git log**: el commit `94f95e3` no estaba en `main`.
4. **Conclusión apresurada**: "el fix Sprint 72.H no fue mergeado, hay que mergearlo + ejecutar migration 023 + data steps + smoke test, ~4 horas".
5. **Propuse el plan a Jorge.**

Si Jorge aceptaba el plan al pie de la letra, perdíamos 4 horas reimplementando algo ya resuelto. La demo del lunes habría llegado con cambios riesgosos no necesarios.

## Lo que Jorge dijo (que cortó el daño)

> "Ya sabes mi respuesta. Si sabes las leyes universales de Pampa Labs. Pero antes de comenzar con la opcion A, fijate seguro que no lo hayamos resuelto, porque me parece que sí, y a lo mejor no se documento. Como podemos revisarlo antes de hacer nada. Revisarlo empiricamente?"

Ese instinto fue lo que salvó el día.

## Lo que descubrí cuando verifiqué empíricamente

Hice 3 evidencias triangulas:

**E1 — Lectura del código actual en `main`:**
- `git checkout main && cat products/content-factory/src/routes/agency.routes.ts`
- Encontré la función `getUserBrandIds(userId)` que filtra por `user_brands` JOIN.
- Buscando el commit que la introdujo: `e5ba751` del 1/5 — Sprint 73.R "helper utility business-type".
- **El fix ya estaba en main hacía 3 días**, sólo que vino por otro sprint con otro approach (más simple — usar `user_brands` JOIN existente, no la tabla `pb_agencies` propuesta por Sprint 72.H).

**E2 — Query Supabase Web (DB prod):**
- `SELECT u.email, ub.brand_id, b.name FROM auth.users u JOIN user_brands ub ON ub.user_id = u.id JOIN brands b ON b.id = ub.brand_id WHERE u.email LIKE '%traficante%';`
- Resultado: Sol Traficante (`straficante@administracionpuertomadero.com`) tiene **solo Lure** en `user_brands`. No tiene Fonseca.
- Si el bug existiera, ella vería Fonseca. Empíricamente, no puede.

**E3 — Smoke visual via Chrome MCP:**
- Login con cuenta Lure en https://app.pampalabs.com
- Network tab: `GET /api/agency/overview?range=30d` → respuesta solo Lure.
- Header del agency overview: "Resumen de tu marca · 1 brand · $2.553.229 spend".
- **No hay leakage.**

Las 3 evidencias coincidieron: el bug NO existe en producción.

## Causa raíz del drift

1. **Sprint 72.H propuso un fix ambicioso** (nueva tabla `pb_agencies`, migration 023, data steps manuales). Branch `feat/sprint-72h-multitenancy-routing-context` quedó sin mergear.
2. **Sprint 73.R aplicó un fix más simple** (helper utility usando `user_brands` JOIN existente). Mergeado el 1/5 commit `e5ba751`.
3. **Nadie actualizó el DEBT** `DEBT-2026-04-27-agency-overview-cross-brand-leakage.md`. Quedó congelado en `status: code-pending-merge` con referencias al sprint 72.H que ya no aplican.
4. **3 días después**, Cowork lee el DEBT, infiere que el bug sigue activo, propone re-mergear Sprint 72.H.

El sistema empírico (código real + DB real + UX real) decía "bug-absent". El sistema documental (DEBT) decía "bug-present". Cowork confió en el documental sin chequear el empírico.

## Por qué pasó

- **DEBTs se cierran cuando el sprint que los resuelve los cierra.** Si un sprint NO sabe que cierra un DEBT (Sprint 73.R no fue planeado para resolver multi-tenancy específicamente, solo agregó el helper que también lo resolvió como side-effect), nadie le actualiza el status.
- **No hay autovalidación.** El DEBT no tenía un mecanismo para autocomprobarse. Solo Jorge (con memoria) o Cowork (con triangulación empírica) podían detectar el drift.
- **Cowork tomó atajos.** Confiar en el status del DEBT es un atajo. Lo correcto es leer el código actual + querear la DB + smoke-testear.

## Acciones tomadas (esta sesión)

1. **CLAUDE.md regla #8 — `EMPIRICAL-FIRST-BEFORE-PLAN`**: ANTES de proponer cualquier plan >30 min, Cowork DEBE triangular 3 evidencias (E1 código actual + E2 DB query + E3 smoke). Si alguna dice "bug-absent" → STOP, actualizar DEBT a `closed-verified`, pedir nueva instrucción.
2. **`verification_query` schema** ([[../processes/VERIFICATION-QUERY-SCHEMA]]): cada DEBT debe tener un query autovalidable que el sistema pueda correr para detectar drift.
3. **Cron weekly `validate-debts.mjs`**: corre todos los `verification_query` y detecta drift automáticamente cada lunes 8 AM ART. Ver `scripts/vault-tools/validate-debts.mjs`.
4. **Pre-flight check `pre-flight-check.mjs`**: al inicio de cada sesión técnica-producto, ejecuta el validator y bloquea si detecta drift en DEBTs HIGH/CRITICAL. Ver `scripts/vault-tools/pre-flight-check.mjs`.
5. **DEBT `cross-brand-leakage` actualizado**: `status: code-pending-merge → closed-verified`, `closed_by: sprint-73r-helper-utility-business-type`, `verification_query` agregado.

## Acciones pendientes (post-sesión)

- [ ] Aplicar `verification_query` retroactivamente a los ~15 DEBTs prioritarios (`code-pending-merge`, `deployed-pending-empirical-validation`, `open critical|high`).
- [ ] Configurar cron en macOS (launchd) para que `validate-debts.mjs` corra todos los lunes 8 AM ART.
- [ ] Agregar al onboarding de cualquier sesión Cowork técnica: "ejecutar `node scripts/vault-tools/pre-flight-check.mjs` antes de planear".
- [ ] Cerrar / actualizar `DEBT-2026-04-27-agency-overview-cross-brand-leakage` formalmente (commit aparte que transicione status + agregue evidencia).

## Generalización del aprendizaje

El vault de Obsidian es **fuente de verdad de las DECISIONES tomadas y el RAZONAMIENTO**. Pero NO es fuente de verdad del **estado actual del sistema**. El estado actual del sistema vive en:
- El código en `main` (no en branches viejos).
- La DB de prod (no en queries SQL de hace semanas).
- La UX deployada (no en Figma o screenshots viejos).

Cowork (y cualquier dev) debe asumir que el vault tiene **drift inevitable** vs realidad. La defensa contra drift es:
1. **Autovalidación** (`verification_query`).
2. **Triangulación obligatoria pre-plan** (regla #8).
3. **Cron periódico** que detecte drift sin esperar a una sesión humana.

Esto NO es desconfiar del vault. Es reconocer que el vault sirve para **razonar sobre intenciones** y los queries empíricos sirven para **validar el estado actual**. Los dos son complementarios.

## Métrica de éxito

Si en los próximos 30 días Cowork detecta y previene al menos 1 caso similar usando el pre-flight check, esta lesson learned + las 5 medidas implementadas valieron la pena. El threshold subjetivo de Jorge: "que jamás vuelva a pasar el patrón de 'estabamos a punto de perder 4 horas y solo me acordé yo'".

## Referencias

- DEBT que motivó esto: [[../debt/DEBT-2026-04-27-agency-overview-cross-brand-leakage]]
- Schema introducido: [[../processes/VERIFICATION-QUERY-SCHEMA]]
- Regla CLAUDE.md formalizada: regla #8 EMPIRICAL-FIRST-BEFORE-PLAN
- Sprint que silenciosamente cerró el bug: commit `e5ba751` (Sprint 73.R helper utility)
- Sprint que figuraba como "fix planeado" en el DEBT: branch `feat/sprint-72h-multitenancy-routing-context` (NUNCA mergeado, ya no aplica)
- Lesson learned hermana: [[LL-2026-04-30-empirical-branch-state-vs-prompt-assumption]] (mismo patrón, distinto contexto)
