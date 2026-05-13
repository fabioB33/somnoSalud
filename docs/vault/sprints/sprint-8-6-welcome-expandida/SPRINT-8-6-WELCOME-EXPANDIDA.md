---
title: "Sprint 8.6 — Welcome expandida + FAQ + /about + /privacidad + /404"
date: 2026-05-09
last_synced_with_vault_reality: 2026-05-09
tags: [sprint, sprint-8-6, ux, welcome, faq, about, privacidad, 404, fase-1, somnosalud]
status: in-progress
parent_debts: []
related:
  - "[[../sprint-8-5-ux-cuestionario/SPRINT-8-5-UX-CUESTIONARIO]]"
  - "[[../../clinical/COMPLIANCE-ARGENTINA]]"
  - "[[../../../../.claude/agents/compliance-anmat]]"
  - "[[../../../../CLAUDE]]"
followup_debts: []
owner: fabio + cowork
participants: [fabio, claude-cowork]
created: 2026-05-09
---

# Sprint 8.6 — Welcome expandida + páginas estáticas

> Iteración rápida agregando información que el paciente busca antes
> de empezar la evaluación. Pre-launch público obligatorio según
> [[../../clinical/COMPLIANCE-ARGENTINA]] §"Checklist Pre-launch público":
> política de privacidad publicada + página del director médico
> identificable.

## Contexto

Sprint 8.5 cerró la UX del cuestionario. Pero el **funnel desde welcome** sigue siendo flaco:
- Welcome (Sprint 5/8) tiene hero + 2 cards pequeñas, sin info de "qué voy a recibir" o "es gratis?".
- No hay página `/about` con info detallada del Dr. Ferrero + IFN.
- No hay página `/privacidad` (la política vive inline en `/terms`, no es pública).
- El `/404` es el default feo de Next.

Sprint 8.6 cubre estos gaps **sin tocar el flow de evaluación**.

## Objetivos

1. **Welcome expandida** (`app/page.tsx`):
   - Mantener hero actual.
   - Sección nueva "¿Cómo funciona?" con 3-4 steps numerados visuales.
   - Sección nueva "¿Qué vas a recibir?" con preview de resultados (mock card).
   - FAQ accordion con 4-5 preguntas frecuentes (¿es gratis?, ¿son privados mis datos?, ¿reemplaza al médico?, ¿cuánto tarda?, ¿qué hago con los resultados?).
   - Links a `/about` y `/privacidad`.
2. **`/about`** — info Dr. Ferrero + IFN + breve historia + foto opcional (placeholder).
3. **`/privacidad`** — política de privacidad completa (texto canónico de [[../../clinical/COMPLIANCE-ARGENTINA]] §"Política de privacidad").
4. **`/not-found`** (404 custom) — mensaje amigable + botón "Volver al inicio".
5. **Footer compartido** — link a `/about` + `/privacidad` + `/terms` desde todas las pantallas públicas.

**Fuera de scope:**
- Nuevas pantallas del flow de evaluación.
- Cambios en clinical-engine.
- `/contacto` con form (futuro — requiere Resend Sprint 14).
- Imágenes reales del Dr. Ferrero / IFN (queda como placeholder, foto real cuando Pablo provea).

---

## FASE 0 — Skills cargadas

