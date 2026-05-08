---
title: "Convenciones frontend webapp-somnosalud — RSC vs client, naming, paths, accesibilidad"
date: 2026-05-08
last_synced_with_vault_reality: 2026-05-08
tags: [concepts, frontend, nextjs, react, conventions, somnosalud]
status: active
related:
  - "[[../architecture/adr/ADR-001-stack-frontend-webapp-somnosalud]]"
  - "[[../architecture/adr/ADR-002-workspace-dependency-clinical-engine]]"
  - "[[../architecture/adr/ADR-003-compliance-gates-en-codigo]]"
  - "[[../sprints/sprint-5-scaffold-webapp-somnosalud/SPRINT-5-SCAFFOLD-WEBAPP-SOMNOSALUD]]"
  - "[[../sprints/sprint-5-5-documentacion-vault/SPRINT-5-5-DOCUMENTACION-VAULT]]"
  - "[[../../../CLAUDE]]"
owner: fabio + cowork
---

# Convenciones frontend `webapp-somnosalud`

> Reglas operativas día a día para escribir código en `packages/webapp-somnosalud/`. Distinto a las ADRs (decisiones únicas con alternativas) — esto es la guía viva que aplica en cada PR.

## 1. RSC vs `'use client'` — cuándo usar cuál

**Default: Server Component (RSC)**. NO escribir `'use client'` en un archivo nuevo a menos que necesites una de estas:

| Necesitás `'use client'` si... | Ejemplo |
|---|---|
| `useState`, `useReducer`, `useEffect`, `useRef`, etc. | Cuestionario interactivo con estado |
| Event handlers (`onClick`, `onChange`, `onSubmit`) | Form con validación inline |
| Browser APIs (`localStorage`, `sessionStorage`, `window`, `document`) | Persistencia client-side Sprint 6 |
| Librerías que solo funcionan en client (ej: `framer-motion`, `react-pdf`) | Animaciones |
| Custom hooks que usan algo de lo anterior | `useConsent()`, `usePersistEval()` |

**NO necesitás `'use client'` si:**
- Solo renderizás props.
- Importás del clinical-engine para ejecutar scoring (es función pura, corre en build/server).
- Renderizás texto, imágenes, links, layouts.
- Usás `<Link>` de Next, `<Image>`, etc.

**Patrón recomendado** — extraer la parte interactiva:

```tsx
// app/eval/isi/page.tsx (Server Component, default)
import { ISIQuestionnaire } from './ISIQuestionnaire';
import { ISI_ITEMS } from 'somnosalud-clinical-engine';

export default function ISIPage() {
  return (
    <main>
      <h1>Insomnia Severity Index</h1>
      <p>Evaluación validada según Bastien et al. 2001.</p>
      <ISIQuestionnaire items={ISI_ITEMS} />
    </main>
  );
}
```

```tsx
// app/eval/isi/ISIQuestionnaire.tsx (Client Component)
'use client';

import { useState } from 'react';
import { scoreISI } from 'somnosalud-clinical-engine';

export function ISIQuestionnaire({ items }: { items: typeof ISI_ITEMS }) {
  const [responses, setResponses] = useState([0, 0, 0, 0, 0, 0, 0]);
  // ... handlers + render
}
```

Server Component descarga props y prerendera HTML. Client Component se hidrata con el estado interactivo. **Bundle final**: solo el `'use client'` viaja al browser.

## 2. Naming de archivos y componentes

| Cosa | Convención | Ejemplo |
|---|---|---|
| Archivos `.tsx` de pages | `page.tsx` (literal, Next App Router) | `app/eval/isi/page.tsx` |
| Archivos `.tsx` de layouts | `layout.tsx` (literal) | `app/eval/layout.tsx` |
| Componentes React | `PascalCase.tsx` | `ISIQuestionnaire.tsx`, `DisclaimerBanner.tsx` |
| Hooks custom | `useCamelCase.ts` | `useConsent.ts`, `usePersistEval.ts` |
| Utilities | `kebab-case.ts` | `format-date.ts`, `calc-edad.ts` |
| Tipos compartidos | `types.ts` o `<area>.types.ts` | `lib/types.ts`, `eval/safety.types.ts` |
| Constantes | `UPPER_SNAKE_CASE` dentro del archivo | `const MIN_AGE = 18;` |

NO mezclar: si una carpeta tiene `ISIQuestionnaire.tsx`, NO crear `isi-questionnaire.tsx` al lado.

## 3. Estructura de carpetas

