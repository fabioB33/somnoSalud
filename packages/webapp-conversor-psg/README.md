# `@somnosalud/webapp-conversor-psg`

Utility client-side para parsear PDFs polisomnográficos de 7 equipos distintos y generar CSV en formato long compatible con el informe IFN.

> **Status (2026-05-07):** legacy v0 (HTML monolítico) en `legacy-v0/index.html`. Migración a Vite + React + TypeScript modular en progreso.

## Equipos soportados

- Philips Sleepware G3 (PSG completa) — ~212 campos
- Philips Alice NightOne (Poligrafía)
- BrainWave (PSG)
- ResMed AirView (Diagnóstico)
- ResMed AirView (Tratamiento/CPAP)
- BMC (Tratamiento/CPAP)
- BMC (Poligrafía diagnóstica) — datos limitados

## Quick start (legacy v0)

```bash
cd legacy-v0
python3 -m http.server 8765
open http://localhost:8765/index.html
```

## Engine Hipóxico

Score 0-100 con 6 componentes clínicos:
1. Carga acumulativa (T90, T85, T80, HB) — 0-40
2. Ciclicidad (ODI) — 0-16
3. Profundidad (Nadir, % nadir<80) — 0-20
4. Modulador basal (SpO₂ basal vigilia) — 0-8
5. Modulador temporal (IAH REM/NREM ratio) — 0-8
6. Modulador clínico (input manual) — 0-8

Score máximo computable desde PDF: **76/100** (HB + clustering + % nadir<80 requieren señal cruda SpO₂).

Categorías:
- 1-15 → Carga hipóxica leve
- 16-39 → Moderada
- 40-69 → Alta
- 70-100 → Crítica

## Referencias científicas (DOI)

- Azarbarzin A, et al. (2019) Eur Heart J — Hypoxic Burden
- Lavie L. (2003) Sleep Med Rev
- Dewan NA, et al. (2015) Chest
- Somers VK, et al. (2008) Circulation
- Berry RB, et al. AASM Manual v3. 2023

## Licencia

Proprietary — SomnoSalud Team.
