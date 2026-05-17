/**
 * Fixtures sinteticos para parser Philips Alice NightOne (poligrafia).
 *
 * Sprint 16: strings sinteticos. NightOne tiene texto mezclado ingles/espanol
 * porque el software es Philips internacional con strings localizados.
 */

export const NIGHTONE_COMPLETO = `
Alice NightOne Informe de prueba del sueño
Nombre del paciente: RODRIGUEZ, ELENA Sexo: F
Edad: 48 años
FDN: 12/8/1977
Study Date: 15/4/2026

Tiempo de grabación total (TGT): 480.0 minutes
Tiempo en cama (TC): 460.0 minutes
Tiempo de monitorización (TM): 420.0 minutes

Apneas centrales 0.5 4
Apneas obstructivas 6.2 43
Apneas mixtas 0.1 1
Hipopneas 8.5 60
Apneas + hipopneas 15.3 108
RERA 1.5 10
Total 16.8 118

Supino 280 18.5

%  de SpO2 más baja durante el sueño: 82
Media (%) 94

N.º total de desat. 95
Índice desat. (n.º/hora) 13.5

<90 % 35.2
<85 % 12.0

FC media durante el sueño 68
Episodios de ronquidos totales 250
`;

export const NIGHTONE_MINIMO = `
Alice NightOne Informe de prueba del sueño
Nombre del paciente: SILVA, ANA Sexo: F
Edad: 35 años
Study Date: 20/4/2026
`;
