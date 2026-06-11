---
title: "Sprint UX Polish — Refresh visual completo post-feedback Pablo (fea)"
date: 2026-06-11
sprint_number: ux-polish-pablo
status: code-pending-merge
parent_debts: []
related:
  - "[[../sprint-9-c-persist-eval/SPRINT-9-C-PERSIST-EVAL]]"
  - "[[../sprint-3-vercel-preview/SPRINT-3-VERCEL-PREVIEW]]"
  - "[[../../architecture/adr/ADR-003-compliance-gates-en-codigo]]"
tags: [sprint, ux, ui, design-system, framer-motion, fraunces, glass-morphism, pablo-feedback, code-pending-merge]
---

# Sprint UX Polish — Refresh visual completo

> Sprint visual deep — post-feedback Pablo Ferrero ("está muy fea") + Cowork
> aplicando skills UX/UI experto. Dual-accent (purpura cool + gold warm) +
> Fraunces display + glass cards + Framer Motion + 22 pantallas refresh.

## Contexto

Fabio: *"necesito que la embellezcas a la app porque pablo se quejó de que está muy fea, utiliza tus skills de ux/ui experto para darle más belleza"*.

Opción confirmada: **Opción B — Polish medio (6-9h)**, **resultado real ~5h**.

## Cambios — capa por capa

### 1. Design tokens v2.0 (`tailwind.config.ts`)

**Paleta extendida:**
- Cool accent purpura (heredado v1): `#818cf8` + variantes hover/soft/glow.
- **Warm accent gold (NUEVO)**: `#e7c989` — golden lifestyle, anti-clinical alarm. Usado para CTA cálidas, insights, recomendaciones adjuntas, alerts no-críticos.
- Tints semánticos con alpha: `tint-info`, `tint-warn`, `tint-success`, `tint-danger`.
- Backgrounds más profundos: `#0f0f1e` → `#171830` (vs v1 `#1a1a2e` → `#16213e`).

**Elevations canónicas (shadow scale Refactoring UI):**
- `somno-sm/md/lg/xl` — combinan blur + offset.
- `glow-accent` + `glow-warm` — para CTA + score reveal.
- `inset-top` — para glass cards bisel top.

**Tipografía pareada (NUEVO):**
- `font-sans` Inter (default body) — sin cambios.
- `font-display` **Fraunces** (NUEVO) — serif moderna con axes `SOFT` + `opsz`. Para H1 hero, score reveals, pull-quotes editoriales.

**Background gradients:**
- `somno-gradient` actualizado (más profundo).
- `somno-mesh` (NUEVO) — 3 radial-gradients superpuestos.
- `somno-spotlight` (NUEVO) — ellipse para hero.

**Animations + easing:**
- `fade-up`, `mesh-drift`, `pulse-glow` keyframes.
- `transitionTimingFunction.somno-out`: `cubic-bezier(0.16, 1, 0.3, 1)`.

### 2. `globals.css` v2.0

**Mesh background ambient:**
- `body::before` + `body::after` `position: fixed` con 3 radial-gradients + `mesh-drift` animation 18s ease-in-out infinite.
- Respeta `prefers-reduced-motion: reduce`.

**Glass utilities (NUEVO):**
- `.glass-card`: background semi-transparente + `backdrop-blur(12px)` + border + inset top highlight + shadow lg.
- `.glass-card-elevated`: variant más prominente con shadow xl + glow accent sutil.
- `.card-hover-lift`: micro-interaction subtle lift + glow on hover.

**Badge tints (NUEVO):**
- `.badge-tint-info`, `.badge-tint-warm`, `.badge-tint-success` — chips de estado consistentes.

**Section spacing canónico:**
- `.section-y` (py-16 md:py-24), `.section-y-sm` (py-10 md:py-16).

**Print mode preservado** — glass colapsa a card blanco/negro plano en `@media print`.

### 3. Layout root — tipografía pareada

`app/layout.tsx`:
```tsx
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['SOFT', 'opsz'],
});
```

### 4. Motion primitives (NUEVO en `components/motion/`)

- **`FadeIn.tsx`**: wrapper de animación con fade + translate direccional. Respeta `useReducedMotion`. Props: `delay`, `direction`, `distance`, `duration`, `whenInView`.
- **`Stagger.tsx` + `StaggerItem.tsx`**: container que orquesta stagger en hijos. **Exports separados** (no `Stagger.Item` static property) por bug de RSC client manifest en Next 14 prerender.
- **`ScoreReveal.tsx`**: number counter animado con `useSpring` Framer Motion. Cuenta de 0 a `value` con tipografía Fraunces grande + glow + tabular-nums.

