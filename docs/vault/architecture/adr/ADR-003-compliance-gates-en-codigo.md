---
title: "ADR-003 — Compliance gates en código (disclaimer + consent + verificación edad + safety + robots noindex)"
date: 2026-05-08
last_synced_with_vault_reality: 2026-05-08
tags: [adr, architecture, compliance, anmat, ley-25326, ley-26529, somnosalud, accepted]
status: accepted
related:
  - "[[../../sprints/sprint-5-scaffold-webapp-somnosalud/SPRINT-5-SCAFFOLD-WEBAPP-SOMNOSALUD]]"
  - "[[../../sprints/sprint-5-5-documentacion-vault/SPRINT-5-5-DOCUMENTACION-VAULT]]"
  - "[[ADR-001-stack-frontend-webapp-somnosalud]]"
  - "[[../../clinical/COMPLIANCE-ARGENTINA]]"
  - "[[../../../../.claude/agents/compliance-anmat]]"
  - "[[../../../../CLAUDE]]"
deciders: [fabio, claude-cowork, pablo-ferrero (signoff conceptual implícito)]
created: 2026-05-08
---

# ADR-003 — Compliance gates en código

## Status

**accepted** (2026-05-08, Sprint 5.5 — formaliza patrón aplicable Sprint 6+)

## Contexto

[[../../clinical/COMPLIANCE-ARGENTINA]] lista 17 obligaciones regulatorias derivadas de Ley 25.326 + Ley 26.529 + Disposición ANMAT 18/2017. Hoy todas están **declaradas en docs**, ninguna **implementada en código**. Cuando arranque Sprint 6 (Pantallas P0 compliance gates), hay que decidir **dónde** y **cómo** se enforzan los gates en el flow Next.js.

Sin esta ADR, cada developer (yo en Sprint 6, eventualmente Fabio o nuevos devs) podría implementar los gates en lugares distintos (middleware, layout, page, server action, client component) → drift compliance + inconsistencias.

Pre-requisito CRÍTICO antes de pre-launch público: que un **auditor regulatorio** pueda hacer `grep` y ver dónde está cada gate en el código.

## Decisión

Los **gates de compliance se implementan como capas concéntricas**, de afuera hacia adentro, cada una bloqueante:

```
┌──────────────────────────────────────────────────────────────┐
│  CAPA 0 — robots: noindex/nofollow en metadata (Sprint 5)    │  Aplica HASTA validación clínica externa
├──────────────────────────────────────────────────────────────┤
│  CAPA 1 — middleware.ts (Sprint 6+)                          │  Bloquea /eval/* sin consent
│  ▼                                                            │
│  CAPA 2 — layout /eval/layout.tsx (Sprint 6+)                │  Renderiza disclaimer obligatorio en TODA pantalla
│  ▼                                                            │
│  CAPA 3 — page /eval/profile/page.tsx (Sprint 6+)            │  Verificación edad <18 hard gate
│  ▼                                                            │
│  CAPA 4 — page /eval/safety/page.tsx (Sprint 7+)             │  Safety rules SAFE-010..040 enforced
│  ▼                                                            │
│  CAPA 5 — page /eval/results/page.tsx (Sprint 8+)            │  Disclaimer reforzado + M.N. visible + recurso emergencia
└──────────────────────────────────────────────────────────────┘
```

Reglas operativas:

1. **Cada capa documenta qué bloquea y por qué** (comment en el archivo + referencia a Ley/regulación).
2. **Cada capa tiene test E2E** (Sprint 13+) que verifica el bloqueo.
3. **Ningún componente bypassa una capa** — si parece necesario, abrir DEBT + invocar `compliance-anmat`.
4. **Estado de consent vive en `sessionStorage`** Sprint 6, migra a Supabase tabla `evaluations.consent_given_at` Sprint 11+.

## Capa 0 — `robots: noindex/nofollow`

**Implementado en Sprint 5** ([app/layout.tsx](../../../../packages/webapp-somnosalud/app/layout.tsx)):

```typescript
export const metadata: Metadata = {
  // robots: noindex hasta validación clínica externa + compliance pre-launch público.
  robots: {
    index: false,
    follow: false,
  },
};
```

**Por qué:** ANMAT puede inspeccionar dominios de salud digital indexados en Google. Si SomnoSalud aparece en búsquedas antes de tener disclaimer + M.N. + consent visible, hay riesgo de clausura preventiva. El `noindex` impide indexación accidental.

**Cuándo revertir:** post-Sprint 8 + signoff Pablo Ferrero + checklist Pre-launch público completo (ver [[../../clinical/COMPLIANCE-ARGENTINA]] §"Checklist Pre-launch público").

## Capa 1 — Middleware

**A implementar Sprint 6** (`packages/webapp-somnosalud/middleware.ts`):