```
packages/webapp-somnosalud/
├── app/                          ← App Router pages + layouts
│   ├── layout.tsx                ← Root layout (Capa 0 compliance)
│   ├── page.tsx                  ← Welcome (/)
│   ├── globals.css               ← Tailwind base + shadcn tokens
│   ├── disclaimer/page.tsx       ← /disclaimer (Sprint 6)
│   ├── terms/page.tsx            ← /terms (Sprint 6)
│   └── eval/
│       ├── layout.tsx            ← Capa 2 compliance (Sprint 6)
│       ├── profile/page.tsx      ← Capa 3 compliance (Sprint 6)
│       ├── safety/page.tsx       ← Capa 4 compliance (Sprint 7)
│       ├── isi/page.tsx
│       ├── stopbang/page.tsx
│       ├── phq9/page.tsx
│       ├── gad7/page.tsx
│       ├── dass21/page.tsx
│       ├── sleep/page.tsx
│       ├── lab/page.tsx
│       ├── genetics/page.tsx
│       └── results/page.tsx      ← Capa 5 compliance (Sprint 8)
├── components/
│   ├── ui/                       ← shadcn/ui (Button, Card, Form, etc.)
│   ├── compliance/               ← DisclaimerBanner, ConsentCheckbox, AgeGate
│   ├── eval/                     ← ISIQuestionnaire, STOPBangForm, etc.
│   └── shared/                   ← Header, Footer, ProgressBar
├── lib/
│   ├── utils.ts                  ← cn() helper de shadcn
│   ├── persist.ts                ← sessionStorage wrappers (Sprint 6)
│   ├── format-date.ts
│   └── calc-edad.ts
├── hooks/                        ← Custom hooks
│   ├── useConsent.ts
│   └── usePersistEval.ts
├── middleware.ts                 ← Capa 1 compliance (Sprint 6)
├── components.json               ← shadcn config
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── .eslintrc.json
└── package.json
```

**Regla:** todo componente que se usa en >1 page va a `components/<area>/`. Componente que se usa solo en 1 page puede vivir al lado del `page.tsx` (co-located). Refactor cuando aparezca el segundo consumer.

## 4. Paths e imports

**Default: usar alias `@/*`** (apunta al root del package).

```typescript
// ✅ BIEN
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useConsent } from '@/hooks/useConsent';

// ❌ MAL — frágil ante refactors
import { Button } from '../../components/ui/button';
import { Button } from '../../../components/ui/button';
```

**Imports del clinical-engine** — usar el nombre del package, NO path relativo.

```typescript
// ✅ BIEN
import { scoreISI, ISI_ITEMS } from 'somnosalud-clinical-engine';

// ❌ MAL — bypassea workspace dep + transpile
import { scoreISI } from '../../../clinical-engine/src/scoring/isi';
```

**Imports de tipos** — usar `import type` cuando solo se usan como tipos.

```typescript
// ✅ BIEN — el import desaparece en el bundle
import type { ISIResult } from 'somnosalud-clinical-engine';

// Cuando además usás el valor:
import { scoreISI, type ISIResult } from 'somnosalud-clinical-engine';
```

## 5. Accesibilidad mínima

WCAG 2.1 **A mínimo** para pre-launch público (Sprint 9). WCAG 2.1 **AA target Fase 3** ([[../sprints/sprint-5-scaffold-webapp-somnosalud/SPRINT-5-SCAFFOLD-WEBAPP-SOMNOSALUD]] menciona; ver MASTER-PLAN Sprint 32-33).

Reglas día-a-día:

- **Inputs siempre con `<label>` asociado** (no solo placeholder).

  ```tsx
  // ✅ BIEN
  <label htmlFor="dob">Fecha de nacimiento</label>
  <input id="dob" type="date" required />

  // ❌ MAL
  <input type="date" placeholder="Fecha de nacimiento" />
  ```

- **Botones con texto descriptivo o `aria-label`** si son solo iconos.

  ```tsx
  // ✅ BIEN
  <Button aria-label="Cerrar diálogo">
    <X aria-hidden="true" />
  </Button>

  // ❌ MAL
  <Button><X /></Button>
  ```

- **Iconos decorativos:** `aria-hidden="true"`. Iconos informativos (sin texto al lado): `aria-label`.

- **Contraste:** verificar con DevTools Lighthouse antes de mergear. Target Lighthouse Accessibility >85 en pre-launch.

- **Navegación con teclado:** Tab + Enter + Space deben funcionar en flow completo. Verificar manualmente en pre-launch.

