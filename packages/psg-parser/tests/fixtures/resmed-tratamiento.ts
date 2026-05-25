/**
 * Fixtures sinteticos parser ResMed AirView Tratamiento.
 * Sprint 17: strings ficticios, cero datos pacientes reales.
 */

export const RESMED_TRATAMIENTO_COMPLETO = `
ResMed AirView Informe de cumplimiento
Identificación del paciente: GARCIA Lucia Maria
Fecha de nacimiento: 5/3/1972
Edad: 53 años

AirSense 10 AutoSet

20/04/2026 - 21/04/2026

Uso promedio diario: 6 horas 45 minutos
Días de uso 28/30
>= 4 horas 24 días (80%)

Presión Mediana: 9.5 cmH2O
Percentil 95: 12.3 cmH2O

IAH: 3.2
IA: 1.5
IH: 1.7
IAC: 0,3
IAO: 1,2
RERA: 0,8

Cheyne-Stokes 12 minutos (3%)

SpO2 Mediana: 94
Tiempo < 88%: 5 min

Fuga Percentil 95: 18.5
`;

export const RESMED_TRATAMIENTO_MINIMO = `
ResMed AirView Informe de tratamiento
Identificación del paciente: PEREZ Juan
Edad: 60 años
AirSense 11
1/5/2026 - 2/5/2026
`;
