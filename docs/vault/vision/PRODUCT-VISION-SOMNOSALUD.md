---
title: "Product Vision — SomnoSalud"
date: 2026-05-07
last_synced_with_vault_reality: 2026-05-07
tags: [vision, product, somnosalud, b2c, b2b, pampalabs-context]
status: draft
related:
  - "[[../index]]"
  - "[[../MASTER-PLAN]]"
  - "[[../../../CLAUDE]]"
  - "[[../clinical/somnosalud/ANALISIS-EXHAUSTIVO-SOMNOSALUD-2026-05-07]]"
owner: jorge + pablo-ferrero
created: 2026-05-07
---

# Product Vision — SomnoSalud

## TL;DR

SomnoSalud es una plataforma médica digital que **amplifica la capacidad de evaluación de trastornos del sueño** del Dr. Pablo Ferrero (sleep lab IFN) — desde 1 paciente por consulta presencial a **miles de pacientes pre-evaluados, screened y educados a escala**, reservando la consulta presencial solo para casos que requieren PSG completo o tratamiento médico activo.

El producto NO reemplaza al especialista. Lo amplifica.

---

## Problema

Los trastornos del sueño (insomnio crónico, apnea obstructiva del sueño, narcolepsia, parasomnias, RLS, trastornos circadianos) afectan al **30-40% de la población adulta en Argentina** según estimaciones del IFN. Pero el cuello de botella estructural es:

1. **Pocos especialistas:** menos de 200 médicos del sueño certificados en AR (estimación). Cada uno atiende 5-15 pacientes nuevos por semana.
2. **Costo por consulta alto:** consulta especialista + PSG cuesta $80-200K ARS dependiendo de la cobertura. Inalcanzable para gran parte de la población.
3. **Screening tardío:** el paciente promedio convive con su trastorno **6-10 años antes de la primera consulta especializada** (según estudios de la AASM).
4. **Falta de educación pre-consulta:** los pacientes llegan al especialista sin haber identificado patrones, sin tracking de sueño, sin entender qué les pasa.

---

## Solución

Una plataforma web que ejecuta el **mismo workflow de evaluación** que el Dr. Ferrero hace en su consulta — pero a escala, asíncrona, con disclaimer clínico explícito y validación profesional integrada:

1. **Screening multi-instrumento estandarizado** (ISI, ESS, STOP-BANG, PHQ-9, GAD-7, DASS-21) con scoring automático respaldado por evidencia DOI/PMID.
2. **Safety rules embebidas** (SAFE-010 edad, SAFE-020 embarazo, SAFE-040 anticoagulantes) que detectan red flags y recomiendan consulta inmediata.
3. **Phenotyping automático** (insomnio primario vs secundario, alta probabilidad de SAHOS, screening parasomnias, RLS, narcolepsia, trastornos circadianos).
4. **Recommendations personalizadas** integradas con risk-integrator (combinación de scoring + safety + lab opcional + genetics opcional).
5. **Conversor PSG** que parsea reportes polisomnográficos de **7 equipos distintos** y genera CSV en formato estandarizado IFN, con Engine Hipóxico que calcula score 0-100 (basado en Azarbarzin 2019 hypoxic burden).
6. **Disclaimer y derivación:** TODA recomendación es orientativa, con call-to-action explícito a consultar especialista si el riesgo lo amerita.

---

## Targets de mercado

### Fase 1 (B2C Argentina)

- **Audiencia primaria:** adultos 25-60 años con sospecha de trastorno del sueño (insomnio crónico, ronquido + cansancio diurno, despertares nocturnos frecuentes).
- **Geografía:** AR mercado primario (compliance Ley 25.326 + 26.529 + ANMAT).
- **Funnel inicial:** orgánico via SEO (medicina del sueño AR) + referidos del Dr. Ferrero + redes IFN.
- **Modelo:** GRATIS (parte del retainer $2K/mes Pampa Labs ↔ IFN). El producto NO monetiza B2C en Fase 1 — es vehículo de captación de pacientes calificados para IFN.

### Fase 3 (B2B internacional)

- **Audiencia primaria:** sleep specialists individuales y clínicas del sueño en LATAM + USA + UE.
- **Modelo SaaS multi-tenant:**
  - **FREE tier:** 10 evaluaciones/mes, branding SomnoSalud
  - **PRO tier ($X/mes):** 100 evaluaciones/mes, branding white-label, dominio custom, integración wearables
  - **CLINIC tier ($Y/mes):** ilimitado, multi-doctor por clínica, OCR labs, soporte priority
