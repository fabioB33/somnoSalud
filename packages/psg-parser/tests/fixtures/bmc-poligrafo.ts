/**
 * Fixtures sinteticos parser BMC Poligrafia diagnostica.
 *
 * Sprint 17: caso especial — el reporte BMC poligrafia tiene la mayoria de los
 * datos como imagenes. Solo extraemos paciente del texto disponible + un
 * warning explicito en missing[].
 */

export const BMC_POLIGRAFO_TIPICO = `
BMC SWStaging
Arquitectura del Sueño
Evento Respiratorio

Nombre del paciente: LOPEZ, EMILIA
`;

export const BMC_POLIGRAFO_SIN_PACIENTE = `
BMC SWStaging Arquitectura del Sueño
`;
