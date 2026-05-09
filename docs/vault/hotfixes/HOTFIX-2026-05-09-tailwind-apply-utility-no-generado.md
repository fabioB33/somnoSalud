---
title: "HOTFIX 2026-05-09 — Tailwind @apply de utility custom no se generaba (gradient SomnoSalud ausente)"
date: 2026-05-09
last_synced_with_vault_reality: 2026-05-09
tags: [hotfix, webapp-somnosalud, tailwind, css, jit, sprint-6, somnosalud]
status: closed-verified
detected_by: fabio (smoke test localhost post-Sprint 6)
fixed_in_commit: "07f6851"
related:
  - "[[../sprints/sprint-6-compliance-gates/SPRINT-6-COMPLIANCE-GATES]]"
  - "[[../architecture/adr/ADR-001-stack-frontend-webapp-somnosalud]]"
  - "[[../concepts/CONVENCIONES-FRONTEND-WEBAPP]]"
  - "[[../lessons-learned/LL-2026-05-09-tailwind-apply-no-genera-utilities-no-usadas]]"
created: 2026-05-09
---

# HOTFIX 2026-05-09 — gradient SomnoSalud ausente por Tailwind JIT

## TL;DR

Bug visual reportado por Fabio durante smoke test del localhost post-Sprint 6: la webapp tenía fondo gris/transparente en lugar del gradient SomnoSalud (`#1a1a2e → #16213e`). Causa: `@apply bg-somno-gradient` en `globals.css` referenciaba un utility custom de Tailwind que **no se generaba** porque la class no aparecía en ningún archivo JSX/TSX. Fix: reemplazar `@apply` por CSS directo `background: linear-gradient(...)` en el body. Verificado empíricamente en dev y prod build.

## Detección

- **Fecha:** 2026-05-09 mañana.
- **Reportado por:** Fabio levantando dev server localhost para smoke test del flow Sprint 6.
- **Síntoma:** `localhost:300X/` carga el HTML pero el `<body>` no tiene la paleta SomnoSalud — fondo plano sin gradient.
- **Severidad:** alta visual, **0 funcional** — todo el flow compliance gates seguía funcionando, pero la apariencia era deficiente y NO match con la paleta declarada en CLAUDE.md.

## Diagnóstico — triangulación 3 evidencias (regla #8 EMPIRICAL-FIRST)

### E1 — Inspección del HTML servido

```bash
curl -s http://localhost:3006/ | grep -oE '<link[^>]*stylesheet[^>]*>'
# → <link rel="stylesheet" href="/_next/static/css/app/layout.css?v=...">
```

✅ Next.js sí incluía el `<link>` al CSS. No era problema de generación de HTML.

### E2 — Inspección del CSS servido

```bash
curl -s "http://localhost:3006/_next/static/css/app/layout.css?v=..." > /tmp/layout.css
wc -c /tmp/layout.css
# → 30027 bytes (CSS válido)

grep -c "bg-somno-gradient" /tmp/layout.css
# → 0 hits ❌
grep -c "linear-gradient" /tmp/layout.css
# → 0 hits ❌

grep -E "^body" /tmp/layout.css
# → body { margin: 0; line-height: inherit; }   ← Tailwind preflight, sin gradient
```

❌ El CSS NO contenía la regla del gradient. Tailwind generaba 170+ selectores normales (`.flex`, `.text-balance`, `.bg-card`, `.text-somno-accent`) **pero no `.bg-somno-gradient`**.

### E3 — Buscar usos de la clase en el codebase

```bash
grep -rn "bg-somno-gradient" packages/webapp-somnosalud --include="*.tsx" --include="*.ts" --include="*.css"
# → packages/webapp-somnosalud/app/globals.css:39:    @apply min-h-full bg-somno-gradient text-foreground antialiased;
```

❌ La class se usaba **únicamente en globals.css con `@apply`**. NO aparecía en ningún archivo `.tsx`.

## Causa raíz

**Tailwind JIT solo genera utilities custom si la class aparece en algún archivo escaneado** (lista de globs en `content` del config). El config tenía:

```typescript
// tailwind.config.ts
backgroundImage: {
  'somno-gradient': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
},
content: [
  './app/**/*.{ts,tsx}',
  './components/**/*.{ts,tsx}',
  './lib/**/*.{ts,tsx}',
],
```

`backgroundImage.somno-gradient` declara que **podría** existir un utility `.bg-somno-gradient`, pero JIT no lo genera proactivamente. Necesita ver `class="bg-somno-gradient"` en algún `.tsx`. Como solo lo usaba `globals.css` con `@apply`, **JIT nunca lo generó** y el `@apply` falló silenciosamente sin error de build.