- **Cifras estimadas:** 50 sleep specialists pagantes a $200/mes = $10.000 MRR adicional al retainer Pampa Labs.

---

## Diferenciales vs alternativas

| Feature | SomnoSalud | Apps consumer (Sleep Cycle, etc.) | Plataformas hospitalarias (e.g. Itamar, Somtek) |
|---|---|---|---|
| Scoring respaldado por DOI/PMID | ✅ Sí | ❌ Heurístico | ⚠️ Cerrado |
| Safety rules clínicas | ✅ SAFE-010 a SAFE-040 | ❌ No | ✅ Sí |
| Conversor multi-equipo PSG | ✅ 7 equipos | ❌ N/A | ⚠️ Solo equipos propios |
| Compliance regulatorio AR | ✅ ANMAT + Ley 25.326 | ❌ No aplican | ✅ Sí |
| Owner clínico real (M.N.) | ✅ Dr. Ferrero | ❌ No | ✅ Variable |
| White-label B2B | 🟡 Fase 3 | ❌ No | ✅ Sí |
| Open-source clinical-engine | 🟡 Decisión Fase 3 | ❌ No | ❌ No |

---

## Tesis no obvias

1. **El cliente NO es el paciente.** En B2C es el referenciador clínico (IFN). En B2B es el sleep specialist. El paciente es el beneficiario.
2. **La validación clínica es defensiva, no ofensiva.** Cada algoritmo respaldado por DOI/PMID NO es un feature de marketing — es la barrera regulatoria que evita que la plataforma sea clausurada por ANMAT.
3. **El Conversor PSG es un Trojan Horse.** Pablo y otros sleep specialists ya lo usan internamente para parsear reportes. Si lo abrimos como utility free, generamos adopción + tráfico + casos de uso reales antes de monetizar B2B.
4. **El motor clínico tiene valor por sí solo.** Si abrimos `clinical-engine` open-source en Fase 3, ganamos autoridad clínica + adopción + contribución de la comunidad médica del sueño. Decisión a tomar con Pablo.

---

## Anti-features (lo que NO vamos a hacer)

- ❌ Diagnóstico médico autónomo (siempre orientativo + derivación a especialista)
- ❌ Prescripción farmacológica (ningún algoritmo recomienda medicación)
- ❌ Telemedicina síncrona (no hay video calls integradas — el producto pre-prepara la consulta, no la reemplaza)
- ❌ Vender data clínica a terceros (privacidad clínica primer principio, ver regla #12 CLAUDE.md)
- ❌ Wearables propios (integramos los existentes, no fabricamos)
- ❌ Reemplazar PSG (el PSG completo en lab sigue siendo gold standard para SAHOS severo)

---

## Métricas de éxito

### Fase 1 (B2C AR, 6 meses post-launch)

- 1.000 evaluaciones completas
- 30% conversion rate evaluación → consulta especialista (referidos a IFN)
- NPS > 50
- 0 violaciones de compliance ANMAT / Ley 25.326

### Fase 3 (B2B internacional, 12 meses post-launch B2B)

- 50 sleep specialists pagantes
- $10.000 MRR adicional
- Presencia en al menos 5 países (AR, MX, CL, ES, USA)
- 1+ paper coautoría con Pablo + colega internacional

---

## Riesgos a vision

- **Pablo limited bandwidth:** Pablo es 1 sola persona con consulta clínica activa. Si el producto crece, el cuello de botella se traslada a su tiempo de signoff. Mitigación: documentar protocolos clínicos como código (cada algoritmo + DOI/PMID + signoff conceptual versionable), Pablo aprueba protocolos no cada commit.
- **Competencia hospitalaria fuerte:** Itamar Medical (NASDAQ), Somnoware, EnsoData, ResMed Tech — todos invierten millones en SaaS sleep. Mitigación: foco LATAM + Pablo como autoridad clínica + integración multi-equipo PSG (donde los grandes solo trabajan con equipos propios).
- **Regulación cambiante:** ANMAT puede reclasificar software médico digital → Clase II o III, requiriendo certificaciones más fuertes. Mitigación: documentar TODO el reasoning clínico como código auditable, mantener disclaimer fuerte, consultar regulatorio antes de Fase 3 USA/UE.

---

*Última actualización: 2026-05-07 noche (setup Pampa Labs OS)*
*Próxima revisión: post-Fase 1 (validación con primeros 100 pacientes reales)*
