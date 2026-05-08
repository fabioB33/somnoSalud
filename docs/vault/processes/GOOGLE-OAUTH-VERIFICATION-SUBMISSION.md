---
title: "Google OAuth Verification Submission Process"
date: 2026-05-01
tags: [process, google-oauth, verification, launch-blocker, jorge-action-required]
related:
  - "[[../debt/DEBT-google-oauth-verification-pending]]"
  - "[[../sprints/sprint-73t-launch-self-service-blockers/SPRINT-73t-LAUNCH-SELF-SERVICE-BLOCKERS]]"
  - "[[../MASTER-PLAN]]"
status: ready-for-jorge-execution
owner: jorge
---

# Google OAuth Verification Submission Process

> Process operativo end-to-end para someter Pampa Labs Content Factory a verification de Google OAuth y desbloquear el scope sensible `https://www.googleapis.com/auth/adwords` antes del launch self-service del 2026-05-27.

## Por qué este proceso existe

Content Factory ofrece a sus clientes B2B una vista unificada de performance de Meta Ads + Google Ads en el Playbook. Para leer Google Ads en nombre del cliente necesitamos su consentimiento OAuth con el scope **`https://www.googleapis.com/auth/adwords`** — un *sensitive scope* clasificado por Google. Mientras la app no esté verificada, cualquier usuario fuera de la lista de "test users" verá una pantalla de advertencia ("Google hasn't verified this app") que destruye la conversión: la caída empírica documentada por Google es 70%+ de abandono en signup self-service.

**Tiempo de review histórico de Google: 2 a 6 semanas.** Si el lunes 2026-05-01 no se inicia el submit, se compromete el target de launch self-service del 2026-05-27. Este documento existe para que Jorge ejecute el submit sin re-investigar nada.

**Alcance de este doc:** únicamente la verification del scope `adwords`. Meta Ads (Facebook OAuth) ya está cubierto por una App Review separada y no se trata aquí.

---

## Sección 1 — Pre-submission checklist (assets críticos)

Antes de tocar Google Cloud Console, todos los assets de abajo deben existir, ser accesibles públicamente, y reflejar la realidad operativa de Content Factory. Google rechaza submissions con assets parciales y el ciclo de re-submit suma 2-4 semanas adicionales — preparar bien la primera vez es la mejor estrategia.

### 1.1 Homepage URL — `https://pampalabs.com`

Google requiere que la homepage del producto explique qué hace la app, quién la opera, y cómo contactar al equipo. Pampalabs.com debe contener:

- Nombre del producto visible above-the-fold (ver decisión 1.5 sobre app name).
- Descripción de 1-2 párrafos sobre qué hace Content Factory (observability + optimización de campañas Meta Ads y Google Ads para marcas DTC y servicios).
- Razón social o nombre comercial del operador (Pampa Labs / Jorge Enrique Leporace).
- Email de contacto operativo (`info@pampalabs.com`).
- Links visibles a Privacy Policy y Terms of Service (footer es estándar y aceptable).

**Acción Jorge:** abrir pampalabs.com y verificar que estos 5 elementos existan. Si falta cualquiera, agregarlo antes de submit.

### 1.2 Privacy Policy URL — pendiente confirmar

Asset bloqueante. Sin Privacy Policy publicada, accesible vía URL pública (no autenticada), y con cláusulas específicas, Google rechaza el submit en la primera revisión automática. La Privacy Policy debe contener obligatoriamente:

