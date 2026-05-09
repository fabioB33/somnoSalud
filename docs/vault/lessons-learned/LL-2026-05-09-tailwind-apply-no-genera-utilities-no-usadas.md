---
title: "Tailwind JIT NO genera utility custom referenciada solo via @apply en CSS — usar CSS directo o safelist"
date: 2026-05-09
tags: [lesson-learned, tailwind, css, jit, frontend, sprint-6, hotfix]
detected_during: hotfix-2026-05-09-tailwind-apply-utility-no-generado
applies_to: [todo proyecto Tailwind 3+ JIT con utilities custom + @apply en globals.css/CSS modules]
related:
  - "[[../hotfixes/HOTFIX-2026-05-09-tailwind-apply-utility-no-generado]]"
  - "[[../sprints/sprint-6-compliance-gates/SPRINT-6-COMPLIANCE-GATES]]"
  - "[[../concepts/CONVENCIONES-FRONTEND-WEBAPP]]"
  - "[[../architecture/adr/ADR-001-stack-frontend-webapp-somnosalud]]"
  - "[[../../../CLAUDE]]"
owner: fabio + cowork
---

# LL-2026-05-09 — Tailwind `@apply` con utility custom falla silencioso si no se usa en JSX

## Contexto

Sprint 6 (compliance gates) cerró `closed-verified` el 2026-05-08 con CI verde + curl tests pasando. Pero el 2026-05-09 al levantar localhost para smoke visual, el body de TODAS las pantallas tenía fondo plano gris en lugar del gradient SomnoSalud declarado en `tailwind.config.ts` y aplicado en `globals.css` con `@apply bg-somno-gradient`.

Detalle completo del bug + diagnóstico + fix en [[../hotfixes/HOTFIX-2026-05-09-tailwind-apply-utility-no-generado]].

## Qué pasó

`tailwind.config.ts` declaraba la utility custom:

```typescript
backgroundImage: {
  'somno-gradient': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
},
content: [
  './app/**/*.{ts,tsx}',
  './components/**/*.{ts,tsx}',
  './lib/**/*.{ts,tsx}',
],
```

`app/globals.css` la consumía:

```css
@layer base {
  body {
    @apply min-h-full bg-somno-gradient text-foreground antialiased;
  }
}
```

**Pero ningún archivo `.tsx` usaba `class="bg-somno-gradient"`**.

Tailwind 3 con JIT escanea los archivos en `content` buscando classes literales. Como `.bg-somno-gradient` no aparecía en ningún `.tsx`, **JIT no generó la utility**. El `@apply bg-somno-gradient` falló silenciosamente — sin error de build, sin warning.

Resultado: el body NO tenía gradient. Y `pnpm build`, `pnpm lint`, `pnpm typecheck` todos pasaron exit 0. Bug solo visible al cargar la página en navegador.

## Qué aprendimos

**Tres reglas operativas:**

### Regla 1 — `@apply` con utility custom requiere uso en JSX o safelist

Si declarás una utility custom (`backgroundImage`, `colors`, `spacing`, etc.) en `tailwind.config.ts` y la querés usar via `@apply`:

```typescript
// tailwind.config.ts
extend: {
  backgroundImage: { 'foo': 'linear-gradient(...)' },
}
```

```css
/* globals.css */
.something {
  @apply bg-foo; /* ¿se genera? */
}
```

→ La utility se genera si **alguna** de estas condiciones se cumple:
1. ✅ Una clase `bg-foo` aparece literal en algún archivo del array `content` (típicamente JSX).
2. ✅ La clase está en `safelist` del config.
3. ❌ Solo aparece en CSS — **NO se genera**.

### Regla 2 — Para reglas globales (body, html, layouts), preferir CSS directo

```css
/* ❌ Frágil — depende de que la class aparezca en JSX */
body {
  @apply bg-somno-gradient;
}

/* ✅ Robusto — siempre funciona */
body {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}
```

CSS directo es:
- **Más explícito** (no requiere mental model de Tailwind JIT).
- **No depende del JIT** — cualquier dev sin context Tailwind lo entiende.
- **Refactor-safe** — no se rompe si se refactorea el config.

`@apply` brilla para **componentes pequeños** donde Tailwind classes ya están en el JSX y se quiere reutilizar el set sin repetir.

### Regla 3 — Smoke visual obligatorio en sprints frontend

CI verde + curl tests + typecheck NO detectan bugs visuales. El Sprint 6 cerró con todas esas verificaciones pero el visual estaba roto. Sugerencia: agregar al [[../processes/QA-CHECKLIST]] §B (cuando exista, hoy placeholder) un item **"smoke visual de cada ruta principal en navegador real, NO solo curl"** antes de marcar sprint frontend como `closed-verified`.

Comando canónico para smoke visual durante desarrollo:

```bash
pnpm --filter @somnosalud/webapp-somnosalud dev
# Navegar manualmente:
#  - /
#  - /disclaimer
#  - /terms
#  - /eval/profile (con cookie consent)
#  - /eval/menor-no-permitido
# Verificar paleta + tipografía + spacing visualmente antes de cerrar sprint.
```

## Cómo aplicar a futuros sprints

**Cualquier feature frontend que toque `globals.css` o CSS modules:**

1. Si la regla aplica al body / html / layout global → **CSS directo**, NO `@apply`.
2. Si necesitás una utility custom usable desde JSX → declarar en `tailwind.config.ts` Y usarla al menos una vez en `class="..."` de algún componente.
3. Si necesitás una utility custom usable desde CSS via `@apply` pero NO desde JSX → agregar a `safelist` del config.
4. Antes de cerrar sprint frontend → smoke visual en navegador real, no solo curl.

## Costo del error

- Tiempo perdido: ~30 min de Fabio detectando el bug + diagnóstico + fix + verificación.
- Sprint 6 había sido cerrado `closed-verified` el día anterior. El bug forzó hotfix 24h después.
- Erosión de confianza en "CI verde = sprint funcional". Mitigación: agregar smoke visual al checklist.

## Referencias

- [Tailwind CSS — JIT mode docs](https://tailwindcss.com/docs/upgrade-guide#change-color-palette) (sección "Just-in-Time").
- [Tailwind CSS — safelist option](https://tailwindcss.com/docs/content-configuration#safelisting-classes).
- Bug demostrado en commit anterior `ec1d37c` (Sprint 6 closed).
- Fix en commit `07f6851` (HOTFIX 2026-05-09).
- Detalle hotfix: [[../hotfixes/HOTFIX-2026-05-09-tailwind-apply-utility-no-generado]].

---

*Lección formalizada 2026-05-09 mañana, durante hotfix del Sprint 6.*
