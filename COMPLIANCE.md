# Compliance & Legal — SomnoSalud Platform

**Status:** Pre-launch · Pendiente revisión legal externa antes de Fase 1 launch.

---

## Disclaimer médico (obligatorio en toda pantalla de resultados)

> ⚠️ **Importante:** Esta evaluación es **orientativa** y NO reemplaza la consulta médica.
> Las recomendaciones deben ser validadas por un profesional de la salud antes de implementarlas.
> SomnoSalud NO realiza diagnóstico médico — provee información estructurada para que vos y tu profesional tomen decisiones informadas.

---

## Argentina (mercado primario)

### Ley 25.326 — Protección de Datos Personales
- ✅ Consentimiento informado explícito antes de recolectar datos (gate)
- ✅ Encriptación en tránsito (HTTPS) + en reposo (Supabase nativo, PostgreSQL TDE)
- ✅ Derecho de acceso, rectificación y supresión (vía formulario user account)
- ✅ Notificación a usuario en caso de breach
- ⏳ Registro como responsable de tratamiento ante AAIP — verificar si aplica

### Ley 26.529 — Derechos del Paciente
- ✅ Consentimiento informado escrito con timestamp registrado en DB (auditable)
- ✅ Derecho a obtener historia clínica en formato portable
- ✅ Derecho a confidencialidad

### Disposición ANMAT 18/2017 — Software médico
- ⏳ Verificar clasificación: ¿califica SomnoSalud como dispositivo médico digital?
- ⏳ Si califica: registro ante ANMAT antes de comercialización

### Verificación de edad
- ✅ Gate formal con fecha de nacimiento (no solo campo numérico)
- ✅ Bloqueo de menores de 18 años

### Disclaimer ANMAT específico (si aplica)
- ⏳ Validación con asesor legal especializado en salud digital

---

## Internacional (Fase 3+)

### USA — HIPAA
- Supabase Enterprise tier (HIPAA-eligible)
- BAA (Business Associate Agreement) con Supabase
- Audit logs completos
- Encryption at rest AES-256

### UE — GDPR
- RGPD compliance kit Supabase
- Privacy by design en todas las features
- DPO (Data Protection Officer) si volume > thresholds

### LATAM
- Brasil: LGPD (similar a RGPD)
- México: LFPDPPP
- Chile: Ley 19.628

---

## Validación clínica externa (PRE-LAUNCH)

🔴 **CRÍTICO antes de Fase 1 launch.**

### Workshop de validación
- 2-3 sleep specialists colegas de Pablo (independientes)
- Validar:
  - Algoritmos de scoring (cutoffs)
  - Criterios de derivación (cuándo polisomnografía, TCC-I, especialista urgente)
  - Wording educativo a paciente
  - Niveles de evidencia A/B/C de cada recomendación
- Documentar en `docs/clinical/external-validation-2026-XX.md`

### Pendientes de Pablo
- Identificar 2-3 sleep specialists para workshop
- Decisión sobre instrumento canonical: ISI (Bastien 2001) vs ISQ custom
- Decisión sobre PHQ-9: implementar o usar DASS-21 sub-scale

---

## Liability médica por recomendaciones

### Riesgos identificados
- Recomendar dosis específicas (ej. "Melatonina 0.5-3 mg") puede interpretarse como prescripción no autorizada
- Recomendar suplementos sin consulta médica previa
- No detectar señales de alarma (ideación suicida en PHQ-9, RBD para alfa-sinucleinopatía)

### Mitigaciones implementadas
- Disclaimer riguroso en cada recomendación
- "Consultar con médico antes de usar" explícito
- Niveles de evidencia A/B/C visibles
- Contraindicaciones explícitas
- Safety rules SAFE-010 a SAFE-040 que bloquean recomendaciones contraindicadas
- Derivación automática a especialista en banderas rojas (ideación suicida, RBD, narcolepsia con cataplejía, etc.)

---

## Datos sensibles especiales

### Datos genéticos (Decreto 1089 datos genéticos)
- ✅ Consentimiento separado granular (opt-in específico)
- ✅ Encriptación dedicada at-rest
- ✅ No se comparten con terceros sin consentimiento explícito por uso

### Datos de salud mental (PHQ-9, GAD-7, DASS-21)
- ✅ Misma protección que resto de datos de salud
- ✅ Detección automática de ideación suicida → recurso de emergencia 24/7

### Datos de wearables (Fase 3)
- OAuth2 con scopes mínimos
- Datos solo se almacenan en Supabase si el usuario opta in

---

## Auditoría y trazabilidad

- Audit logs Supabase: cada acción crítica (login, consentimiento, edit datos, export) queda registrada
- Retención mínima: 5 años (Ley 26.529)
- Acceso a logs: solo admin Pampa Labs + Dr. Ferrero

---

## Versionado de consentimientos

Cada vez que cambiamos T&C, Privacy Policy o el disclaimer médico:
- Versión nueva con timestamp
- Usuario debe re-aceptar antes de continuar
- Versión vieja accesible para auditoría

---

## Contacto del DPO (Data Protection Officer)

A definir en Fase 1.

---

*Última actualización: 2026-05-07*
*Próxima revisión: pre-Fase 1 launch (workshop legal externo)*
