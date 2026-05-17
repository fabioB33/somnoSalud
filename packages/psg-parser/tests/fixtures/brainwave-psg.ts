/**
 * Fixtures sinteticos para parser BrainWave PSG.
 *
 * Sprint 16: strings sinteticos. Cero datos pacientes reales.
 * DEBT abierto: [[DEBT-conversor-psg-migration-roadmap]] reemplazar
 * por PDFs reales anonimizados de IFN en Sprint 18-19.
 */

/**
 * Caso completo BrainWave:
 * - Paciente sin coma (GONZALEZ, LAURA GABRIELA tokenizado)
 * - Sexo "Femenino" (full word)
 * - Fecha DD-MM-YYYY
 * - Hora apagado/encendido con AM/PM
 * - SpO2 umbrales <88 + <92 + <90 + etc.
 * - Posicion No-Supino (no "ARRIBA")
 */
export const BRAINWAVE_COMPLETO = `
INFORME POLISOMNOGRAFICO estadificacion neumologica
Nombre del paciente: LAURA GABRIELA GONZALEZ Sexo: Femenino
Edad: 45 años
Fecha del estudio: 23-03-2026
épocas de 30 segundos
AASM 4.B (3% desaturación).

Hora de apagado de luces: 23/03/2026 10:30 PM
Hora de encendido de luces: 24/03/2026 06:45 AM

Tiempo de grabación total (TGT): 510.0 minutos
Tiempo en cama (TC): 495.0 minutos
Tiempo de período de sueño (TPS): 420.0 minutos
Tiempo de sueño total (TST): 380.0 minutos
Eficiencia del sueño: 76.7 %
Comienzo del sueño: 15.0 minutos
DTIS: 40.0 minutos
Latencia REM (desde comienzo del sueño): 120.0
Latencia REM (desde apagado de luces): 135.0

N 1: 30.0 minutos 7.9 %
N 2: 200.0 minutos 52.6 %
N 3: 70.0 minutos 18.4 %
R: 80.0 minutos 21.1 %

AC AO AM Apnea Hipop A+H RERA Total
Número: 1 3 0 4 25 29 6 35
Dur. media (s): 20 18 0 18 22 21 14 19
Dur. máx. (s): 40 50 0 50 65 65 30 65
Dur. total (min): 0.3 0.9 0 1.2 9.0 10.2 1.4 11.6
Índice (n.º/h TST): 0.2 0.5 0 0.6 4.0 4.6 0.9 5.5

Supino 280.0 5.5
No-Supino 100.0 26.3 6.5 19.8 1 14 0 13 16.8 5 18.0

%  de SpO2 media: 95 95 95 95
%  de SpO2 mínima: 87

<88% 1.5 0.4 4.0 1.1 0.3 0.4 5.8 1.2
<92% 5.0 1.3 18.0 4.7 1.0 1.3 24.0 4.8
<90% 1.0 0.3 3.0 0.8 0.0 0.0 4.0 0.8
<85% 0.0 0.0 0.5 0.1 0.0 0.0 0.5 0.1
<80% 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0
<70% 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0
<60% 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0
<50% 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0

N.º de desat. rel. 1 16 3 20

Episodios de ronquidos: 200
Movimiento de piernas total: 60 9.5
MPE: 40 6.3
`;

/**
 * Caso paciente con coma (sintaxis ya soportada en Sleepware G3 + BW).
 */
export const BRAINWAVE_CON_COMA = `
INFORME POLISOMNOGRAFICO
Nombre del paciente: MARTINEZ, ROBERTO Sexo: M
Edad: 58 años
Fecha del estudio: 5/4/2026
épocas de 30 segundos
Tiempo de sueño total (TST): 320.0 minutos
Eficiencia del sueño: 70.0 %
`;

/**
 * Caso minimo: solo paciente sin tablas.
 */
export const BRAINWAVE_MINIMO = `
INFORME POLISOMNOGRAFICO
Nombre del paciente: PEREZ JUAN Sexo: Masculino
Edad: 60 años
Fecha del estudio: 1/5/2026
épocas de 30 segundos
`;