- **engineering-frontend-developer** — Next.js 14 RSC + Tailwind.
- **engineering-technical-writer** — copy claro + tono adecuado.
- **engineering-minimal-change-engineer** — anti-scope-creep. NO tocar /eval/*.
- **compliance-anmat** — verificar texto canónico de privacidad + M.N. visible en /about.

Lectura previa:
- [[../../clinical/COMPLIANCE-ARGENTINA]] §"Política de privacidad (puntos canónicos)" y §"Disclaimer médico obligatorio".
- `packages/webapp-somnosalud/app/page.tsx` — welcome actual.
- `packages/webapp-somnosalud/components/ui/accordion.tsx` — ya disponible (Sprint 8).

---

## FASE 1 — Hipótesis a verificar empíricamente

| # | Hipótesis | Verificación | Si FALSE → implicancia |
|---|---|---|---|
| H1 | shadcn Accordion (Sprint 8) reutilizable para FAQ en welcome sin issues | Build OK + smoke visual | Si rompe: usar `<details>` HTML5 nativo |
| H2 | Páginas estáticas (`/about`, `/privacidad`, `/not-found`) son Server Components puros, sin estado | Build de prod → static prerender | Si rompe: revisar imports |
| H3 | Footer compartido se puede agregar como componente importado en cada page (no en layout raíz porque rompería `/eval/*` que tiene su propio layout) | Implementación + smoke | Si rompe: agregar `metadata` route group para públicas |
| H4 | `not-found.tsx` en app root es la convención canónica de Next 14 App Router para 404 custom | Visitar URL inexistente → ver custom 404 | Si falla: revisar config |
| H5 | CI cross-monorepo verde + 3 routes nuevas (`/about`, `/privacidad`, 404 implicit) | `pnpm build` → 22 routes detectadas | Investigar |
| H6 | Smoke E2E con curl: todas las páginas nuevas HTTP 200 | curl + 200 OK | Iterar |

---

## FASE 1 RESULTADOS — Evidencia empírica

> Captura durante FASE 2.

(A completar mientras se ejecuta el sprint.)

---

## FASE 2 LOG — Cambios aplicados

### Commit 1 — Footer + páginas estáticas (`/about`, `/privacidad`, `/not-found`)

- `components/layout/PublicFooter.tsx` (Server Component compartido).
- `app/about/page.tsx`.
- `app/privacidad/page.tsx`.
- `app/not-found.tsx` (404 custom).
- Sprint doc + index + MASTER-PLAN.

### Commit 2 — Welcome expandida con secciones y FAQ

- `app/page.tsx` rewrite: hero + "Cómo funciona" + "Qué vas a recibir" + FAQ Accordion + links footer.

### Commit 3 — Cierre Sprint 8.6 + smoke E2E

- Sprint doc → `closed-verified`.
- MASTER-PLAN + index actualizados.

---

## FASE 3 EVIDENCIAS — Triangulación post-cierre

A capturar al cerrar.

### E1 — Lectura del código

- `find packages/webapp-somnosalud/app -name "page.tsx" -path "*/about/*" -o -path "*/privacidad/*"` muestra páginas nuevas.
- `ls packages/webapp-somnosalud/app/not-found.tsx`.

### E2 — CI verde + smoke

- `pnpm install/lint/typecheck/test/build` → 5-6/N successful + 55/55 tests.
- `pnpm build` → ~22 routes prerendered.
- Smoke con curl: `/`, `/about`, `/privacidad`, `/nada-asi` (404) → status correctos.

### E3 — Vault consistente

- Sprint 8.6 closed-verified.
- index + MASTER-PLAN actualizados.

---

## FASE 4 CHECKLIST — Sprint Closure

A completar al cierre.

### Bloque A — Sprint doc
- [x] Frontmatter `status: in-progress`.
- [x] FASE 0 + FASE 1.
- [ ] FASE 2 LOG con 3 commits.
- [ ] FASE 3 EVIDENCIAS.
- [ ] FASE 4 CHECKLIST.

### Bloque B — DEBTs padres
- [x] N/A.

### Bloque C — Sub-DEBTs
- [ ] Probable: `DEBT-imagenes-dr-ferrero-pendiente` (foto + bio real cuando Pablo provea).

### Bloque D — Lesson learned
- [ ] Considerar al cierre.

### Bloque E — Session note
- [x] N/A — sprint <3h.

### Bloque F — CLAUDE.md raíz
- [x] N/A.

### Bloque G — DEBT-RADAR
- [x] N/A.

### Bloque H — MASTER-PLAN
- [ ] Sprint 8.6 → closed-verified.

### Bloque I — Wikilinks bidireccionales
- [ ] Verificar al cierre.

### Bloque K — Filesystem housekeeping
- [x] N/A.

### Bloque J — Reporte ejecutivo
- [ ] Pegado al cierre.

---

*Última actualización: 2026-05-09 — sprint en ejecución.*
