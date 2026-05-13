---
title: "Sprint 8.7 — Polish UX final + accesibilidad WCAG 2.1 A baseline"
date: 2026-05-09
last_synced_with_vault_reality: 2026-05-09
tags: [sprint, sprint-8-7, polish, a11y, wcag, ux, fase-1, somnosalud]
status: in-progress
parent_debts: []
related:
  - "[[../sprint-8-6-welcome-expandida/SPRINT-8-6-WELCOME-EXPANDIDA]]"
  - "[[../../concepts/CONVENCIONES-FRONTEND-WEBAPP]]"
  - "[[../../../../CLAUDE]]"
followup_debts: []
owner: fabio + cowork
participants: [fabio, claude-cowork]
created: 2026-05-09
---

# Sprint 8.7 — Polish UX + a11y baseline

> Última iteración de polish visual + accesibilidad WCAG 2.1 A
> baseline antes de pasar a tests E2E (Sprint 13) y backend
> (Sprint 9). Cierra la fase de polish frontend.
>
> Objetivo: que el sitio se sienta production-grade y sea usable
> con teclado / screen reader / `prefers-reduced-motion`.

## Contexto

Sprint 8.5/8.6 cerraron UX cuestionarios + welcome + páginas estáticas. Auditoría empírica del estado actual (2026-05-09):

- ✅ Sin imgs sin alt (no usamos imágenes).
- ✅ Focus-visible ya está en Button/Input/Checkbox.
- 🟡 **13 loading states repetidos** `<p>Cargando datos...</p>` → reemplazar con `<Skeleton>` shadcn.
- 🟡 **1 `window.confirm`** ugly en `/eval/results` ("Empezar de nuevo") → reemplazar con shadcn Dialog.
- 🟡 **17 transitions** sin respeto a `prefers-reduced-motion`.
- 🟡 Sin **Toast** para feedback (acciones futuras como save/error).
- 🟡 Sin **audit Lighthouse** documentado.

## Objetivos

1. **shadcn Skeleton** — componente nuevo + reemplazar 13 loading states.
2. **shadcn Dialog** — reemplazar `window.confirm` en `ResultsContent.tsx`.
3. **shadcn Toast (Sonner)** — sistema de notificaciones para feedback futuro.
4. **`prefers-reduced-motion`** — bloque CSS en `globals.css` que deshabilita animaciones/transiciones cuando el usuario lo configura.
5. **Audit Lighthouse manual** (smoke) — capturar score baseline en `/` y `/eval/profile`. Sub-DEBT si <85 a11y.

**Fuera de scope:**
- Tests E2E Playwright (Sprint 13).
- WCAG 2.1 AA (target Fase 3, requiere screen reader real testing).
- Backend Supabase (Sprint 9).

---

## FASE 0 — Skills cargadas

- **engineering-frontend-developer** — Tailwind + Radix patterns.
- **testing-accessibility-auditor** — WCAG 2.1 A baseline.
- **engineering-minimal-change-engineer** — sprint chico, no expandir.

Auditoría previa (empírica, 2026-05-09):
- `grep window.confirm packages/webapp-somnosalud` → 1 hit.
- `grep "Cargando" packages/webapp-somnosalud/app/eval` → 13 hits repetitivos.
- `grep focus-visible:ring components/ui/*.tsx` → 3 archivos (button, input, checkbox).
- `grep "<img"` → 0 hits (sin imágenes, sin alt issues).
- `grep "animate-\|transition-" .tsx` → 17 hits sin `prefers-reduced-motion`.

---

## FASE 1 — Hipótesis a verificar empíricamente