- **Data collection**: qué datos recolectamos (nombre, email, datos de cuenta Meta Ads, datos de cuenta Google Ads, brand_id, métricas de campañas).
- **Data use**: para qué los usamos (mostrar performance en el Playbook, generar recomendaciones automatizadas via Luna AI, cobrar via Stripe).
- **Third-party sharing**: con quién compartimos (Supabase como database provider, Sentry como error monitoring, Resend como transactional email, Stripe como payment processor, Anthropic/OpenAI como LLM providers — listar todos).
- **User rights**: derecho a acceso, rectificación, eliminación, portabilidad de datos.
- **Retention period**: cuánto guardamos los datos (recomendado: mientras la cuenta esté activa + 90 días post-cancelación).
- **Contact info**: email para data requests (`info@pampalabs.com` o crear `privacy@pampalabs.com`).
- **GDPR clause** si vamos a tener users en EU (recomendado sí — cualquier marca europea en Pampa Labs cae acá).
- **CCPA clause** si vamos a tener users en California (recomendado sí — California es default para SaaS B2B internacional).
- **Cookies / tracking**: declarar uso de cookies, analytics (si hay), etc.

**Acción Jorge:** verificar si existe Privacy Policy publicada en `pampalabs.com/privacy` o equivalente. Si existe pero le falta alguna cláusula, actualizar. Si no existe, redactar (estimado 1-2h con un template GDPR-CCPA + Claude para adaptación).

### 1.3 Terms of Service URL — pendiente confirmar

Asset bloqueante de la misma forma que Privacy Policy. Debe estar publicado en URL pública y contener al menos:

- **Scope of service**: qué incluye Content Factory (observability multi-canal, recomendaciones, Luna AI, integrations Meta + Google + Stripe).
- **User obligations**: el usuario es responsable de tener permisos legítimos sobre las cuentas Meta y Google que conecta; no se permite uso para black-hat marketing, phishing, scams.
- **Payment terms**: pricing (suscripción mensual), método de pago (Stripe), refund policy.
- **Liability limitations**: cláusula estándar de "as-is, no warranty, max liability = monto pagado en últimos 12 meses".
- **Termination**: condiciones de cancelación por user y por Pampa Labs (breach, no-pay, fraud).
- **Governing law**: ley argentina o jurisdicción de elección (acordar con Jorge).

**Acción Jorge:** misma lógica — verificar si existe, completar si falta. Estimado 1h con template SaaS B2B genérico.

### 1.4 Logo — 120x120 PNG mínimo

Google pide un logo cuadrado, fondo transparente preferido, mínimo 120x120 px. Se muestra en la pantalla de OAuth consent (la que ve el cliente al hacer click en "Connect Google Ads"). Calidad importa: si el logo se ve pixelado o genérico, los reviewers de Google escalan a "this looks like a phishing app" y rechazan.

**Acción Jorge:** exportar logo Pampa Labs en 512x512 PNG (rinde mejor en displays Retina). Si no hay versión cuadrada, generar una en Figma o pedirla en `~/.claude/skills/brand-guidelines`.

### 1.5 App Name — decisión y recomendación

Decisión entre dos opciones:

- **Opción A — "Content Factory"**: más corto, branded como producto. Riesgo: el reviewer de Google no encuentra inmediatamente la conexión entre "Content Factory" y la entidad legal "Pampa Labs". Eso puede gatillar verificación adicional ("who operates this app?").
- **Opción B — "Pampa Labs Content Factory"**: más explícito sobre el operador. Reviewer de Google reconoce inmediatamente que la app es operada por Pampa Labs (que figura como business name en Privacy Policy + Terms + homepage). Reduce fricción de verification.

**Recomendación: Opción B — "Pampa Labs Content Factory"**. La verbosidad extra en la pantalla de consent (los users la leen 1 vez en su vida) no compensa el riesgo de delay de 2-4 semanas extra por ambigüedad de operador. Para la mayoría de SaaS verticales B2B, Google approva más rápido nombres con la entidad legal incluida.

### 1.6 Support email — `info@pampalabs.com`

Confirmar que el email es operativo y que alguien (Jorge) lee la inbox al menos 1 vez por día. Google a veces envía consultas a este email durante el review, y un email muerto = rechazo automático.

**Acción Jorge:** confirmar que `info@pampalabs.com` recibe + responde. Si la inbox está saturada, considerar crear `oauth@pampalabs.com` exclusivo para esta verification (forward a Jorge).

