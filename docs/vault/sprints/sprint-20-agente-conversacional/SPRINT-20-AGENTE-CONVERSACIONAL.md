---
title: "Sprint 20 — Agente conversacional de voz reemplaza cuestionarios MC (research + decisión)"
date: 2026-06-02
sprint_number: 20
status: research-pending-approval
parent_debts: []
related:
  - "[[../../vision/PRODUCT-ROADMAP-2026-05-18-jorge]]"
  - "[[../sprint-9-c-persist-eval/SPRINT-9-C-PERSIST-EVAL]]"
tags: [sprint, conversational-ai, voice-agent, elevenlabs, vapi, research, fase-1, pending-approval]
---

# Sprint 20 — Agente conversacional de voz (research + decisión)

> [!info] Origen — brief Jorge 2026-06-02 10:25-10:26
> > "Decidimos que vamos a poner un agente que reemplace las preguntas tipo múltiple choice. Ese agente es con ElevenLabs o con Vapi. La idea es que sea conversacional y que ese agente saque esa info y se almacene en la base de conocimiento y supabase."
> >
> > "Avanza con eso y si lo tenemos para ver esta tarde noche genial."

> [!warning] Status: research-pending-approval
> Este sprint **NO incluye código** todavía. Es research + decisión técnica + plan FASE 1-4 documentado para aprobación de Jorge antes de invertir 10-13 h reales en implementación. La decisión "ElevenLabs vs Vapi" es no-trivial y tiene impacto compliance (HIPAA $2.000/mes en Vapi, BAA negociable en Enterprise ElevenLabs) que no quiero asumir sin signoff de Jorge.

## Contexto

**Decisión Jorge + Pablo 2026-06-02 (WhatsApp):**

1. **Pausar monetización** (Stripe B2C postergado).
2. **Terminar interfaz + arquitectura + probarla a fondo** antes que business.
3. **Producción Vercel:** ✅ ya hecho hoy en Sprint 3 (Pablo + Fabio entraron OK).
4. **Reemplazar cuestionarios múltiple choice por agente conversacional de voz.**
5. **Info se almacena en "base de conocimiento" + Supabase.**
6. Tech: **ElevenLabs o Vapi**.
7. Deadline blando: **tarde-noche del 2026-06-02** (es decir, hoy, ~6-12 h disponibles).

### Cuestionarios afectados (57 preguntas en 6 instrumentos)

| Instrumento | Items | Componente actual | Sprint origen |
|---|---|---|---|
| **ISI** | 7 (0-4) | `QuestionnaireForm` | Sprint 7.A |
| **ESS** | 8 (0-3) | `QuestionnaireForm` | Sprint 7.A |
| **STOP-BANG** | 5 manual + 3 auto | `STOPBangForm` custom | Sprint 7.A |
| **PHQ-9** | 9 (0-3) | `QuestionnaireForm` + ítem 9 LIVE detection | Sprint 7.B |
| **GAD-7** | 7 (0-3) | `QuestionnaireForm` | Sprint 7.B |
| **DASS-21** | 21 (0-3) | `QuestionnaireForm` + separators "Parte 1/2/3" | Sprint 7.B |

**No afectados** (Jorge dice "preguntas tipo múltiple choice"): ProfileForm, SafetyForm, SleepForm, LabForm, GeneticsForm — esos tienen UI custom y no son MC puros.

## Research — ElevenLabs Conversational AI vs Vapi (2026-06-02)

### ElevenLabs Conversational AI (alias "ElevenAgents" o "Agents Platform")