| # | Hipótesis | Verificación | Si FALSE → implicancia |
|---|---|---|---|
| H1 | shadcn Skeleton (no requiere Radix dep) se puede agregar como Tailwind-only component | typecheck + lint OK | Si necesita dep: agregar antes de continuar |
| H2 | shadcn Dialog con `@radix-ui/react-dialog` reemplaza `window.confirm` sin breaking del flow reset | typecheck + smoke E2E + visual | Si rompe: rollback al confirm nativo |
| H3 | shadcn Toast con `sonner` (lib popular shadcn-compatible) integra sin breaking changes | typecheck + lint | Si peso del bundle es prohibitivo (>20KB): usar custom Toast minimal |
| H4 | `prefers-reduced-motion` con CSS `@media` deshabilita TODAS las animaciones (Tailwind + custom) | DevTools "Emulate CSS prefers-reduced-motion: reduce" + visual check | Si Tailwind ignora: agregar !important global |
| H5 | Lighthouse a11y score >= 85 en `/` y `/eval/profile` post-cambios | manual Lighthouse audit | Si < 85: sub-DEBT detallado |
| H6 | CI cross-monorepo verde post-cambios | `pnpm install/lint/typecheck/test/build` → 5-6/N successful | Investigar |
| H7 | Smoke E2E con curl: todas las rutas siguen HTTP 200 | 22 routes responden | Investigar |

---

## FASE 1 RESULTADOS — Evidencia empírica

> Captura durante FASE 2.

(A completar mientras se ejecuta el sprint.)

---

## FASE 2 LOG — Cambios aplicados

### Commit 1 — shadcn Skeleton + reemplazo 13 loading states + prefers-reduced-motion

- `components/ui/skeleton.tsx` shadcn (Tailwind only).
- Update 12 forms en /eval/* + 1 page (results) para usar `<Skeleton>` en lugar de `<p>Cargando datos...</p>`.
- `globals.css` agrega `@media (prefers-reduced-motion: reduce)` que deshabilita animaciones.

### Commit 2 — shadcn Dialog reemplaza window.confirm + Toast Sonner

- `components/ui/dialog.tsx` shadcn (Radix Dialog).
- `components/ui/sonner.tsx` shadcn (Toaster integrado).
- Update `app/layout.tsx` con `<Toaster />` root.
- Refactor `ResultsContent.tsx` reset: Dialog en lugar de window.confirm.

### Commit 3 — Cierre Sprint 8.7 + audit Lighthouse documentado

- Smoke E2E + capturar score Lighthouse en sprint doc.
- Sub-DEBT si a11y < 85.
- Sprint doc closed-verified.

---

## FASE 3 EVIDENCIAS — Triangulación post-cierre

A capturar al cerrar.

### E1 — Lectura del código

- `ls packages/webapp-somnosalud/components/ui/{skeleton,dialog,sonner}.tsx` confirma 3 nuevos.
- `grep "window.confirm" packages/webapp-somnosalud` → 0 hits.
- `grep "Cargando datos" packages/webapp-somnosalud/app/eval` → 0 hits.

### E2 — CI verde

- `pnpm install/lint/typecheck/test/build` → 5-6/N successful + 55/55 tests.

### E3 — Smoke E2E

- Curl HTTP 200 en todas las routes.
- Sin warnings nuevos de hydration.

---

## FASE 4 CHECKLIST — Sprint Closure

A completar al cierre.

### Bloque A — Sprint doc
- [x] Frontmatter `status: in-progress`.
- [x] FASE 0 + FASE 1.
- [ ] FASE 2 LOG + FASE 3 + FASE 4.

### Bloque B — DEBTs padres
- [x] N/A.

### Bloque C — Sub-DEBTs
- [ ] Posible: `DEBT-lighthouse-a11y-improvements` si score < 85.

### Bloque D — Lesson learned
- [ ] N/A esperado.

### Bloque E — Session note
- [x] N/A <3h.

### Bloque F — CLAUDE.md raíz
- [x] N/A.

### Bloque G — DEBT-RADAR
- [x] N/A.

### Bloque H — MASTER-PLAN
- [ ] Sprint 8.7 → closed-verified.

### Bloque I — Wikilinks bidireccionales
- [ ] Verificar al cierre.

### Bloque K — Filesystem housekeeping
- [x] N/A.

### Bloque J — Reporte ejecutivo
- [ ] Pegado al cierre.

---

*Última actualización: 2026-05-09 — sprint en ejecución.*