### 1.7 Demo video — YouTube/Loom unlisted, 2-3 minutos

**Asset crítico — el más rechazado de toda la submission.** Google quiere ver, con sus propios ojos, que el scope solicitado se usa para la funcionalidad declarada y nada más. El video debe ser unlisted (no público — Google lo accede via link directo) y contener obligatoriamente esta secuencia:

1. **(0:00 - 0:20)** Pantalla de signup/login de Content Factory. User se autentica con email+password (signup nativo) o con "Sign in with Google" (si está habilitado).
2. **(0:20 - 0:40)** Dashboard de Content Factory. Mostrar la sección de "Integrations" donde el user ve "Connect Google Ads" como botón pendiente.
3. **(0:40 - 1:00)** User hace click en "Connect Google Ads". Aparece la pantalla de OAuth consent de Google mostrando los scopes solicitados (zoom in al texto "View your Google Ads accounts").
4. **(1:00 - 1:10)** User permite el acceso. Vuelve a Content Factory.
5. **(1:10 - 2:00)** User navega al Playbook → vista de campañas Google Ads. **Mostrar explícitamente** que la app está usando el scope: tabla de campañas con métricas (CTR, CPC, spend, conversions) que claramente vienen de Google Ads API.
6. **(2:00 - 2:30)** Voiceover o caption explicando: "Content Factory uses the Google Ads readonly scope exclusively to display campaign performance to the brand owner inside the Playbook dashboard. We never modify campaigns, never run ads on behalf of the user, never share data with third parties beyond infrastructure providers listed in our Privacy Policy."

**Acción Jorge:** grabar el video con Loom (más rápido que YouTube) cuando ya haya un user de prueba con Google Ads conectado en staging. Si no hay user de prueba listo, crear uno con la cuenta de Pampa Labs interna. Estimado 30 min de grabación + 0 edición (Loom permite re-grabar hasta que salga limpio).

### 1.8 Scopes justification text

Por cada scope solicitado, Google pide un texto de 1-3 párrafos explicando why needed. Tener pre-escritos estos textos antes de submit:

**Scope sensible — `https://www.googleapis.com/auth/adwords` (Google Ads readonly)**:
> "Content Factory connects to the user's Google Ads account in read-only mode to display campaign performance metrics inside our Playbook dashboard. The data retrieved includes campaign names, ad spend, impressions, clicks, conversions, and cost-per-result. This data is used exclusively to power the user-facing dashboard and the Luna AI assistant which provides optimization recommendations. We never write, modify, pause, or create campaigns. We never share Google Ads data with third parties beyond our infrastructure providers (Supabase for storage, Sentry for error monitoring) listed in our Privacy Policy. The scope is essential because there is no narrower alternative that allows reading campaign performance — Google Ads API does not offer a more granular read-only scope."

**Scopes básicos — `userinfo.profile` + `userinfo.email`**:
> "Content Factory uses the user's profile name and email address to create the user account, send transactional notifications (signup confirmation, billing alerts), and display the user's identity in the dashboard. These scopes are non-sensitive and standard for any SaaS authentication flow."

---

## Sección 2 — Submission process step-by-step

Asumiendo Sección 1 completa, este es el flujo en Google Cloud Console:

1. **Login** a https://console.cloud.google.com con la cuenta Google de Jorge que es owner del proyecto. Si la cuenta no es owner, transferir ownership o usar la cuenta correcta antes de continuar.
2. **Seleccionar o crear proyecto**. Si ya existe un proyecto "Pampa Labs Content Factory" o equivalente con OAuth credentials configuradas, seleccionarlo. Si no, crear uno nuevo con ese nombre exacto (la consistencia con el App Name de la verification reduce fricción).
3. Navegar a **APIs & Services → OAuth consent screen** desde el sidebar izquierdo.
4. Hacer click en **Edit App**. Completar todos los campos con los assets de Sección 1:
   - App name: `Pampa Labs Content Factory`
   - User support email: `info@pampalabs.com`
   - App logo: subir el PNG 512x512
   - Application home page: `https://pampalabs.com`
   - Application privacy policy link: URL de Privacy Policy
   - Application terms of service link: URL de Terms of Service
   - Authorized domains: agregar `pampalabs.com` (y subdominios como `app.pampalabs.com` si aplica)
   - Developer contact information: `info@pampalabs.com`