**Fuentes consultadas:**
- [elevenlabs.io/pricing](https://elevenlabs.io/pricing) (2026-06-02)
- [elevenlabs.io/conversational-ai](https://elevenlabs.io/conversational-ai) (2026-06-02)

**Findings:**

| Dimensión | Dato |
|---|---|
| **Pricing per minute** | NO publicado (custom enterprise). Anunciado "use credits" del plan base TTS |
| **Languages** | 70+ idiomas, incluido español (TTS engine "eleven_multilingual_v2"). No publica detalle es-AR específicamente |
| **SDKs** | JavaScript / **React** / Python / iOS (oficial) — match perfecto con nuestro stack |
| **Latencia** | "Sub-second responsiveness" reclamado, sin benchmark formal publicado |
| **Function calling** | Sí (vía "client tools" en su SDK) |
| **HIPAA / BAA** | Disponible en **Enterprise tier**, custom pricing, requiere sales call |
| **Recording retention** | No publicado en pricing page |

### Vapi

**Fuentes consultadas:**
- [vapi.ai/pricing](https://vapi.ai/pricing) (2026-06-02)

**Findings:**

| Dimensión | Dato |
|---|---|
| **Pricing per minute** | **$0.05 / min Vapi hosting** + costo del modelo LLM (pass-through, $0 si traes tu API key OpenAI/Anthropic) |
| **SMS/Chat** | $0.005 / msg |
| **Concurrency** | 10 líneas concurrentes en Build plan; $10/mo por línea extra |
| **Languages** | No publicado en pricing page (presumible que sí, ASR depende del modelo Whisper) |
| **SDKs** | Web SDK existe pero detalle no publicado |
| **Function calling** | Sí |
| **HIPAA / BAA** | **$2.000/mes add-on** en Build y Scale plans |
| **Zero Data Retention** | **$1.000/mes add-on** |
| **Recording retention default** | Call history 14 días (Build), custom (Scale) |

### Comparación lado a lado

| Factor | ElevenLabs | Vapi | Ganador |
|---|---|---|---|
| Pricing transparente | ❌ Custom | ✅ $0.05/min público | **Vapi** |
| SDK React oficial | ✅ Documentado | ⚠️ Existe pero sin doc visible | **ElevenLabs** |
| Voz natural (TTS) | ✅ Líder en mercado TTS | ⚠️ Depende del provider conectado | **ElevenLabs** |
| Función calling / webhooks | ✅ | ✅ | Empate |
| HIPAA pricing | Custom enterprise | $2.000/mes add-on conocido | **Vapi** (predictable) |
| Lock-in | Medio (SDK custom) | Bajo (BYO LLM API key) | **Vapi** |
| Voice quality experiencia paciente | Premium | Estándar | **ElevenLabs** |
| Fast time-to-demo (para hoy) | Medio (más setup) | Bajo (turnkey) | **Vapi** |

### Recomendación técnica

**Vapi para piloto Fase 1**, con migración a ElevenLabs evaluable Fase 2 si calidad de voz hace falta upgrade.

**Razones:**

1. **Pricing predecible:** $0.05/min + modelo BYO = puedo estimar costo del piloto exacto (10 pacientes × 15 min × $0.05 = $7.50/piloto).
2. **HIPAA tier conocido:** $2.000/mes vs "negociar con sales" en ElevenLabs. Aunque AR no requiere HIPAA, da claridad si Fase 3 escala USA.
3. **BYO API key del LLM:** podemos usar nuestra cuenta Anthropic (Claude) sin lock-in. ElevenLabs cobra modelo encima.
4. **Mayor compatibilidad con nuestro stack actual:** Server Actions + webhook → más natural en Next.js 14.
5. **Riesgo Fase 1:** la calidad TTS de Vapi standard es "buena" no "premium". Para piloto AR con 5 testers que dan feedback, suficiente.

**Caso para preferir ElevenLabs:**
- Si Jorge/Pablo priorizan **calidad de voz natural** sobre todo (porque pacientes mayores con apnea son target y voz robótica puede afectar adopción).
- Si quieren cero pricing surprise (ElevenLabs custom = puede ser caro).
- Si planean Fase 3 con HIPAA y prefieren tier custom negociable.

**Bloqueante para mi decisión sin Jorge:** este sprint impacta **lógica clínica** (cómo se mapean respuestas voz → items 0-3/0-4) + **compliance Ley 26.529 + Decreto 1089/2012** (consent grabación + retención audio). Requiere signoff explícito antes de codear.

## Hipótesis (pre-codear)

- **H1** — Pacientes mayores con sleep disorders (target IFN) toleran interfaz de voz mejor que cuestionarios escritos largos. **Hipótesis NO verificada empíricamente**, requiere smoke real con Pablo + 2-3 pacientes reales antes de scope full.
- **H2** — Vapi web SDK se integra a Next.js 14 con `'use client'` component sin friction.
- **H3** — El agente LLM-backed (Claude) puede extraer score numérico estructurado de respuestas naturales del paciente. Ejemplo: "Me cuesta MUCHO dormirme" → ISI Q1 = 4 (mucho).
- **H4** — La extracción NO inventa respuestas que el paciente no dio. **Riesgo clínico alto** — requiere validación con Pablo + test cases edge.
- **H5** — Consent informado (Ley 26.529) puede capturarse via voz también ("¿Aceptás que grabemos esta consulta para guardar tus respuestas?") con audit log timestampeado.
- **H6** — Fallback a forms tradicionales funciona si el paciente prefiere texto o el micrófono falla.

## Decisiones pendientes (bloqueantes)

| # | Decisión | Quién decide | Pendiente |
|---|---|---|---|
| 1 | **Vapi vs ElevenLabs** | Jorge | ⏳ Esperando |
| 2 | **Scope MVP:** ¿1 cuestionario piloto (ej. PHQ-9) o los 6 desde el día 1? | Jorge | ⏳ |
| 3 | **¿Voz solo o también texto fallback en mismo flow?** | Jorge / Pablo (UX) | ⏳ |
| 4 | **Consent informado:** ¿se acepta por voz o requerimos checkbox + voz? | Pablo (compliance ANMAT) | ⏳ |
| 5 | **Retención audio:** ¿guardamos audio raw o solo transcripción + scores? Ley 25.326 derecho de supresión + tamaño storage. | Pablo + Jorge | ⏳ |
| 6 | **LLM:** ¿usamos Claude (preferible para tono empático), GPT-4o, otro? | Cowork sugiere Claude | ⏳ |
| 7 | **"Base de conocimiento" mencionada por Jorge:** ¿se refiere a un vector store separado, o al schema actual `evaluations.{phq9,gad7,...}` JSON cols ya existente? | Jorge clarifica | ⏳ |

## FASE 1 — Implementación PROPUESTA (cuando se apruebe)

### Bloque A — Setup proveedor + agente

- Crear cuenta Vapi (o ElevenLabs según decisión).
- Configurar 1 agente con prompt clínico:
  - Tono: empático, profesional, calmo.
  - Reglas: NO inventar, SOLO registrar lo que el paciente dice. Confirmar antes de cerrar cada respuesta.
  - Tools: `recordItemScore(instrument, item, value)`, `confirmConsent()`, `finishQuestionnaire()`.
- Conectar Claude (Anthropic API key con env var `ANTHROPIC_API_KEY` o BYO).

### Bloque B — Webhook + Server Action

- `POST /api/voice-agent/webhook` Route Handler que recibe tool calls de Vapi.
- Validación de schema con Zod: `{ instrument: 'phq9', item: 0-8, value: 0-3 }`.
- Mapping a `EvalState` actual (no romper UI tradicional).
- Persistencia: Server Action `recordVoiceResponse()` que escribe a `evaluations.{instrument}` JSON col + audit log.

### Bloque C — UI Voice Widget

- Componente `<VoiceQuestionnaire instrument="phq9">` en `/eval/phq9` (con feature flag para fallback al form tradicional).
- Visual: botón "Iniciar con voz" → micrófono activo → transcripción live → confirmaciones inline.
- Toggle "Prefiero responder por escrito" → cae al form tradicional existente.

### Bloque D — Compliance grabación

- `lib/consent/voice-version.ts` con `CONSENT_VOICE_VERSION = 'v1'`.
- Server Action `acceptVoiceConsent()` que persiste en `profiles.consent_voice_accepted_at` + audit log.
- Pop-up "¿Aceptás grabación?" antes de iniciar agente.
- DEBT abierto para audit retention policy + jobs cleanup audio old.

### Bloque E — Tests + smoke real con Pablo

- Vitest del Server Action `recordVoiceResponse()` con mocks.
- Smoke real: Pablo + Fabio simulan paciente, hacen PHQ-9 completo por voz, verificamos resultados en `/eval/results` vs forms tradicionales.

## FASE 2 — Verificación

- **E1 — lectura código actual:** confirma que `QuestionnaireForm` sigue funcionando como fallback (no se rompe Sprint 9.C persist write-through).
- **E2 — Vitest:** Server Action de mapping voz → score passing.
- **E3 — Smoke real:** Pablo + Fabio simulan PHQ-9 completo por voz + verifican scores en results page vs cuestionario texto.
- **E4 — RLS:** voz → Server Action escribe en `evaluations` del user logueado, NO de otro user.

## FASE 3 — Cierre

(post-aprobación + post-implementación)

## FASE 4 — Pendientes post-Sprint 20

- **Sprint 20.B** — Extender agente a los otros 5 cuestionarios (ISI + ESS + STOP-BANG + GAD-7 + DASS-21).
- **DEBT-voice-audio-retention** — definir política de retención de audio raw + jobs cleanup.
- **DEBT-voice-quality-eval** — métrica de calidad de respuestas: % de extracciones correctas, edge cases (paciente confunde, repite, no entiende).
- **Sprint clinical-voice-validation** — Pablo valida que el agente respeta reglas clínicas (no induce respuestas, captura síntomas reales).

## Bloque J — Reporte (preliminar pre-aprobación)

**Sprint 20 status `research-pending-approval` (2026-06-02 tarde).**

- **Tiempo invertido en research:** ~1 h.
- **Decisión técnica recomendada:** **Vapi** para Fase 1 por pricing transparente + BYO LLM + HIPAA tier conocido. Migrable a ElevenLabs Fase 2 si calidad voz hace falta upgrade.
- **Scope MVP propuesto:** 1 cuestionario piloto (recomendación: **PHQ-9**, porque ya tiene la complicación de ítem 9 LIVE detection — si funciona ahí, los otros 5 son triviales).
- **Bloqueantes:** 7 decisiones pendientes (ver tabla arriba) que requieren signoff Jorge / Pablo antes de codear.
- **No hay código en este sprint.** Cero git diff de código de producto.
- **Mensaje pendiente para Jorge:** resumen + recomendación + preguntas pendientes.

## Cita verbatim del brief Jorge

> [10:25 a.m., 2/6/2026] GeorgeGLs: Con respecto a tu pregunta sobre monetización de esta app. Te cuento que no vamos a pensar aún en eso. Terminemos la interfaz y la arquitectura, probémosla a fondo y luego se lo agregamos. Estoy ahora reunido con Pablo y acabamos de decidirlo. Si podes subí a un repo y a un vercel para que Pablo lo pueda ver
>
> [10:26 a.m., 2/6/2026] GeorgeGLs: Decidimos que vamos a poner un agente que reemplace las preguntas tipo múltiple choice. Ese agente es con ElevenLabs o con Vapi. La idea es que sea conversacional y que ese agente saque esa info y se almacene en la base de conocimiento y supabase
>
> [10:26 a.m., 2/6/2026] GeorgeGLs: Avanza con eso y si lo tenemos para ver esta tarde noche genial. Avísanos por acá porfa. Sigo avanzando con Pablo en otras cosas
