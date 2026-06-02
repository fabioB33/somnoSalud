---
title: "HOTFIX 2026-05-26 — Magic link en producción Vercel redirige a localhost"
date: 2026-05-26
detected_by: fabio
severity: critical
status: in-progress
related:
  - "[[../../sprints/sprint-3-vercel-preview/SPRINT-3-VERCEL-PREVIEW]]"
  - "[[../../sprints/sprint-9-a-supabase-client-auth/SPRINT-9-A-SUPABASE-CLIENT-AUTH]]"
tags: [hotfix, vercel, supabase-auth, magic-link, production]
---

# HOTFIX — Magic link prod redirige a localhost:3000

> [!warning] Severidad: Critical
> Bloquea el smoke real de Sprint 3. Sin esto, ningún usuario puede completar login en producción.

## Sintoma

Fabio (`cgc.fboschetti@gmail.com`) probó magic link en `https://somno-salud-webapp-somnosalud.vercel.app/login`:

1. ✅ Email del magic link llegó correctamente.
2. ❌ Click en el link del email → browser abrió en `http://localhost:3000/auth/callback?code=...` en lugar de la URL Vercel.
3. ❌ Error en el sitio (porque localhost no tiene server corriendo).

## Triangulación (3 evidencias)

### E1 — Lectura código actual

`packages/webapp-somnosalud/app/login/actions.ts:36-45`:

```ts
const origin = headers().get('origin');
if (!origin) {
  return { ok: false, error: 'No se pudo determinar la URL de la app.' };
}

const supabase = createClient();
const { error } = await supabase.auth.signInWithOtp({
  email,
  options: {
    emailRedirectTo: `${origin}/auth/callback`,
  },
});
```

El código pasa `emailRedirectTo` dinámico con el `origin` del request header.

### E2 — Smoke HTTP prod

```
GET /login -> 200 (Vercel sirve correctamente)
GET /eval/profile -> 307 a /login?next=%2Feval%2Fprofile (auth gate funciona)
```

El sitio funciona, el problema es específico del email del magic link.

### E3 — Reproducción visual

Fabio reportó screenshot del flow: email llega → click → browser redirige a `localhost:3000` con el code en query string.

## Causa raíz

**Combinación de 2 factores:**

1. **Header `origin` puede llegar vacío** detrás del edge proxy de Vercel en Server Actions, especialmente si el request viene con `same-origin` policy.
2. **Site URL en Supabase Auth está seteado a `http://localhost:3000`** (configuración default heredada de cuando probamos en Sprint 9.A local).

Cuando Supabase recibe `signInWithOtp` con `emailRedirectTo`:
- Si el `redirect_to` está vacío o no matchea ningún Redirect URL allowlisted → usa **Site URL** como fallback.
- En nuestro caso, el `${origin}/auth/callback` resolvió a `${undefined o vacio}/auth/callback` → Supabase usó Site URL → `localhost:3000`.

## Fix (Defense-in-depth: 2 capas)

### Capa 1 — Cambiar Site URL en Supabase (acción Fabio)

1. Abrir [https://supabase.com/dashboard/project/goxdopciwvahrxdeirft/auth/url-configuration](https://supabase.com/dashboard/project/goxdopciwvahrxdeirft/auth/url-configuration).
2. Cambiar **Site URL** de `http://localhost:3000` a `https://somno-salud-webapp-somnosalud.vercel.app`.
3. Save.

Esto fija el fallback de Supabase. Pero **no es suficiente** porque depende del setting del project, y mañana podríamos tener dominio custom sin actualizar esto.

### Capa 2 — Helper `resolveSiteUrl()` con precedencia clara (acción Cowork)

Nuevo `packages/webapp-somnosalud/lib/site-url.ts`:

```ts
export function resolveSiteUrl(opts: { requestOrigin?: string | null } = {}): string {
  // 1. Override explícito
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return normalize(explicit);

  // 2. Vercel production URL (estable)
  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (prod) return `https://${prod}`;

  // 3. Vercel deployment URL (cambia por deploy)
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel}`;

  // 4. Header origin
  const origin = opts.requestOrigin?.trim();
  if (origin) return normalize(origin);

  // 5. Fallback dev
  return 'http://localhost:3000';
}
```

`signInWithOtp` actualizado:
```ts
const requestOrigin = headers().get('origin');
const siteUrl = resolveSiteUrl({ requestOrigin });

await supabase.auth.signInWithOtp({
  email,
  options: { emailRedirectTo: `${siteUrl}/auth/callback` },
});
```

**Vercel define `VERCEL_URL` y `VERCEL_PROJECT_PRODUCTION_URL` automáticamente** en cada deployment — no requiere setearlas a mano. El helper las prioriza sobre el header origin que puede no estar presente.

`.env.example` actualizado documentando `NEXT_PUBLIC_SITE_URL` como override opcional.

## Plan de verificación post-fix

### Paso 1 — Fabio cambia Site URL en Supabase (Capa 1)
Confirmar visual del dashboard tras guardar.

### Paso 2 — Push del fix
- `git push origin main` (canonical org)
- `git push vercel main` (mirror para auto-deploy)
- Esperar ~2 min al re-deploy automático de Vercel.

### Paso 3 — Smoke real magic link
Fabio repite el flow:
1. Abrir `https://somno-salud-webapp-somnosalud.vercel.app/login` en pestaña de incógnito.
2. Ingresar email → enviar.
3. Esperar email.
4. Click link → debería redirigir a `https://somno-salud-webapp-somnosalud.vercel.app/auth/callback?code=...` y luego a `/`.
5. Verificar PublicHeader con email + "Mis resultados" + "Cerrar sesión".

### Paso 4 — Confirmar DB
Cowork verifica que se creó row en `auth.users` + `public.profiles` (último `last_sign_in_at` reciente) vía PostgREST con `SUPABASE_SECRET_KEY`.

## Pendiente post-hotfix

- Cerrar Sprint 3 con evidencias completas del smoke real.
- Update `DEPLOY-WORKFLOW.md` §B con nota del fix y referencia a este hotfix.
- Eventualmente: dominio custom `somnosalud.com.ar` → setear `NEXT_PUBLIC_SITE_URL` en Vercel + agregar a Redirect URLs en Supabase.

## Lecciones aprendidas

- **Vercel + Supabase Auth: NUNCA confiar en `headers().get('origin')`** detrás del edge proxy de Vercel. Usar `VERCEL_PROJECT_PRODUCTION_URL` / `VERCEL_URL` env vars autodefinidas.
- **Site URL en Supabase Auth NO es opcional** — siempre setear al dominio prod real, nunca dejar en `localhost:3000` post primer deploy.
- **Defense in depth:** fix en código (helper) + fix en config (Site URL) cubre el problema desde 2 ángulos. Si una capa falla, la otra previene.
