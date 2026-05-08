/**
 * persist.ts — wrappers type-safe para sessionStorage.
 *
 * Decision arquitectural: hasta Sprint 11 (Supabase auth + persistence),
 * la evaluacion vive 100% client-side en sessionStorage. Cuando arranque
 * Supabase, este modulo se reemplaza por client.ts del SDK + RLS.
 *
 * sessionStorage (no localStorage) porque:
 * - Privacidad: si el paciente cierra la pestana, los datos se pierden.
 * - Compliance Ley 25.326 art. 6 (consentimiento explicito): el paciente
 *   debe re-consentir si re-abre la app. localStorage daria persistencia
 *   indefinida sin nuevo consent.
 *
 * Para el flag de consent (que SI persiste entre sesiones por 1 ano),
 * se usa cookie `somno_consent_v1` — leida server-side en middleware.
 *
 * @see docs/vault/architecture/adr/ADR-003-compliance-gates-en-codigo.md
 */

const STORAGE_VERSION = 'v1';
const KEY_PREFIX = 'somno' as const;

export const STORAGE_KEYS = {
  evaluation: `${KEY_PREFIX}_eval_${STORAGE_VERSION}`,
  consentLog: `${KEY_PREFIX}_consent_log_${STORAGE_VERSION}`,
} as const;

/** Verifica si sessionStorage esta disponible (puede no estarlo en SSR o navegadores muy viejos). */
export function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const test = '__test__';
    window.sessionStorage.setItem(test, test);
    window.sessionStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Lee un valor de sessionStorage con type safety.
 * Devuelve null si la key no existe o el valor no es JSON valido.
 */
export function loadFromStorage<T>(key: string): T | null {
  if (!isStorageAvailable()) return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    // Si JSON.parse falla, asumimos data corrupta y la limpiamos.
    console.warn(`[persist] failed to parse ${key}, clearing:`, err);
    window.sessionStorage.removeItem(key);
    return null;
  }
}

/** Escribe un valor en sessionStorage. Falla silenciosamente si storage no disponible. */
export function saveToStorage<T>(key: string, value: T): void {
  if (!isStorageAvailable()) return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    // QuotaExceededError u otros — fallar silencioso, no bloquear UI.
    console.warn(`[persist] failed to save ${key}:`, err);
  }
}

/** Elimina una key de sessionStorage. */
export function removeFromStorage(key: string): void {
  if (!isStorageAvailable()) return;
  window.sessionStorage.removeItem(key);
}

/** Limpia toda la data de SomnoSalud en sessionStorage (uso: "Empezar de nuevo"). */
export function clearAllStorage(): void {
  if (!isStorageAvailable()) return;
  Object.values(STORAGE_KEYS).forEach((key) => {
    window.sessionStorage.removeItem(key);
  });
}