5. **Verificar scopes solicitados**. En la sección Scopes, confirmar que están agregados:
   - `https://www.googleapis.com/auth/adwords` (sensitive)
   - `https://www.googleapis.com/auth/userinfo.profile` (non-sensitive)
   - `https://www.googleapis.com/auth/userinfo.email` (non-sensitive)
   - Cualquier otro scope que la app NO use debe quitarse — overshooting es la causa #2 de rechazo.
6. **Submit for verification**. En la sección de Sensitive Scopes, completar el formulario de justification con el texto pre-escrito de Sección 1.8. Adjuntar/linkear el demo video unlisted de Sección 1.7.
7. **Esperar email de Google `trust@google.com`**. La primera respuesta automatizada llega en 24-72h confirmando recepción. La respuesta sustantiva del reviewer humano llega en 2-6 semanas. Toda comunicación posterior es por email — chequear `info@pampalabs.com` diariamente.

---

## Sección 3 — Risk + workaround

### Estimated review time

- **P50 (mediana histórica)**: 3-4 semanas para apps SaaS B2B con assets bien preparados.
- **P90**: 6 semanas si hay 1 round de feedback + re-submit.
- **Worst case**: 8+ semanas si Google escala a "additional verification" por flags como dominio nuevo, falta de presencia social, o ambigüedad operador-app.

### Riesgos comunes de rechazo (en orden de frecuencia empírica)

1. **Privacy Policy missing required clauses** (data sharing, retention, GDPR/CCPA). Workaround: revisar Sección 1.2 punto por punto antes de submit.
2. **Demo video no muestra explicitly el scope use**. Reviewers de Google quieren ver la pantalla de Content Factory mostrando datos que claramente vinieron del scope `adwords` (no mockups, datos reales). Workaround: en el video mostrar nombres de campañas reales + métricas no-redondas que evidencien data real.
3. **Scopes overshooting**. Pedir más scopes de los que efectivamente se usan = rechazo automático con instrucción "remove unused scopes". Workaround: auditar el código de Content Factory (`/products/content-factory/`) y confirmar que ningún endpoint llama a Google APIs fuera de Google Ads readonly.
4. **App name / business name mismatch** entre Google Cloud Console, homepage, Privacy Policy y Terms. Workaround: usar "Pampa Labs Content Factory" idéntico en los 4 lugares.
5. **Domain ownership no verified**. Google a veces pide TXT record en DNS de pampalabs.com para confirmar ownership. Workaround: tener acceso a DonWeb (DNS provider) listo para agregar TXT en <30 min cuando lo pidan.

### Workaround si rechazo o pendiente al 2026-05-27

Si la verification no está aprobada para el launch self-service, hay 3 estrategias en paralelo, no excluyentes:

**Estrategia 1 — Modo "App in testing" (cap 100 users)**: Google permite que apps no verificadas operen en producción mientras la lista de "test users" tenga ≤100 usuarios. Cada test user debe agregarse manualmente con su email Google en Google Cloud Console. Para soft launch limitada (early access program, 50 marcas hand-picked) esto cubre. **Limitación**: no escala más allá de 100, y cada user nuevo requiere intervención manual de Jorge.

**Estrategia 2 — Feature gate "Google Ads coming soon"**: lanzar self-service abierto al público pero con la conexión a Google Ads marcada como "Coming Soon — request early access" detrás de un waitlist. Los users hacen signup con Meta Ads only, y cuando la verification se apruebe, se activa Google Ads para todos. **Ventaja**: no bloquea launch. **Desventaja**: el value prop multi-canal queda parcial los primeros 30-45 días.