### 5. BrandLogo v2 (`components/brand/BrandLogo.tsx`)

Upgrade:
- Wrapper `rounded-xl/2xl/3xl` con glass effect (gradient tint accent + border accent soft + `shadow-inset-top`).
- Prop `glow` (default false) para login/welcome — `shadow-glow-accent`.
- Size `xl` (NUEVO) para hero — wordmark en Fraunces display, icon size-10.
- Moon icon con `drop-shadow` purpura sutil.

### 6. DisclaimerBanner v2 — sin tocar compliance

Texto canónico Ley 26.529 preservado **literal**.

Visual:
- Variant `default` (Capa 2): warm gold tint sutil con icon en badge rounded-xl + backdrop-blur.
- Variant `reinforced` (Capa 5): destructive tint con icon en badge rounded-xl + backdrop-blur.

### 7. StepHeader reusable (`components/eval/StepHeader.tsx`) NUEVO

Reemplaza `<ProgressBar>` + `<h1>` + `<p>` repetidos en cada pantalla del flow `/eval/*`:
- Eyebrow chip "Paso X de Y" con badge tint-info.
- Progress bar gradient cool con percent label tabular-nums.
- H1 en Fraunces display.
- Description opcional.
- Override `eyebrow` para steps opcionales ("Paso 10 de 12 · Opcional").

### 8. Pantallas reescritas (5 key)

| Pantalla | Cambios |
|---|---|
| `/` (welcome) | Hero con BrandLogo xl glow + Fraunces hero + Stagger steps + glass cards + preview score card con storytelling visual + spotlight detrás del hero |
| `/login` | Card glass-elevated centrada con spotlight + BrandLogo xl glow + Mail icon en badge + jerarquía display |
| `/disclaimer` | Tipografía display + glass sections + ítems con dots accent/warm + Alert reforzado con badge icon |
| `/terms` | Glass section única con 7 ítems numerados (badge accent) + jerarquía clara |
| `/eval/profile` | StepHeader reusable (step 1) + FadeIn |
| `/eval/results` | **Hero score con ScoreReveal animado** (ISI principal en Fraunces gigante con glow purpura) + accordion glass divide + RecGroup badges colored por tono (success/warm/info) + IFN card con ArrowRight icon + acciones rounded-full con glow |

### 9. Consistency pass (17 pantallas restantes)

- **10 cuestionarios** (`/eval/{isi,ess,stopbang,phq9,gad7,dass21,sleep,lab,genetics,safety}`): reemplazo ProgressBar+h1+p → StepHeader + FadeIn delay.
- **`/about`**: Hero display + 3 pilares Stagger con badge tints + compliance section glass.
- **`/privacidad`**: Alert info refresh + glass section única + ítems con dots accent/warm.
- **`/mis-resultados`**: Empty state con badge icon + cards glass con ScoreBox display + Stagger animation.
- **`/eval/derivacion-especialista`**: Badge warm + display + FadeIn.
- **`/eval/menor-no-permitido`**: Display + 2 glass sections (Stethoscope info + Phone warm) + Alert info refresh.
- **`/not-found`**: BrandLogo xl glow + Fraunces display + badge accent eyebrow.
- **`PublicHeader`**: Sticky + backdrop-blur-md + border white/[0.06] + buttons rounded-full.
- **`PublicFooter`**: Border white/[0.06] + py-10 (sutil refresh).

### 10. Bug detectado + resuelto

**Build error**: `Could not find module Stagger.tsx#Stagger#Item in React Client Manifest`.

**Causa**: Next.js 14 RSC client manifest no serializa static properties de componentes client (`Stagger.Item` como nested export).

**Fix**: separar `Stagger` y `StaggerItem` como exports nombrados distintos del mismo módulo. Migrar 3 callers (`page.tsx`, `about/page.tsx`, `mis-resultados/page.tsx`) con `sed -i`.

## Quality gates

| Check | Resultado |
|---|---|
| `pnpm typecheck` | ✅ PASS |
| `pnpm build` | ✅ PASS — 25 routes, +83KB First Load JS shared (esperado por Framer Motion) |
| `pnpm test:e2e` | ✅ **20/20 PASS** en 2.4 min |
| Regresión flow E2E | ✅ cero — todos los anchors, ARIA labels, redirects preservados |
| Compliance textos canónicos | ✅ DisclaimerBanner + Terms + Privacy + RecGroup intactos |
| `prefers-reduced-motion` | ✅ respetado en CSS animation + Framer Motion (`useReducedMotion`) |