- **`role` y `aria-*`:** usar cuando el componente tiene semántica que HTML no expresa.

  ```tsx
  // Banner de disclaimer compliance
  <aside role="alert" aria-label="Aviso médico obligatorio">...</aside>

  // Progress bar
  <div role="progressbar" aria-valuenow={50} aria-valuemin={0} aria-valuemax={100}>
  ```

- **Idioma del root:** `<html lang="es-AR">` (ya seteado en `app/layout.tsx`).

## 6. Comentarios en código

- **Comentarios en español** (idioma del equipo).
- **Docstrings/JSDoc en inglés** cuando aplica (compatibilidad herramientas externas).
- **Comments compliance:** cuando un bloque enforza una regulación, comment explícito con referencia a la Ley/disposición:

  ```typescript
  // Compliance gate Ley 26.529 art. 5: consentimiento informado
  // escrito antes de evaluación clínica. Ver ADR-003 capa 1.
  if (!consent) return redirect('/terms');
  ```

- **Reference a DOI/PMID** cuando el código implementa algoritmo clínico:

  ```typescript
  // ISI cutoffs según Bastien et al. (2001).
  // DOI: 10.1016/S1389-9457(00)00065-4
  const ISI_CUTOFF_MODERATE = 15;
  ```

## 7. Cómo agregar pantalla nueva (paso a paso)

Ejemplo: agregar `/eval/isi` en Sprint 7.

1. **Crear page.tsx** en `app/eval/isi/page.tsx` como Server Component.
2. **Si requiere estado interactivo:** crear componente client co-located.
3. **Importar del clinical-engine** lo que se necesite (`ISI_ITEMS`, `scoreISI`).
4. **Agregar tipos** si son específicos a esta pantalla.
5. **Verificar compliance:**
   - ¿Está bajo `/eval/`? → automáticamente bajo Capa 1 (middleware) + Capa 2 (DisclaimerBanner del layout).
   - ¿Hay safety rules a evaluar? → invocar `evaluateAllSafetyRules` (Capa 4).
6. **Verificar accesibilidad mínima:** labels + botones descriptivos + contraste.
7. **Test E2E** (cuando exista Sprint 13+ Playwright): happy path + safety triggers.
8. **Lint + typecheck antes de mergear:** `pnpm --filter @somnosalud/webapp-somnosalud lint && typecheck`.

## 8. Componentes shadcn nuevos — cómo agregar

Decisión ADR-001: scaffold manual, NO CLI.

1. Ir a [ui.shadcn.com](https://ui.shadcn.com/docs/components) y elegir el componente.
2. Copiar el código del componente al archivo `components/ui/<componente>.tsx`.
3. Si requiere deps nuevas (ej: `@radix-ui/react-dialog`): `pnpm --filter @somnosalud/webapp-somnosalud add <dep>`.
4. Verificar imports relativos del componente: shadcn usa `@/lib/utils` y `@/components/ui/*` — alineado con nuestro setup.
5. Si shadcn proporciona el código en formato CLI (`npx shadcn add`), copiar el output del archivo generado, NO ejecutar el CLI.

## 9. Performance — bundle size

Target hasta Sprint 12:
- **First Load JS** < 150 kB en welcome page.
- **First Load JS** < 250 kB en pantallas con cuestionarios.
- **Lighthouse Performance** > 70 en mobile-first.

Estrategias:
- **Server Components default** (ver §1).
- **Imports tree-shake-friendly:** evitar `import * as ...`.
- **Dynamic imports para componentes pesados** (`React.lazy`, `next/dynamic`):

  ```tsx
  const PdfViewer = dynamic(() => import('@/components/eval/PdfViewer'), {
    ssr: false,
    loading: () => <p>Cargando visor PDF...</p>,
  });
  ```

- **Imágenes con `next/image`** (auto-optimized).
- **Fuentes con `next/font`** (auto-optimized, sin layout shift). Inter ya está cargado en `app/layout.tsx`.

## 10. Linting y formatting

- **`pnpm --filter @somnosalud/webapp-somnosalud lint`** = `next lint --max-warnings=0`. Cero warnings permitidos en commits a `main`.
- Prettier configurado a nivel monorepo (`pnpm format`). Indentación 2 spaces, single quotes, trailing commas. Ver `.editorconfig`.
- **Pre-merge:** lint + typecheck siempre verde (regla [[../processes/QA-CHECKLIST]] §A item 1+3).

---

*Última actualización: 2026-05-08 — versión inicial Sprint 5.5. Actualizar a medida que aparezcan nuevos patrones en Sprints 6-8.*
