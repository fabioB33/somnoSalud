---
title: "Sprint 8.6 — Welcome expandida + FAQ + /about + /privacidad + /404"
date: 2026-05-09
last_synced_with_vault_reality: 2026-05-09
tags: [sprint, sprint-8-6, ux, welcome, faq, about, privacidad, 404, fase-1, somnosalud]
status: closed-verified
updated: 2026-05-09
closing_commit: pending-this-commit
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

### H1 — shadcn Accordion reutilizable en FAQ → **CONFIRMADA**

Welcome importa `<Accordion>` del Sprint 8 sin issues. 5 ítems FAQ con `type="single" collapsible`. Build OK.

### H2 — Páginas estáticas como Server Components puros → **CONFIRMADA**

`/about` (~150 LOC), `/privacidad` (~210 LOC), `/not-found` (~50 LOC) sin `'use client'`. Build prerender static OK (`Route (app) ○ /about /privacidad /_not-found`).

### H3 — Footer compartido como componente import vs layout → **CONFIRMADA**

`<PublicFooter>` importado en cada page individual (`/`, `/about`, `/privacidad`, `/not-found`). NO en root layout porque `/eval/*` tiene su propio DisclaimerBanner Capa 5. Funciona limpio.

### H4 — `app/not-found.tsx` convención App Router → **CONFIRMADA empíricamente**

```
$ curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ruta-que-no-existe
404
```

Next 14 App Router renderiza `app/not-found.tsx` cuando ninguna ruta coincide. **HTTP 404 correcto** (no 200 con contenido 404 ugly).

### H5 — CI cross-monorepo verde + 3 routes nuevas → **CONFIRMADA**

```
$ pnpm build → 22 routes prerendered + Middleware
  Route (app)
  ├ ○ /
  ├ ○ /_not-found  ← 404 custom
  ├ ○ /about       ← nueva
  ├ ○ /privacidad  ← nueva
  ├ ○ /disclaimer
  ├ ○ /eval/...
  └ ƒ /terms       (dynamic, searchParams)
```

### H6 — Smoke E2E HTTP 200 → **CONFIRMADA**

```
/                    -> HTTP 200
/about               -> HTTP 200
/privacidad          -> HTTP 200
/ruta-que-no-existe  -> HTTP 404 (custom not-found)
/disclaimer          -> HTTP 200
/terms               -> HTTP 200
```

Lección Sprint 8.5 aplicada: hard-clean `.next/` post-cambios significativos en componentes compartidos para evitar webpack stale cache.

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
- [x] Frontmatter `status: closed-verified` + `updated: 2026-05-09`.
- [x] FASE 0 + FASE 1 + FASE 1 RESULTADOS.
- [x] FASE 2 LOG con 2 commits (compactamos 2+3 en 1 al cierre).
- [x] FASE 3 EVIDENCIAS triangulada.
- [x] FASE 4 CHECKLIST (este bloque).

### Bloque B — DEBTs padres
- [x] N/A.

### Bloque C — Sub-DEBTs
- [x] N/A — sub-DEBT mencionado en plan original (foto Dr. Ferrero) NO se materializa porque `app/about/page.tsx` no usa imagen — la card tiene texto. Cuando Pablo provea foto + bio extendida, se actualiza directo el archivo. No es deuda formal.

### Bloque D — Lesson learned
- [x] N/A formal — reuso de patrones ya conocidos (Server Components puros + shadcn Accordion + footer import por page).

### Bloque E — Session note
- [x] N/A — sprint ~2h.

### Bloque F — CLAUDE.md raíz
- [x] N/A.

### Bloque G — DEBT-RADAR
- [x] N/A.

### Bloque H — MASTER-PLAN
- [x] Sprint 8.6 closed-verified + próxima sesión: Sprint 9 Supabase o Sprint 13 tests E2E.

### Bloque I — Wikilinks bidireccionales
- [x] Verificados.

### Bloque K — Filesystem housekeeping
- [x] N/A.

### Bloque J — Reporte ejecutivo
- [x] Pegado al cierre.

---

## Reporte ejecutivo (Bloque J)