## Decisiones de diseño documentadas

### D1 — Dual-accent (cool + warm)

**Motivo**: con un solo accent purpura las pantallas se sienten monocromáticas. El warm gold separa visualmente "información clínica" (cool) de "insights / recomendaciones / soft CTA" (warm). En medical UX, sumar un warm sin ir hacia rojo destructive baja la sensación de alarma.

### D2 — Fraunces serif display

**Motivo**: la serif aporta gravitas editorial (sleep medicine — content cuidado, no SaaS tech). Variable axis SOFT + opsz da look premium sin sacrificar legibilidad. Solo en h1/scores — no body (Inter sigue siendo default).

### D3 — Glass cards con backdrop-blur selectivo

**Motivo**: NO aplicar backdrop-blur a todas las cards (performance: cada glass card es composite layer). Solo a las key cards (hero, score, accordion principal). Cards secundarias usan border sutil + background tint sin blur.

### D4 — Mesh ambient con drift de 18s

**Motivo**: el mesh estático se siente sintético. Drift muy lento (18s) da "respirado" sin distraer. Animation se detiene completamente con `prefers-reduced-motion: reduce`.

### D5 — ScoreReveal solo para ISI principal

**Motivo**: animar TODOS los scores genera caos visual. ISI es el principal de la evaluación (índice de severidad del insomnio) — solo ese tiene el "wow moment" con counter animado + tipografía Fraunces gigante + glow. Resto en ScoreCards consistentes pero estáticos.

### D6 — Backwards compat de Stagger

**NO** mantengo `Stagger.Item` static — bug RSC. Migré los 3 callers a `<StaggerItem>` import nombrado. Más clean a futuro.

## Compliance preservada

- Textos canónicos de DisclaimerBanner (default + reinforced), Terms (7 secciones), Privacy (10 puntos), CrisisHotlineCard — **intactos literal**.
- Compliance gates ADR-003 funcionando: Capa 1 middleware + Capa 2 DisclaimerBanner + Capa 3 edad + Capa 4 safety rules + Capa 5 results — todo el flow E2E pasa.
- M.N. Pablo Ferrero 119.783 visible en footer + about + login + disclaimer + terms + results + menor-no-permitido.

## Tiempo invertido

- **Estimado**: 6-9h Cowork.
- **Real**: ~5h Cowork.

## Next steps

- Smoke visual con Pablo + Fabio para validar dirección estética.
- Si Pablo quiere ajustes específicos (paleta, tono, animations on/off), iterar.
- Sprint Resend SMTP (DEBT high) + Sprint 20 agente conversacional (research-pending-approval) siguen pendientes Jorge.

## Files changed

- `tailwind.config.ts` — tokens v2.0
- `app/globals.css` — mesh + glass + utilities
- `app/layout.tsx` — Fraunces
- `app/page.tsx` — welcome reescrita
- `app/login/page.tsx` — login reescrita
- `app/disclaimer/page.tsx` — refresh display
- `app/terms/page.tsx` — refresh display
- `app/about/page.tsx` — refresh display + Stagger
- `app/privacidad/page.tsx` — refresh display
- `app/mis-resultados/page.tsx` — refresh display + Stagger
- `app/not-found.tsx` — refresh display
- `app/eval/{profile,safety,isi,ess,stopbang,phq9,gad7,dass21,sleep,lab,genetics}/page.tsx` — StepHeader
- `app/eval/derivacion-especialista/page.tsx` — refresh display
- `app/eval/menor-no-permitido/page.tsx` — refresh display
- `app/eval/results/page.tsx` + `ResultsContent.tsx` — Hero ScoreReveal + accordion glass
- `components/brand/BrandLogo.tsx` — v2 con glow + xl
- `components/compliance/DisclaimerBanner.tsx` — v2 visual (texto preservado)
- `components/layout/PublicHeader.tsx` — sticky + glass
- `components/layout/PublicFooter.tsx` — refresh border sutil
- `components/eval/StepHeader.tsx` — **NUEVO** reusable
- `components/motion/FadeIn.tsx` — **NUEVO** primitive
- `components/motion/Stagger.tsx` — **NUEVO** + StaggerItem
- `components/motion/ScoreReveal.tsx` — **NUEVO** primitive
- `package.json` + `pnpm-lock.yaml` — Framer Motion 12.40
