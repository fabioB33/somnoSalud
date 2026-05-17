/**
 * Fixtures sinteticos para parser ResMed AirView Diagnostico (poligrafia).
 *
 * Sprint 16: strings sinteticos. ResMed tiene formato peculiar con headers
 * tipo "IAH: X.X IA: X.X IH: X.X" en una sola linea.
 */

export const RESMED_DIAGNOSTICO_COMPLETO = `
ResMed AirView Informe de diagnóstico
10/4/2026 FERNANDEZ, MIGUEL INSTITUTO IFN
Fecha de nacimiento: 22/9/1968 Edad: 57

Datos de la grabación 10/4/2026
Dispositivo ApneaLink Air Tipo: III

Evaluación del flujo Duración – h: 8:30

Índice de eventos IAH: 22.5 IA: 8.0 IH: 14.5
Eventos totales Apneas: 64 Hipopneas: 116
AI Obstructiva: 6.5 Central: 1.0 Mixta: 0.5
Cheyne-Stokes Tiempo – h: 0:15 Porcentaje: 3

Desaturación de oxígeno IDO: 18.5
% de saturación de oxígeno Línea basal: 96 Promedio: 93 Mínimo: 78

<=88% sat: tiempo-h: 0:45

Supino Tiempo – h 5:15 28.5
Supino IAH: 28.5
No supino IAH: 12.0

Pulso – rpm Mín.: 52 Promedio: 68 Máx.: 95

Ronquidos: 145

Criterios análisis: AASM 2012 4% desaturación;
`;

export const RESMED_DIAGNOSTICO_MINIMO = `
ResMed AirView Informe de diagnóstico
5/5/2026 LOPEZ, CARLOS INSTITUTO IFN
Edad: 45
Datos de la grabación 5/5/2026
Dispositivo ApneaLink Tipo: II
`;
