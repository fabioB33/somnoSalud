---
title: "QA Checklist — pre-merge / pre-deploy SomnoSalud"
date: 2026-05-08
last_synced_with_vault_reality: 2026-05-08
tags: [process, qa, deploy, quality, somnosalud]
status: active
run: "antes de cada merge a main + antes de cada deploy a Vercel/GH Pages"
related:
  - "[[DEPLOY-WORKFLOW]]"
  - "[[SPRINT-CLOSURE-CHECKLIST]]"
  - "[[../sprints/sprint-2-curar-os-heredado/SPRINT-2-CURAR-OS-HEREDADO]]"
---

# QA Checklist — pre-merge / pre-deploy SomnoSalud

> Reemplaza al QA-CHECKLIST heredado del Pampa Labs Core (que asumía Content Factory + VPS Docker). Este checklist está adaptado a SomnoSalud: clinical-engine + monorepo pnpm + Vercel/GH Pages, con énfasis en compliance clínica y signoff Pablo Ferrero.
>
> Origen: reescritura durante [[../sprints/sprint-2-curar-os-heredado/SPRINT-2-CURAR-OS-HEREDADO]] (2026-05-08), cerrando [[../debt/DEBT-procesos-heredados-content-factory]].

Dos checklists según el tipo de cambio:

- **§A — Cambio en `clinical-engine` (7 items core + signoff Pablo):** scoring, safety rules, recommendations, lab/genetics, references. Es el mínimo no-negociable.
- **§B — Cambio en webapp (placeholder hasta Fase 1):** deploys de `webapp-somnosalud/` o `webapp-conversor-psg/`.

Si algún ítem falla → **NO mergear / NO deployar**, arreglar primero.

---

## §A — Cambio en `clinical-engine` (7 items CORE + signoff Pablo)

> Estos 7 items son el mínimo para mergear cualquier cambio en `packages/clinical-engine/src/`. Aplican a scoring/, safety/, engine/, lab/, references.ts. Si el cambio es en `tests/` o docs internas (`README.md`), bastan items 1-3 + 6-7.

### 1. TypeScript estricto

```bash
pnpm --filter somnosalud-clinical-engine typecheck
```

→ EXIT 0. Zero `any`, zero `@ts-ignore` introducidos sin justificación inline. Zero `as unknown as` sin documentación del por qué.

### 2. Build limpio

```bash
pnpm --filter somnosalud-clinical-engine build
```

→ EXIT 0. `dist/` regenerado. Si la lógica clínica nueva agrega exports, verificar que aparecen en `dist/index.d.ts`.

### 3. Tests pasan + tests nuevos obligatorios

```bash
pnpm --filter somnosalud-clinical-engine test
```

→ EXIT 0 con N tests passing donde N ≥ baseline anterior.

**Tests nuevos obligatorios** si el cambio agrega lógica clínica:
- 1 test de happy path (entrada típica → resultado esperado).
- 1 test de boundary (cutoffs exactos según DOI/PMID, ej: "ISI 14 → subthreshold, 15 → moderate").
- 1 test de error path (entrada inválida → throws con mensaje específico).

Si el cambio toca un instrumento de scoring (ISI, ESS, STOP-BANG, PHQ-9, GAD-7, DASS-21, BMI), los tests deben cubrir TODOS los rangos de severidad declarados en `types.ts`.

**Conteo correcto de tests:** usar el output del runner, NO grep de `describe(`. Ver [[../lessons-learned/LL-2026-05-08-conteo-describe-vs-test-blocks]].

### 4. Referencias DOI/PMID centralizadas

Si el cambio agrega un nuevo algoritmo / cutoff / tratamiento:

```bash
grep -n "doi\|pmid" packages/clinical-engine/src/<archivo-modificado>.ts
```

→ Cada algoritmo / cutoff / recomendación nueva debe estar respaldado por una referencia presente en `packages/clinical-engine/src/references.ts`. Si la referencia no existe ahí, agregarla en el mismo PR.

```typescript
// ✅ CORRECTO
import { REFERENCES } from '../references';
const ISI_CUTOFF_MODERATE = 15; // Bastien 2001, validado en Morin 2011
// Reference: REFERENCES.ISI_BASTIEN_2001 (DOI: 10.1093/sleep/24.1.110)
```

### 5. Safety rules no debilitadas

Si el cambio toca `packages/clinical-engine/src/safety/rules.ts`:

```bash
pnpm --filter somnosalud-clinical-engine test -- safety
```

→ EXIT 0. **NUNCA** un cambio puede hacer que una safety rule `triggered: true` pase a `triggered: false` para los mismos inputs sin justificación clínica documentada.

Verificar en el diff que SAFE-010 (edad <18), SAFE-020 (embarazo), SAFE-021 (lactancia), SAFE-040 (anticoagulantes + melatonina) siguen disparando para los inputs canónicos.