```typescript
import { NextRequest, NextResponse } from 'next/server';

// Compliance gate: rutas /eval/* requieren consent informado previo.
// Verificación basada en cookie `somno_consent_v1` (Sprint 6 sessionStorage,
// Sprint 11+ migra a JWT Supabase).
export function middleware(request: NextRequest) {
  const isEvalRoute = request.nextUrl.pathname.startsWith('/eval');
  if (!isEvalRoute) return NextResponse.next();

  const consent = request.cookies.get('somno_consent_v1');
  if (!consent || consent.value !== 'accepted') {
    const url = request.nextUrl.clone();
    url.pathname = '/terms';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/eval/:path*'],
};
```

**Razón:** middleware corre **antes** que cualquier page, en edge runtime. Es la capa más externa que puede bloquear acceso. Si alguien navega directo a `/eval/isi` sin pasar por `/terms`, middleware redirige.

## Capa 2 — Layout `/eval/layout.tsx`

**A implementar Sprint 6** (`packages/webapp-somnosalud/app/eval/layout.tsx`):

```tsx
import { DisclaimerBanner } from '@/components/compliance/DisclaimerBanner';

// Compliance gate: TODA pantalla bajo /eval/* renderiza disclaimer obligatorio
// en posición visible (Ley 26.529 + Disposición ANMAT 18/2017).
// El componente DisclaimerBanner contiene texto canónico + M.N. Pablo Ferrero.
export default function EvalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DisclaimerBanner />
      <main>{children}</main>
    </>
  );
}
```

**Componente `DisclaimerBanner`** (a crear Sprint 6, en `components/compliance/`):

```tsx
export function DisclaimerBanner() {
  return (
    <aside
      role="alert"
      aria-label="Aviso médico obligatorio"
      className="border-b border-destructive/40 bg-destructive/10 px-4 py-3 text-sm"
    >
      <strong>⚠️ Importante:</strong> Esta evaluación es{' '}
      <strong>orientativa</strong> y NO reemplaza la consulta médica.
      Las recomendaciones deben ser validadas por un profesional de la
      salud antes de implementarlas. Director médico responsable:{' '}
      <strong>Dr. Pablo Ferrero — M.N. 119.783</strong>.
    </aside>
  );
}
```

**Razón:** `app/eval/layout.tsx` se renderiza en **TODA** ruta bajo `/eval/*` sin posibilidad de override por page individual. Garantiza el disclaimer visible en pantalla.

## Capa 3 — `/eval/profile` verificación edad

**A implementar Sprint 6** (`app/eval/profile/page.tsx`):

```tsx
'use client';

// Compliance gate: bloqueo hard de menores <18 años.
// Razón: SAFE-010 del clinical-engine + decisión clínica Pablo Ferrero.
// Menor → redirige a contacto especialista, NO permite evaluación auto.

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [dob, setDob] = useState('');
  const router = useRouter();

  const calcularEdad = (dobIso: string): number => {
    const today = new Date();
    const birth = new Date(dobIso);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const edad = calcularEdad(dob);
    if (edad < 18) {
      router.push('/eval/menor-no-permitido');
      return;
    }
    // ... continuar al siguiente paso
  };

  return <form onSubmit={onSubmit}>{/* ... */}</form>;
}
```

**Razón:** verificación calculando edad desde fecha de nacimiento, NO solo "ingrese su edad" (que un usuario podría falsificar trivialmente). El gate redirige a una pantalla de contacto con especialista en lugar de permitir evaluación auto-administrada.

## Capa 4 — Safety rules `/eval/safety`

**A implementar Sprint 7** (`app/eval/safety/page.tsx`):

```tsx
'use client';

import { evaluateAllSafetyRules } from 'somnosalud-clinical-engine';

// Compliance gate: ejecuta SAFE-010 a SAFE-040 del clinical-engine.
// Si triggered: bloquea o restringe el flow según el action de cada rule.

const safetyEval = evaluateAllSafetyRules({ /* inputs */ });

if (safetyEval.severity === 'block') {
  // Mostrar pantalla de derivación a especialista.
  return <DerivacionEspecialista rule={safetyEval} />;
}

if (safetyEval.severity === 'restrict') {
  // Mostrar warnings pero permitir continuar.
}
```

**Razón:** las safety rules viven en `clinical-engine/src/safety/rules.ts` con tests. La webapp **invoca** las rules, NO las re-implementa. Single source of truth.

## Capa 5 — Results `/eval/results`

**A implementar Sprint 8** (`app/eval/results/page.tsx`):

