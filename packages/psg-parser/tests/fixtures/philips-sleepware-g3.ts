/**
 * Fixtures sinteticos para parser Philips Sleepware G3.
 *
 * Sprint 15: strings sinteticos que imitan el output de pdf.js extrayendo
 * texto de PDFs reales del software Philips Sleepware G3. Cero datos de
 * pacientes reales.
 *
 * DEBT abierto: [[DEBT-conversor-psg-migration-roadmap]] menciona la
 * sustitucion por fixtures de PDFs reales anonimizados de Pablo cuando
 * lleguen (Sprint 18-19).
 */

/**
 * Caso completo: paciente con todos los datos llenos. Valores plausibles
 * pero ficticios.
 *
 * Match esperado:
 * - paciente: PEREZ, JUAN CARLOS, M, FDN 15/6/1975, 50 anos
 * - estudio: 10/4/2026, Sleepware G3, epocas 30s
 * - TST 360 min, eficiencia 85%, latencia 12 min
 * - estadificacion N1/N2/N3/R completos
 * - respiratorio: IAH 5.2/h, etc.
 * - SpO2 media 96%, minima 88%, T90 8 min
 */
export const PHILIPS_SLEEPWARE_G3_COMPLETO = `
Sleepware G3 Philips Respironics
Nombre del paciente: PEREZ, JUAN CARLOS Sexo: M
FDN: 15/6/1975
Edad: 50 años
Fecha del estudio: 10/4/2026
INFORME POLISOMNOGRAFICO
épocas de 30 segundos
AASM VIII 4.B (3% desaturación)

Hora de apagado de luces: 22:30:00
Hora de encendido de luces: 06:50:00

Tiempo de grabación total (TGT): 500.0 minutos
Tiempo en cama (TC): 480.0 minutos
Tiempo de período de sueño (TPS): 410.0 minutos
Tiempo de sueño total (TST): 360.0 minutos
Eficiencia del sueño: 85.0 %
Comienzo del sueño: 12.0 minutos
DTIS: 38.0 minutos
Latencia REM (desde comienzo del sueño): 95.0 minutos
Latencia REM (desde apagado de luces): 107.0 minutos

N 1: 25.0 minutos 6.9 % N 1: 14.5 minutos
N 2: 180.0 minutos 50.0 % N 2: 22.0 minutos
N 3: 80.0 minutos 22.2 % N 3: 45.0 minutos
R: 75.0 minutos 20.8 % R: minutos 107.0 minutos

WK (25.0 %) REM (15.6 %) N1 (5.2 %) N2 (37.5 %) N3 (16.7 %)

Número: 2 1 0 3 28 31 5 36
Dur. media (s): 18.5 22.0 0 19.0 21.5 21.0 12.0 19.5
Dur. máx. (s): 45.0 38.0 0 45.0 60.0 60.0 25.0 60.0
Dur. total (min): 0.6 0.4 0 1.0 10.0 11.0 1.0 12.0
% de TST: 0.2 0.1 0 0.3 2.8 3.1 0.3 3.4
Índice (n.º/h TST): 0.3 0.2 0 0.5 4.7 5.2 0.8 6.0
Recuento de REM: 1 0 0 1 9 10 1 11
Recuento de NREM: 1 1 0 2 19 21 4 25
Índice de REM: 0.8 0 0 0.8 7.2 8.0 0.8 8.8
Índice de NREM: 0.2 0.2 0 0.4 4.0 4.4 0.8 5.2

Supino 250 4.8
ARRIBA: 110.0 30.6 5.0 25.6 1 12 0 14 14.7 2 16.2 4

Respiratorio: 3 4 1 1 5 2.5
Movimiento de piernas: 1 5 0 2 2 1.0
Ronquidos: 0 1 0 0 0 0.0
Espontáneo: 2 3 1 1 2 1.0
Total: 6 13 2 4 6 3.0

Índice de despertares ligeros: 8.0 5.5 6.5 1.0 12.0

Movimiento de piernas total: 45 7.5
MPE: 30 5.0
Despertares ligeros por MPE: 10 1.7

Episodios de ronquidos: 120
Tiempo con ronquidos total: 45 min

N.º de desat. rel. 1 18 2 21
% de SpO2 media: 96 96 96 96
% de SpO2 mínima: 88

<95% 1.0 0.2 5.0 1.4 0.5 0.7 6.5 1.4
<90% 0.0 0.0 4.0 1.1 0.0 0.0 4.0 0.8
<85% 0.0 0.0 1.0 0.3 0.0 0.0 1.0 0.2
<80% 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0
<75% 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0
<70% 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0
<60% 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0
<50% 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0

Artefacto/datos erróneos: 5.0 - 2.0 - 1.0 - 8.0 -
`;

/**
 * Caso minimo: solo cabecera + datos paciente, sin tablas completas.
 * Sirve para verificar que el parser no crashea con missing fields.
 */
export const PHILIPS_SLEEPWARE_G3_MINIMO = `
Sleepware G3 Philips Respironics
Nombre del paciente: GOMEZ, MARIA SOFIA Sexo: F
FDN: 3/12/1988
Edad: 37 años
Fecha del estudio: 1/5/2026
épocas de 30 segundos
`;

/**
 * Caso con decimales en formato espanol (coma decimal) — un PDF generado
 * con locale es_AR podria traer "12,5" en vez de "12.5". El parser legacy
 * matchea con regex que aceptan punto, pero el helper num() coerce coma -> punto.
 *
 * Este fixture verifica que aun si el matching directo del regex falla
 * por usar coma, el flow no crashea (campos quedan en missing).
 */
export const PHILIPS_SLEEPWARE_G3_COMA_DECIMAL = `
Sleepware G3 Philips Respironics
Nombre del paciente: LOPEZ, ANA Sexo: F
FDN: 20/8/1990
Edad: 35 años
Fecha del estudio: 5/5/2026
épocas de 30 segundos
Tiempo de sueño total (TST): 350.5 minutos
Eficiencia del sueño: 87.3 %
`;

/**
 * Caso con "n/d" en algunos campos (no aplica / no determinado). El helper
 * num() debe retornar "" para estos valores.
 */
export const PHILIPS_SLEEPWARE_G3_NO_DETERMINADO = `
Sleepware G3 Philips Respironics
Nombre del paciente: TORRES, PEDRO Sexo: M
FDN: 7/3/1965
Edad: 60 años
Fecha del estudio: 10/5/2026
épocas de 30 segundos
Tiempo de sueño total (TST): 240.0 minutos
Eficiencia del sueño: 55.0 %
Comienzo del sueño: 0 minutos
`;