### 6. Git state limpio

```bash
git status
```

→ Solo cambios del sprint. Sin basura de `.obsidian/workspace.json`, sin `.DS_Store`, sin lockfiles temporales (`~$*`), sin archivos de output `dist/`, sin secrets (`.env*` que no sea `.env.example`).

### 7. Vault actualizado al momento del merge

- DEBT padre del cambio: status actualizado siguiendo progression del [[DEPLOY-WORKFLOW]] §C (`open` → `fix-in-progress` → `ready-for-deploy` → `closed-verified` solo con triangulación 3 evidencias post-deploy).
- Sprint doc con FASE marcada (1/2/3/4) según [[SPRINT-CLOSURE-CHECKLIST]].
- Si el cambio falsifica empíricamente una hipótesis del DEBT padre o detecta patrón sistémico: lesson-learned en `docs/vault/lessons-learned/LL-YYYY-MM-DD-<slug>.md`.
- Commit message descriptivo siguiendo conventional commits (`feat:`, `fix:`, `chore:`, `clinical:`, `docs:`).

### 🩺 Signoff clínico de Pablo Ferrero

**Adicional a items 1-7 cuando el cambio toca:**
- `packages/clinical-engine/src/scoring/` (cualquier cutoff o severidad).
- `packages/clinical-engine/src/safety/` (cualquier safety rule).
- `packages/clinical-engine/src/engine/recommendations.ts` (lógica de recomendación).
- `packages/clinical-engine/src/engine/risk-integrator.ts` (red flags + clasificación severe/intermediate/clear).
- `packages/clinical-engine/src/references.ts` (cuando se agrega/modifica referencia).

**Workflow de signoff:**
1. Cowork prepara el cambio + documenta en sprint doc el rationale clínico (qué cambia, por qué, qué evidencia DOI/PMID lo respalda).
2. Pablo recibe screenshot del diff + rationale via WhatsApp.
3. Pablo confirma con quote textual ("OK", "approved", "preferiría que el cutoff sea X en lugar de Y", etc.).
4. Cowork pega el quote textual + fecha + screenshot del WhatsApp en `docs/vault/clinical/scoring-validation/<algoritmo>.md` ANTES del merge.
5. Sin signoff documentado: el cambio queda en branch local + sprint doc en `closure-pending-clinical-signoff`.

**No es opcional ni se puede saltear.** La barrera regulatoria de SomnoSalud (clasificación ANMAT Clase I orientativo) depende de que cada algoritmo tenga signoff médico trazable. Ver [[../clinical/COMPLIANCE-ARGENTINA]] §1 + agent [[../../../.claude/agents/compliance-anmat]].

---

## §B — Cambio en webapp (placeholder Fase 1)

> Este checklist se completa cuando exista código en `packages/webapp-somnosalud/` (Fase 1, Sprint 5+). Hoy los packages son skeleton con scripts noop.
>
> Estructura prevista:

### B.1 Build local

- [ ] `pnpm --filter @somnosalud/webapp-somnosalud build` → EXIT 0
- [ ] Zero warnings TypeScript
- [ ] Bundle size no creció >10% vs último deploy (Vercel reporta)

### B.2 Rutas críticas renderizan

Probar en `pnpm --filter @somnosalud/webapp-somnosalud dev` (Next.js dev server):

- [ ] `/` — Welcome (P0.1)
- [ ] `/disclaimer` — disclaimer médico (P0.2)
- [ ] `/terms` — T&C con consent checkbox (P0.3)
- [ ] `/eval/profile` — datos paciente
- [ ] `/eval/safety` — pregnancy + medication + anticoagulant gates
- [ ] `/eval/isi` — Insomnia Severity Index
- [ ] `/eval/stopbang` — STOP-BANG riesgo apnea
- [ ] `/eval/phq9` — depresión (incluyendo ítem 9 ideación suicida)
- [ ] `/eval/gad7` — ansiedad
- [ ] `/eval/dass21` — depresión + ansiedad + estrés
- [ ] `/eval/sleep` — sleep diary
- [ ] `/eval/lab` — opcional
- [ ] `/eval/genetics` — opcional
- [ ] `/eval/results` — disclaimer obligatorio + recomendaciones + derivación
- [ ] `/dashboard` — historial de evaluaciones del usuario

### B.3 Compliance gates en código (no solo docs)

- [ ] **Disclaimer médico visible** en TODA pantalla de `/eval/results` y en `/dashboard`.
- [ ] **M.N. Pablo Ferrero (119.783)** visible en footer + en disclaimer.
- [ ] **Consentimiento informado** con checkbox NO pre-marcado en `/terms` antes de habilitar `/eval/`.
- [ ] **Verificación edad <18** hard gate en `/eval/profile` (calcular edad desde fecha de nacimiento).
- [ ] **Test E2E (Playwright)** que verifica: usuario sin consent no puede acceder a `/eval/`; usuario <18 redirige a contacto especialista.

