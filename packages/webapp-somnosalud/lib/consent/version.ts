/**
 * Versionado del consentimiento informado.
 *
 * Single source of truth para que cookie/profile/audit_log/evaluations
 * compartan el mismo identificador de version. Si Pablo o legal piden
 * cambiar el texto de T&C, bumpeamos esta constante y forzamos
 * re-aceptacion (middleware podria comparar versions, sprint futuro).
 *
 * Convencion: vN (v1, v2, ...). Cambios de wording de T&C que NO
 * afecten compliance NO requieren bump.
 */
export const CONSENT_TERMS_VERSION = 'v1' as const;
export type ConsentTermsVersion = typeof CONSENT_TERMS_VERSION;