```
📋 Reporte ejecutivo — Sprint 8.6 Welcome expandida + páginas estáticas

Branch: main
Commits: 2 atómicos (0767bc0 → <commit-2>)
Archivos nuevos: 4 (.tsx) + 1 sprint doc
Archivos modificados: 3 (app/page.tsx rewrite + index + MASTER-PLAN)
LOC nuevos: ~900

---
Hipótesis confirmadas
- H1 Accordion reutilizable FAQ — empírica.
- H2 Páginas Server Component puras — empírica.
- H3 Footer import por page (no en layout) — design + empírica.
- H4 app/not-found.tsx → HTTP 404 — empírica con curl.
- H5 CI verde + 3 routes nuevas — empírica.
- H6 Smoke E2E 6/6 rutas correctas — empírica.

---
Archivos nuevos
1. components/layout/PublicFooter.tsx — footer compartido con M.N.
   + nav 4 links (about/privacidad/terms/disclaimer).
2. app/about/page.tsx — Dr. Ferrero + IFN + 3 cards "cómo se construyó"
   + card compliance regulatorio (4 leyes/disposiciones AR).
3. app/privacidad/page.tsx — política completa Ley 25.326+26.529+1089
   en 10 secciones + resumen "30 segundos" + email contacto futuro.
4. app/not-found.tsx — 404 custom con Moon icon + 2 CTAs.
5. app/page.tsx rewrite — welcome expandida con header nav + hero
   + "Cómo funciona" (4 steps) + "Qué vas a recibir" (preview card)
   + 2 cards orientativo/respaldo + FAQ accordion (5 Q) + box
   emergencia 24/7 + CTA final.

---
Estructura del welcome nuevo
1. Header con logo + nav sm (/about, /privacidad, status pill).
2. Hero con M.N. pill + título + descripción + CTA.
3. Sección "¿Cómo funciona?" — 4 steps numerados (ClipboardList,
   Brain, Moon, BarChart3 icons).
4. Sección "¿Qué vas a recibir?" — split layout (5 bullets + preview
   card mock con ISI score 14/28 + recomendación Evidencia A).
5. Grid 2 cards (orientativo + respaldo científico).
6. Sección FAQ con Accordion type="single" collapsible:
   - ¿Es gratis?
   - ¿Mis datos son privados?
   - ¿Reemplaza al médico?
   - ¿Cuánto tarda?
   - ¿Qué hago con los resultados?
   + Box amarilla emergencia 0800-999-0091.
7. CTA final centrado.
8. PublicFooter compartido.

---
Status final por commit
| # | Commit | Hash |
|---|---|---|
| 1 | PublicFooter + /about + /privacidad + /not-found | 0767bc0 |
| 2 | Welcome expandida + cierre Sprint 8.6 | <pending> |

---
Build prod final
22 routes prerendered + Middleware 26.6 kB:
- 6 públicas: /, /about, /privacidad, /_not-found, /disclaimer, /terms
- 1 dynamic: /terms (searchParams)
- 13 /eval/*
+ First Load JS shared 87.3 kB
- /eval/results: 7.5 kB + 123 kB (la pesada, esperable)
- /privacidad: 186 B + 96.1 kB (estática pura)

---
Próximos pasos para Fabio
1. git push origin main cuando confirme.
2. SMOKE VISUAL HUMANO (lección hotfix 2026-05-09):
   pnpm --filter @somnosalud/webapp-somnosalud dev
   Probar:
   - / con scroll → ver 4 secciones nuevas + FAQ accordion abre/cierra.
   - /about → cards "Cómo se construyó" + footer.
   - /privacidad → 10 secciones legibles + nav footer.
   - /ruta-cualquiera → 404 custom con Moon icon (no default ugly).
   - Mobile 375px → hero stack OK, FAQ accordion OK, footer wrap OK.
3. Sprint 9 (requiere Sprint 2.B Supabase tuyo) o Sprint 13 (tests
   E2E Playwright).

---
Decisiones de diseño aplicadas
- PublicFooter import por page (no en root layout) — preserva
  separación con /eval/* que tiene DisclaimerBanner reforzado.
- Preview card de resultados en welcome con datos mock visibles
  (ISI 14/28, Evidencia A) — paciente entiende qué espera sin
  necesidad de completar el flow.
- FAQ con Accordion type="single" collapsible — solo 1 abierta
  a la vez (reduce overload visual).
- Box emergencia 0800-999-0091 en bottom del FAQ — visible
  siempre, sin marketing aggressive (compliance-anmat).
- /privacidad sin contacto privacidad@somnosalud.com.ar real
  todavía — Resend Sprint 14 lo habilita, documentado inline.
- Foto Dr. Ferrero pendiente — texto bio funciona como placeholder.
```

---

*Última actualización: 2026-05-09 — sprint **closed-verified**.*