### B.4 Responsive mobile-first

DevTools resoluciones:
- [ ] 375 × 667 (iPhone SE) — sin scroll horizontal, CTAs accesibles, formularios usables con teclado mobile.
- [ ] 768 × 1024 (iPad) — layouts de grilla legibles.
- [ ] 1440 × 900 (desktop) — max-width respetado.

### B.5 Accesibilidad básica (WCAG 2.1 A mínimo)

- [ ] Contraste suficiente (testear con DevTools Lighthouse).
- [ ] Inputs con `<label>` asociado (no solo placeholder).
- [ ] Botones con texto descriptivo (no solo iconos sin `aria-label`).
- [ ] Navegación con teclado (Tab + Enter funciona en flow completo).

> Target full WCAG 2.1 AA → Fase 3, ver agent `testing-accessibility-auditor`.

### B.6 Auth flow Supabase

- [ ] Usuario no logueado → `/eval/` redirige a `/login`.
- [ ] Login exitoso → redirige a `/dashboard` o continuación de evaluación parcial.
- [ ] Logout → redirige a `/`.
- [ ] DevTools Network → callback Supabase Auth status 200.
- [ ] DevTools Console → 0 errores ni warnings de gotrue-js.

### B.7 Consola del browser limpia

- [ ] 0 errores en DevTools Console en cada ruta principal.
- [ ] 0 warnings de React (keys, hooks, hydration mismatch).
- [ ] 0 requests fallidos en Network tab.

### B.8 Git hygiene

- [ ] Commit message descriptivo (`feat:`, `fix:`, `clinical:`, `docs:`).
- [ ] `git status` limpio antes del push.
- [ ] Nada de `.env` ni secrets en el diff.

---

## §C — Cambio en webapp-conversor-psg (placeholder Fase 2)

> Se completa cuando exista código TS modular en `packages/webapp-conversor-psg/` (post-refactor del legacy HTML monolítico). Hoy el conversor sigue funcionando 100% en `legacy-v0/index.html`.

### Pre-requisito Fase 2

- [ ] Refactor HTML monolítico → TS modular en `packages/psg-parser/` con tests fixture (PSGs reales anonimizados de los 7 equipos).
- [ ] Engine Hipóxico extraído a `clinical-engine/engine/hypoxic-score.ts`.

### C.1-C.7 (cuando exista)

- C.1 Build (`vite build`) limpio.
- C.2 Parser regression: cada parser pasa contra fixtures conocidos → CSV idéntico a baseline.
- C.3 Engine Hipóxico: para fixture canónico de Pablo, score post-refactor == score legacy.
- C.4 Drag-drop UX OK.
- C.5 ZIP batch download funcional.
- C.6 Git hygiene.
- C.7 Vault actualizado.

---

## Smoke test post-deploy (universal)

Ver [[DEPLOY-WORKFLOW]] §C — Hotfix lifecycle + closed-verified pattern. Aplica para cualquier deploy:

1. **Boot signals** verificados (Vercel deploy log + GH Pages build log).
2. **Smoke endpoint** crítico (curl o request browser con response esperado).
3. **Query MCP `supabase-somnosalud`** sobre tabla target confirmando state esperado (cuando exista).
4. **Dashboard externo** (Sentry issue, Vercel analytics) confirmando evento.

Sin las 3 evidencias → DEBT permanece en `ready-for-deploy`, NO `closed-verified`.

---

## Cross-links

- [[DEPLOY-WORKFLOW]] — proceso de deploy + triangulación 3 evidencias.
- [[SPRINT-CLOSURE-CHECKLIST]] — FASE 4 obligatoria + Bloque K filesystem housekeeping.
- [[TEMPLATE-DEBT]] — template para crear DEBTs cuando se detecta gap durante QA.
- [[../clinical/COMPLIANCE-ARGENTINA]] — checklist regulatorio Pre-launch público.
- [[../../../.claude/agents/compliance-anmat]] — invocar antes de cualquier cambio que toque consent / disclaimer / safety / scoring.

## Referencia histórica

El QA-CHECKLIST anterior (heredado del commit `6f8f6c9`) asumía Content Factory + VPS Docker + sprints viejos (`sprint-meta-rate-limiter-buc-aware`, etc.). Está preservado en git history. La reescritura completa fue trabajo de [[../sprints/sprint-2-curar-os-heredado/SPRINT-2-CURAR-OS-HEREDADO]].

---

*Última actualización: 2026-05-08 — reescrito durante Sprint 2.A para SomnoSalud.*
