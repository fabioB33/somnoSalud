---
type: lesson-learned
date: 2026-05-06
sprint: ["78"]
severity: medium
category: oauth-integrations-pattern
tags:
  - oauth
  - google-ads
  - meta-ads
  - tiktok-ads
  - linkedin-ads
  - stripe-connect
  - integrations
  - auto-discovery
  - account-resolution
  - reusable-pattern
related_sprints:
  - SPRINT-78-GOOGLE-CUSTOMER-ID-AUTODISCOVERY
  - SPRINT-77-GOOGLE-OAUTH-CALLBACK-STATE-BUG
related_lessons:
  - LL-2026-05-06-oauth-flows-tienen-4-capas-de-gotchas
related_rules:
  - "regla #8 EMPIRICAL-FIRST-BEFORE-PLAN — capa 3 customer-id discovery"
---

# LL-2026-05-06 — Pattern listAccessibleCustomers para auto-discovery account_id post-OAuth

## Resumen

Cuando integramos un nuevo provider OAuth (Meta, Google, TikTok, LinkedIn, Stripe Connect, Twitter/X Ads, Pinterest, Snapchat), el callback que persiste el `refresh_token` debe AUTOMÁTICAMENTE descubrir y persistir el `account_id` correspondiente. NO dejar `ad_account_id = NULL` y "que el cron lo resuelva después" — eso introduce un paso silencioso que rompe el flow self-service.

Cada provider tiene un endpoint canónico para listar las cuentas/accounts/customers accesibles bajo el OAuth grant. Este LL documenta el pattern reutilizable de Sprint 78 (Google) para que aplique a Meta, TikTok, LinkedIn, etc. cuando sea su turno.

## Caso real — Sprint 78 Google Ads

### Bug detectado 2026-05-06
Post Sprint 77 fix, Lure tenía OAuth tokens en `brand_integrations` pero `ad_account_id = NULL`. El cron `metrics-sync.service.ts:395-419` skipea el brand por guard `if (!integ?.ad_account_id) return null`.

### Causa raíz
El callback OAuth solo hacía `tokenExchange → saveIntegration({refreshToken, accessToken})`. NO descubría qué cuenta(s) Google Ads estaban accesibles bajo ese grant.

### Fix aplicado
Agregar llamada a `customers:listAccessibleCustomers` post-tokenExchange. Persistir el customer_id resuelto como `ad_account_id`. Manejar N=0/N=1/N>1 explícitamente.

## Pattern universal — adaptable a cualquier provider OAuth

```typescript
// Step 1 — service layer: helper defensivo que retorna [] en cualquier error
export async function listAccessibleAccounts(accessToken: string): Promise<string[]> {
  const apiToken = process.env.PROVIDER_DEVELOPER_TOKEN ?? ''
  if (!apiToken) {
    logger.warn({ scope: 'provider-listAccessibleAccounts', reason: 'developer_token_missing' }, '...')
    return []
  }
  if (!accessToken) {
    logger.warn({ scope: 'provider-listAccessibleAccounts', reason: 'access_token_missing' }, '...')
    return []
  }

  try {
    const res = await fetch(`${PROVIDER_BASE_URL}/me/accounts`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        // Headers específicos del provider:
        // - Google: 'developer-token'
        // - Meta: ninguno extra
        // - TikTok: 'Access-Token'
        // - LinkedIn: 'X-Restli-Protocol-Version'
      },
    })
    if (!res.ok) {
      logger.warn({ scope: 'provider-listAccessibleAccounts', status: res.status }, '...')
      return []
    }
    const data = await res.json()
    return parseProviderResponse(data) // específico por provider
  } catch (err) {
    logger.warn({ scope: 'provider-listAccessibleAccounts', err: (err as Error).message }, '...')
    return []
  }
}

// Step 2 — callback OAuth: lógica N=0/N=1/N>1 + persistir
let adAccountId: string | null = null
let discoveryMetadata: Record<string, unknown> = {}

if (accessToken) {
  let accessibleAccounts: string[] = []
  try {
    accessibleAccounts = await listAccessibleAccounts(accessToken)
  } catch (err) {
    logger.warn({ ... }, 'unexpected throw — refresh_token igual se persiste')
    discoveryMetadata = { discovery_error: (err as Error).message }
  }

  if (accessibleAccounts.length === 1) {
    adAccountId = accessibleAccounts[0]
  } else if (accessibleAccounts.length > 1) {
    adAccountId = accessibleAccounts[0]
    discoveryMetadata = {
      available_accounts: accessibleAccounts,
      selected_strategy: 'first',
    }
    // Selector UI futuro habilita user a cambiar.
  } else if (Object.keys(discoveryMetadata).length === 0) {
    discoveryMetadata = { discovery_warning: 'no_accessible_accounts' }
  }
}

await saveIntegration({
  brandId,
  platform,
  refreshToken: tokenData.refresh_token,
  accessToken: tokenData.access_token,
  adAccountId,
  ...(Object.keys(discoveryMetadata).length > 0 ? { metadata: discoveryMetadata } : {}),
})
```

## Mapping endpoints por provider

