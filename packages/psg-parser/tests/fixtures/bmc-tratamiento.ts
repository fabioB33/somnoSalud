/**
 * Fixtures sinteticos parser BMC Tratamiento (CPAP).
 * Sprint 17: strings ficticios, cero datos pacientes reales.
 */

export const BMC_TRATAMIENTO_COMPLETO = `
BMC Medical Co Ltd
INFORME DE TRATAMIENTO

Nombre del paciente: MORALES, CARLOS ALBERTO
Género: Masculino
Edad: 65
Fecha de nacimiento: 1960/8/15

Tipo de dispositivo: G2S 3DT Modelo SN12345
Fecha de inicio 2026-05-01
Informe generado en: 2026/05/15

Promedio tiempo de uso diario(solo días de uso) 7:30
% De días usados >= 4.0 horas 95%

Percentil 95: 11.5 cmH2O
Promedio: 9.8 cmH2O

Índice de apnea hipopnea (AHI): 4.5
Índice de apnea (AI): 2.0
Índice de hipopnea (HI): 2.5
Índice de apnea obstructiva (OAI): 1.8
Índice de apnea central (CAI): 0.2

Fuga Percentil 95: 22.3 LPM
`;

export const BMC_TRATAMIENTO_MINIMO = `
BMC Medical Co
INFORME DE TRATAMIENTO
Nombre del paciente: DIAZ, ROSA
Género: F
Edad: 58
`;