- Disclaimer **reforzado** en top de la página (no solo el banner del layout).
- M.N. Pablo Ferrero visible al lado del nombre del producto.
- **Detección automática de PHQ-9 ítem 9 ≥1** (ideación suicida) → renderizar **antes** que el resto: recurso de emergencia 24/7 línea 135 (Salud Mental gratis 0800-999-0091, suicidio 135).
- Recomendaciones siempre con flag "consultar con médico antes de implementar".
- Botón "Imprimir / Exportar PDF" para que paciente lleve a consulta.
- Botón "Eliminar mi evaluación" (Ley 25.326 derecho de supresión).

## Alternativas consideradas

### Alternativa 1 — Gates en cada page individual (no en layout)

- **Pros:** flexibilidad por pantalla.
- **Contras:** facilísimo olvidar el disclaimer en una pantalla nueva. Auditor regulatorio tendría que revisar 12 archivos para verificar compliance.
- **Por qué no:** layouts segmentation de Next.js App Router es exactamente para esto. Usarlo.

### Alternativa 2 — Gates en server actions (no en middleware)

- **Pros:** server-side, no bypassable.
- **Contras:** middleware ya es server-side y corre antes. Y el flow inicial es client-side (sessionStorage) hasta Sprint 11+.
- **Por qué no:** middleware es la capa correcta para este nivel de bloqueo.

### Alternativa 3 — Gates como guards en componentes (HOC pattern)

```tsx
<RequireConsent>
  <EvalISI />
</RequireConsent>
```

- **Pros:** compositional, React-idiomatic.
- **Contras:** runs client-side, después del bundle download. Si hay un bug en RequireConsent, contenido sensible puede flickering antes del redirect.
- **Por qué no:** middleware bloquea SSR antes que el componente exista. Más seguro.

## Consecuencias

### Positivas

- **Auditabilidad:** auditor regulatorio puede `grep -r "compliance gate" packages/webapp-somnosalud/` y encontrar todas las capas.
- **Imposibilidad de bypass:** middleware + layout son enforced por Next.js, no por código de aplicación.
- **Consistencia:** disclaimer visible en TODAS las pantallas `/eval/*` sin necesidad de copy-paste.
- **Test E2E directo:** Playwright puede verificar cada capa con un flow de "intentar acceder a /eval/isi sin consent → debe redirigir".

### Negativas

- **Acoplamiento a Next.js App Router:** si en futuro se cambia de framework, hay que reimplementar las capas. Aceptable — Next.js no se va a cambiar pronto.
- **5 capas = 5 puntos de verificación:** auditoría compliance pre-launch debe revisar las 5. Mitigación: `compliance-anmat` agent tiene checklist específica.
- **Performance:** middleware corre en cada request. Costo: ~5ms en edge runtime. Despreciable.

### Neutras

- **Cookie `somno_consent_v1`:** primera versión. Cuando cambie el texto del consentimiento, bumping a `v2`, etc. — usuarios deben re-aceptar (regla de Ley 26.529).

## Cómo revertir / cambiar

### Cuando se revierte `robots: noindex` (post-Pre-launch checklist):

1. Pablo Ferrero confirma checklist Pre-launch público completo.
2. Editar `app/layout.tsx`: cambiar `robots: { index: false, follow: false }` por `robots: { index: true, follow: true }` (o eliminar la prop, default es indexable).
3. Crear sub-DEBT `DEBT-monitorear-google-search-console` para verificar que ANMAT no marque issues.
4. Crear ADR nueva con `supersedes: ADR-003` (parcial, solo Capa 0).

### Si se decide migrar de cookie consent → JWT Supabase (Sprint 11+):

1. Crear ADR nueva `ADR-NNN-consent-jwt-supabase` con `supersedes: ADR-003` (parcial).
2. Actualizar `middleware.ts` para verificar JWT en lugar de cookie.
3. Migration script para usuarios con cookie activa al momento del cutover.

## Referencias

- [[../../clinical/COMPLIANCE-ARGENTINA]] — checklist Pre-launch público + 17 obligaciones regulatorias.
- [[../../../../.claude/agents/compliance-anmat]] — agent canónico AR/ANMAT a invocar antes de cada feature compliance-relevant.
- [Ley 25.326 — BORA](https://www.boletinoficial.gob.ar/detalleAviso/primera/4322648/20001102)
- [Ley 26.529 — BORA](https://www.boletinoficial.gob.ar/detalleAviso/primera/4413728/20091120)
- [Disposición ANMAT 18/2017](https://www.argentina.gob.ar/normativa/nacional/disposici%C3%B3n-18-2017-anmat)
- [Next.js Middleware Docs](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Next.js Layouts Segmentation](https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates)
- [app/layout.tsx Sprint 5](../../../../packages/webapp-somnosalud/app/layout.tsx) — donde se aplicó Capa 0.

---

*Última actualización: 2026-05-08 — accepted en Sprint 5.5. Capas 1-5 a implementar Sprint 6-8.*
