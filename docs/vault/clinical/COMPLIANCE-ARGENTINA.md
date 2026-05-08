---
title: "Compliance Argentina — SomnoSalud"
date: 2026-05-07
last_synced_with_vault_reality: 2026-05-07
tags: [compliance, legal, anmat, ley-25326, ley-26529, argentina, somnosalud, pampalabs-context]
status: draft
related:
  - "[[../index]]"
  - "[[../../../CLAUDE]]"
  - "[[../../../COMPLIANCE]]"
  - "[[somnosalud/ANALISIS-EXHAUSTIVO-SOMNOSALUD-2026-05-07]]"
owner: pablo-ferrero + jorge + cowork
created: 2026-05-07
---

# Compliance Argentina — SomnoSalud

> Marco regulatorio aplicable al producto SomnoSalud para operar en Argentina (mercado primario Fase 1).
>
> Documento vivo. Actualizar cuando haya cambios regulatorios o decisiones de compliance.

---

## ⚖️ Marco legal aplicable

### 1. Ley 25.326 — Protección de los Datos Personales

**Aplica:** todos los datos de evaluación de pacientes (respuestas a cuestionarios, datos lab opcionales, datos genetics opcionales, PSGs subidos, resultados generados).

**Obligaciones implementadas / pendientes:**

| Requisito | Estado | Responsable |
|---|---|---|
| Consentimiento explícito previo a recolectar datos | ⏳ Sprint 8 (Fase 1) | Cowork |
| Información clara sobre finalidad del tratamiento | ⏳ Sprint 8 | Cowork |
| Encriptación at rest (Supabase Postgres native) | ⏳ Sprint 5 | Cowork |
| Encriptación in transit (HTTPS obligatorio, TLS 1.2+) | ⏳ Sprint 3 (Vercel deploy) | Cowork |
| Derecho de acceso del titular (export evaluación) | ⏳ Sprint 7 | Cowork |
| Derecho de rectificación (editar respuestas pre-submit) | ⏳ Sprint 7 | Cowork |
| Derecho de supresión (delete account + cascade) | ⏳ Sprint 7 | Cowork |
| Registro de tratamiento de datos en Dirección Nacional de Protección de Datos Personales (DNPDP) | ⏳ Pre-launch público | Pablo Ferrero |
| Designación de Responsable de Tratamiento (RT) | ⏳ Pre-launch público | Pablo Ferrero / IFN |
| Política de privacidad pública en sitio web | ⏳ Sprint 8 | Jorge + Cowork |

### 2. Ley 26.529 — Derechos del Paciente, Historia Clínica e Información

**Aplica:** la evaluación SomnoSalud constituye potencialmente parte de la historia clínica del paciente (al ser orientativa pero respaldada por médico M.N. visible).

**Obligaciones implementadas / pendientes:**

| Requisito | Estado | Responsable |
|---|---|---|
| Consentimiento informado escrito antes de evaluación clínica | ⏳ Sprint 8 | Cowork |
| Información clara y comprensible al paciente sobre alcance de la evaluación | ⏳ Sprint 8 | Cowork |
| Disclaimer obligatorio: la evaluación es orientativa, NO reemplaza consulta médica | ⏳ Sprint 9 | Cowork |
| Conservación de historia clínica por mínimo 10 años | ⏳ Política Supabase + backup | Cowork |
| Profesional médico responsable identificado (M.N. visible) | ⏳ Sprint 9 | Cowork |
| Derecho del paciente a recibir copia de su evaluación | ⏳ Sprint 7 | Cowork |
| Confidencialidad médica respetada (acceso solo paciente + profesional autorizado) | ⏳ Sprint 5 (RLS multi-tenant) | Cowork |

### 3. Disposición ANMAT 18/2017 — Software Médico

**Aplica:** SomnoSalud es **probablemente** clasificable como software médico Clase I (orientativo, no diagnóstico, no prescripción farmacológica). PERO requiere consulta regulatoria pre-launch público para confirmar.

**Hipótesis clasificación:**

- **Clase I (orientativo):** función primaria es soportar decisión clínica del profesional. NO emite diagnóstico autónomo. NO prescribe medicación. NO controla dispositivos médicos. → **Probablemente nuestro caso.**
- **Clase II (diagnóstico):** función emite diagnóstico autónomo o prescribe tratamiento. Requiere certificación más extensa. → No es nuestro caso si mantenemos disclaimer fuerte.
- **Clase III (alto riesgo):** software que controla dispositivos médicos críticos (PSG, CPAP, etc.). NO es nuestro caso.

**Acciones pendientes (Pre-launch público):**

| Requisito | Estado | Responsable |
|---|---|---|
| Consulta a experto regulatorio para confirmar clasificación Clase I | ⏳ Pre-launch | Pablo Ferrero |
| Si confirma Clase I: registro voluntario ante ANMAT (recomendado, no obligatorio) | ⏳ Pre-launch | Pablo Ferrero |
| Si requiere reclasificación a Clase II: certificación + documentación clínica adicional | ⏳ TBD | Pablo Ferrero + Cowork |
| Documentación de gestión de riesgo clínico (FMEA u equivalente) | ⏳ Sprint 11 (post tests cobertura) | Cowork |
| Procedimiento de actualización de algoritmos clínicos (versionado + signoff Pablo) | ⏳ Sprint 11 | Cowork |

### 4. Otras normativas relevantes

- **Resolución 21/2019 (Salud Digital MSA):** marco general de salud digital. Recomendación: alinearse a buenas prácticas pero no es bloqueante.
- **NTH (Nueva Ley Protección Datos en debate Congreso 2024-2026):** monitorear aprobación. Si se aprueba, puede agregar nuevas obligaciones (ej: notificación de brechas en X horas, evaluación de impacto, etc.).