| Provider | Endpoint | Auth headers | Response shape |
|---|---|---|---|
| **Google Ads** | `GET /v17/customers:listAccessibleCustomers` | `Authorization: Bearer <token>` + `developer-token: <dev>` | `{ resourceNames: ["customers/<id>"] }` |
| **Meta Ads** | `GET /v23.0/me/adaccounts` | `Authorization: Bearer <token>` | `{ data: [{ id: "act_<id>", name }] }` |
| **TikTok Ads** | `GET /open_api/v1.3/oauth2/advertiser/get/` | `Access-Token: <token>` | `{ data: { list: [{ advertiser_id, advertiser_name }] } }` |
| **LinkedIn Ads** | `GET /v2/adAccountUsers?q=authenticatedUser` | `Authorization: Bearer <token>` + `X-Restli-Protocol-Version: 2.0.0` | `{ elements: [{ account: "urn:li:sponsoredAccount:<id>" }] }` |
| **Stripe Connect** | `GET /v1/accounts` | `Authorization: Bearer <stripe_secret>` | `{ data: [{ id: "acct_<id>" }] }` |
| **Pinterest Ads** | `GET /v5/ad_accounts` | `Authorization: Bearer <token>` | `{ items: [{ id, name }] }` |
| **Snapchat Ads** | `GET /v1/me/organizations` | `Authorization: Bearer <token>` | `{ organizations: [{ organization: { id, name } }] }` |
| **Twitter/X Ads** | `GET /11/accounts` | OAuth 1.0a header | `{ data: [{ id, name }] }` |

## Reglas defensivas obligatorias (sin atajos — regla #1 Pampa Labs)

1. **NUNCA crashear el callback OAuth.** Si `listAccessibleAccounts` falla por cualquier razón (developer token missing, 401, 403, 5xx, network timeout, response format inesperado), capturar internamente y retornar `[]`. El `refresh_token` SIEMPRE debe persistir — no perder el OAuth grant del user.

2. **Loggear con `scope` estructurado.** Sentry + Pino agradecen poder filtrar por `scope: 'provider-listAccessibleAccounts'`. Incluir `reason` o `status` o `err` según el caso para diagnóstico downstream.

3. **N=0 NO es error fatal.** El user puede tener OAuth válido pero cero accounts (developer token missing en backend, user sin permisos en el provider, app no aprobada). Persistir igual con `metadata.discovery_warning`. Permite reintentar sin re-OAuth.

4. **N>1 → primer account + lista en metadata.** Selector UI viene después como sub-DEBT. NO bloquear el flow self-service esperando feature de UI.

5. **Filtrar formato inesperado defensivo.** Cada provider documenta el formato pero a veces cambian. Validar regex/schema de los IDs antes de persistir.

## Anti-patterns a evitar

| Anti-pattern | Por qué está mal |
|---|---|
| "El cron lo resolverá la primera vez que sincronice" | Rompe self-service: requiere intervención humana cuando el cron falla por developer_token o se descubre que hay N>1 cuentas. |
| "Hardcodear el customer_id mientras tanto" | Hardcoding (rompe regla #2 Pampa Labs). Solo desplaza el problema. |
| "Pedirle al user que copie su account_id manualmente" | UX terrible. El user puede equivocarse o copiar formato incorrecto. Self-service /mo se rompe. |
| "Throw en el callback si N=0" | Pierde el OAuth grant. User tiene que volver a hacer consent. |
| "Auto-pickear primer account sin loggear N>1" | Silenciamos un caso edge legítimo. Sub-DEBT no se descubre hasta cliente reporta "se conectó la cuenta equivocada". |

## Cuándo aplicar este pattern

✅ **Aplicar:** cualquier integración OAuth nueva que conecta una "cuenta" externa (ad account, store, payment account, social profile).

❌ **NO aplicar:** OAuth puro de identidad (Google login, GitHub login para auth) donde no hay concepto de "account" downstream — solo se necesita el user_id del provider.

## Cuándo extender este pattern

Cuando agregamos un nuevo provider:
1. Identificar el endpoint canónico de "list accessible accounts" en docs oficiales del provider.
2. Implementar `listAccessibleAccounts(accessToken)` siguiendo el template arriba.
3. Agregar tests defensivos (mínimo 8: token missing × 2 + happy N=1 + N>1 + N=0 + 401 + 403 + network throw).
4. Modificar callback OAuth para llamarlo post-tokenExchange.
5. Agregar a la tabla de mapping en este LL.

## Vínculos relacionados

- [[../sprints/sprint-78-google-customer-id-autodiscovery/SPRINT-78-GOOGLE-CUSTOMER-ID-AUTODISCOVERY]] — sprint que originó el pattern
- [[../sprints/sprint-77-google-oauth-callback-state-bug/SPRINT-77-GOOGLE-OAUTH-CALLBACK-STATE-BUG]] — capa 1 del OAuth (state vs brand_id)
- [[LL-2026-05-06-oauth-flows-tienen-4-capas-de-gotchas]] — las 4 capas de gotchas universales
- [[../debt/DEBT-2026-05-06-google-multi-customer-selector-ui]] — sub-DEBT N>1 selector
- [[../debt/DEBT-env-vars-undocumented]] — pre-requisito capa 4 (developer tokens)

---

*Pattern extraído de Sprint 78 Google Ads. Aplicable a próximas integraciones (TikTok OAuth nativo cuando se construya, LinkedIn Ads, Pinterest, Stripe Connect). El pattern resuelve la "capa 3 — customer ID auto-discovery" de [[LL-2026-05-06-oauth-flows-tienen-4-capas-de-gotchas]].*