**Estrategia 3 — Re-submit con feedback de Google**: si Google rechaza con feedback específico, el ciclo de fix + re-submit suma típicamente 2-4 semanas. Mantener el momentum: responder a Google dentro de las 48h del feedback.

**Recomendación operativa**: ejecutar Estrategia 1 (test users) + Estrategia 2 (feature gate) en paralelo desde el día del launch self-service. Esto da máxima flexibilidad si la verification demora más de lo esperado.

---

## Sección 4 — Acciones bloqueantes para Jorge

Estas son las tareas que Jorge tiene que ejecutar manualmente. Ningún agente, MCP, ni automation puede hacerlas por él (Google requiere explícitamente human action en cuenta Google personal del owner).

- [ ] **Verificar / crear Privacy Policy en `pampalabs.com/privacy`** con todas las cláusulas listadas en Sección 1.2 (data collection, third-party sharing, user rights, retention, GDPR, CCPA, contact).
- [ ] **Verificar / crear Terms of Service en `pampalabs.com/terms`** con cláusulas listadas en Sección 1.3 (scope of service, user obligations, payment, liability, termination, governing law).
- [ ] **Confirmar homepage `pampalabs.com`** tiene los 5 elementos de Sección 1.1 (nombre producto, descripción, operador, contact email, links a Privacy + ToS).
- [ ] **Exportar logo 512x512 PNG** con fondo transparente.
- [ ] **Grabar demo video Loom unlisted 2-3 min** siguiendo la secuencia de Sección 1.7. Requiere user de prueba con Google Ads conectado.
- [ ] **Pre-escribir scope justifications** copiando los textos de Sección 1.8 en un doc accesible (Google Doc o Notion) para pegar en el form sin reescribir.
- [ ] **Login Google Cloud Console** con cuenta Google owner del proyecto Content Factory.
- [ ] **Submit form completo** siguiendo Sección 2 paso a paso.
- [ ] **Email follow-up a `trust@google.com`** si pasaron >2 semanas sin respuesta sustantiva (más allá del acknowledgement automatizado de las primeras 72h).
- [ ] **Monitorear `info@pampalabs.com` diariamente** durante el período de review (2-6 semanas) por si Google pide additional verification o feedback.

---

## Sección 5 — Estimated effort Jorge

Total horas activas de Jorge para llevar la submission al `submitted` state (sin contar tiempo de review de Google que es waiting passivo):

| Tarea | Estimación |
|---|---|
| Privacy Policy review / update | 1-2h |
| Terms of Service review / update | 1h |
| Homepage check + ajustes menores | 15 min |
| Logo export 512x512 | 15 min |
| Demo video Loom (incluye crear test user con Google Ads) | 30 min - 1h |
| Pre-escribir scope justifications (copy desde este doc) | 10 min |
| Submit form en Google Cloud Console | 30 min |
| Follow-up email +14 días si silencio | 15 min |
| **Total Jorge para llegar a `submitted`** | **~3-5h** |

**Tiempo de review pasivo de Google: 2-6 semanas adicionales** durante las cuales Jorge solo monitorea inbox y responde feedback si llega.

**Crítico para el target del 2026-05-27**: si Jorge no completa esto antes del 2026-05-06 (lunes que viene), se cae fuera de la P50 de aprobación pre-launch. Submit del 2026-05-01 al 2026-05-03 es la ventana óptima.

---

## Próximo paso operativo

Jorge: bloquear 4-5h en calendario (idealmente sábado 2026-05-02 o domingo 2026-05-03) y ejecutar Sección 4 de arriba a abajo. Cuando la submission esté `submitted` con confirmation email de Google, actualizar [[../debt/DEBT-google-oauth-verification-pending]] con status `submitted` + fecha + screenshot del confirmation email. Crear sub-DEBT solo si Google rechaza con feedback que requiera trabajo de >2h.