---

## 🛡️ Disclaimer médico obligatorio (texto canónico)

A usar en TODA pantalla de resultados, en todo email transaccional con resultados, en toda pieza de marketing del producto:

> ⚠️ **Importante:** Esta evaluación es **orientativa** y NO reemplaza la consulta médica. Las recomendaciones deben ser validadas por un profesional de la salud antes de implementarlas.
>
> Director médico responsable: **Dr. Pablo Ferrero — M.N. 119.783**.
> Instituto Ferrero de Neurología y Sueño (IFN), Buenos Aires, Argentina.

**Tamaño mínimo:** legible (no tipografía 8px microscópica). **Posición:** visible sin scroll en pantalla de resultados. **Idioma:** español neutro (Fase 1 AR), traducido en Fase 3 EN/PT respetando regulaciones locales.

---

## 🔒 Política de privacidad (puntos canónicos)

A redactar en página `/privacidad` del sitio público antes de launch:

1. **Quién recolecta los datos:** SomnoSalud (operado por Instituto Ferrero de Neurología y Sueño — IFN) + Pampa Labs como partner técnico.
2. **Qué datos recolectamos:**
   - Datos identificatorios: nombre, email, edad, sexo (al crear cuenta)
   - Datos clínicos: respuestas a cuestionarios estandarizados (ISI, ESS, STOP-BANG, PHQ-9, GAD-7, DASS-21), datos lab opcionales, datos genetics opcionales
   - Datos técnicos: IP, user-agent, timestamps (logs operativos por máximo 30 días)
3. **Para qué usamos los datos:**
   - Generar evaluación clínica orientativa para el usuario
   - Permitir al usuario acceder a su historial
   - Mejorar algoritmos clínicos (anonimizado, agregado)
   - **NUNCA:** vender data a terceros, mostrar publicidad, usar para fines no médicos
4. **Quién accede a los datos:**
   - El usuario titular
   - Profesionales médicos del IFN si el usuario los autoriza explícitamente (compartir resultados pre-consulta)
   - Cowork técnico de Pampa Labs (NO accede a datos identificatorios — solo logs anonimizados de operación)
5. **Cuánto tiempo guardamos los datos:** mínimo 10 años (requisito Ley 26.529 historia clínica). El usuario puede solicitar supresión de datos identificatorios en cualquier momento (Ley 25.326 art. 16).
6. **Cómo el usuario ejerce sus derechos:** email a privacidad@somnosalud.com.ar (a configurar Sprint 8) o vía settings de su cuenta (acceso, rectificación, supresión).
7. **Encriptación:** at rest + in transit. Backups encriptados.
8. **Responsable de Tratamiento (RT):** Dr. Pablo Ferrero / IFN.

---

## 🚨 Plan de respuesta a brechas de datos

A formalizar Pre-launch público (Sprint 8):

1. Detección automática vía Sentry + monitoreo Supabase logs
2. Notificación a RT (Pablo) + Cowork dentro de 4 horas
3. Evaluación de severidad (cuántos usuarios afectados, qué datos expuestos)
4. Notificación a usuarios afectados dentro de 72 horas (estándar GDPR aplicable por buena práctica, no obligatorio en AR todavía)
5. Notificación a DNPDP si la NTH se aprueba con esa obligación
6. Post-mortem documentado en `docs/vault/incidents/INCIDENT-YYYY-MM-DD-<slug>.md`
7. Plan de remediación con DEBT en `docs/vault/debt/`

---

## 📋 Checklist Pre-launch público (Fase 1 final)

Antes de exponer el producto al público (no solo testing interno):

- [ ] Política de privacidad pública en `/privacidad`
- [ ] Términos y condiciones públicos en `/terminos`
- [ ] Consentimiento informado escrito implementado en flow de evaluación
- [ ] Verificación de edad (gate <18 años → contacto con especialista)
- [ ] Disclaimer médico visible en TODA pantalla de resultados
- [ ] M.N. del director médico (Pablo Ferrero 119.783) visible en footer
- [ ] HTTPS en producción (Vercel default)
- [ ] Encriptación at rest (Supabase native)
- [ ] Backup automático configurado
- [ ] RLS multi-tenant verificado (un usuario NO puede acceder a datos de otro)
- [ ] Plan de respuesta a brechas documentado
- [ ] Consulta regulatoria con experto ANMAT confirmando Clase I (o reclasificación + plan)
- [ ] Si Clase I: registro voluntario ante ANMAT enviado (no bloqueante pero recomendado)
- [ ] Pablo Ferrero firmado como RT en política de privacidad
- [ ] Tests E2E que verifiquen safety rules (SAFE-010 a SAFE-040) trigger correcto
- [ ] Audit independiente (puede ser informal: Pablo + 1 colega especialista) review de algoritmos pre-launch

---

## 🔗 Referencias regulatorias

- [Ley 25.326 (BORA)](https://www.boletinoficial.gob.ar/detalleAviso/primera/4322648/20001102)
- [Ley 26.529 (BORA)](https://www.boletinoficial.gob.ar/detalleAviso/primera/4413728/20091120)
- [Disposición ANMAT 18/2017](https://www.argentina.gob.ar/normativa/nacional/disposici%C3%B3n-18-2017-anmat)
- [DNPDP — Dirección Nacional de Protección de Datos Personales](https://www.argentina.gob.ar/aaip/datospersonales)
- [NTH proyecto Congreso (a monitorear)](https://www.argentina.gob.ar/aaip/datospersonales/regimenes-especiales)

---

*Última actualización: 2026-05-07 noche (setup Pampa Labs OS)*
*Próxima revisión: pre-Sprint 8 (compliance flow Fase 1)*