**Por qué fue silencioso:** Tailwind 3 con JIT no emite warning cuando un `@apply` referencia una utility no existente — solo lo omite. El build pasa exit 0, lint pasa, type-check pasa. El bug solo se ve **visualmente** al cargar la página.

## Fix aplicado (commit `07f6851`)

`packages/webapp-somnosalud/app/globals.css` — reemplazado `@apply bg-somno-gradient` por CSS directo:

```diff
   body {
-    @apply min-h-full bg-somno-gradient text-foreground antialiased;
+    @apply min-h-full text-foreground antialiased;
+    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
+    background-attachment: fixed;
+    min-height: 100dvh;
     font-feature-settings: 'rlig' 1, 'calt' 1;
   }
```

Agregados de paso:
- `background-attachment: fixed` — gradient cubre toda la viewport, no se repite al scroll.
- `min-height: 100dvh` — viewport units dinámicas para mobile (toolbar fix).

## Verificación empírica post-fix

### Build de producción

```
$ pnpm --filter @somnosalud/webapp-somnosalud build
$ find packages/webapp-somnosalud/.next/static/css -name "*.css"
packages/webapp-somnosalud/.next/static/css/2735252054cf6374.css

$ grep -oE "body\{[^}]+\}" packages/webapp-somnosalud/.next/static/css/2735252054cf6374.css
body{margin:0;line-height:inherit}
body{min-height:100%;color:hsl(var(--foreground));-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;background:linear-gradient(135deg,#1a1a2e,#16213e);background-attachment:fixed;min-height:100dvh;...}
```

✅ Gradient presente en CSS minificado de prod.

### Dev server

```
$ pnpm --filter @somnosalud/webapp-somnosalud dev
$ curl http://localhost:3001/_next/static/css/app/layout.css?v=...
body {
  ...
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  background-attachment: fixed;
  min-height: 100dvh;
  font-feature-settings: 'rlig' 1, 'calt' 1;
}
```

✅ Gradient presente en CSS no-minificado de dev.

### CI cross-monorepo

```
$ pnpm typecheck → Tasks 6/6 successful
$ pnpm lint     → No ESLint warnings
$ pnpm test     → clinical-engine 55/55 tests passing
```

✅ Pipeline limpio.

## Pantallas afectadas (ahora con gradient)

- `/` — welcome.
- `/disclaimer`.
- `/terms`.
- `/eval/profile`.
- `/eval/safety` (placeholder).
- `/eval/menor-no-permitido`.

Toda pantalla bajo `<body>` recibe el gradient via la regla CSS del body.

## Lessons learned derivadas

1. **`@apply` + utility custom = trampa silenciosa**. Si una utility custom solo se referencia desde CSS (no desde JSX), Tailwind JIT no la genera y `@apply` falla silenciosamente. Documentado como [[../lessons-learned/LL-2026-05-09-tailwind-apply-no-genera-utilities-no-usadas]].

2. **Smoke visual no debe saltearse en sprints frontend**. El Sprint 6 cerró `closed-verified` con CI verde + curl tests pero **sin smoke visual**. El bug solo se detectó cuando Fabio levantó el dev server. Sugerencia: agregar al QA-CHECKLIST §B (cuando exista) un item "smoke visual de cada ruta principal en navegador real, NO solo curl".

3. **CSS directo > @apply para reglas globales**. Si necesitás aplicar una regla CSS al body o a un selector global, escribir CSS directo es más explícito y no depende del comportamiento JIT. `@apply` brilla para componentes pequeños donde Tailwind classes son la fuente de verdad.

## Cómo prevenirlo en el futuro

Cuando se necesite usar una utility custom de Tailwind en CSS via `@apply`:

**Opción A — usar la class en JSX al menos una vez:**
```tsx
<div className="hidden bg-somno-gradient" /> {/* dummy para trigger JIT */}
```
👎 hacky.

**Opción B — agregar a `safelist` del config:**
```typescript
// tailwind.config.ts
safelist: ['bg-somno-gradient'],
```
✅ explícito, documenta intención.

**Opción C — escribir CSS directo (recomendado):**
```css
body {
  background: linear-gradient(...);
}
```
✅ simple, sin depender de JIT, fácil de leer.

**Convención post-hotfix:** para SomnoSalud, **opción C** es default cuando el target es un selector global (body, html, layouts). **Opción B** si necesitamos `bg-somno-gradient` desde múltiples lugares. **Opción A** nunca.

---

*Hotfix cerrado 2026-05-09. Commit `07f6851`. Detalle preservado para auditoría regulatoria.*
