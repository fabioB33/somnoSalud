'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * useConsent — hook para leer/escribir el estado de consentimiento informado.
 *
 * El consent vive en cookie `somno_consent_v1` para que el middleware (Capa 1
 * de ADR-003) pueda leerlo server-side al evaluar bloqueo de /eval/*.
 *
 * Cookie params:
 * - SameSite=Strict: solo same-site requests, mitiga CSRF.
 * - max-age 1 year: re-aceptacion anual.
 * - path=/: visible en todas las rutas.
 * - NO HttpOnly: necesitamos leerla client-side desde este hook.
 * - NO Secure flag en dev (HTTPS solo en Vercel prod).
 *
 * Cuando se cambie el texto del consentimiento (T&C v2), bumping a `somno_consent_v2`
 * en una nueva version del hook + middleware, forzando re-aceptacion.
 *
 * @see docs/vault/architecture/adr/ADR-003-compliance-gates-en-codigo.md
 */

const COOKIE_NAME = 'somno_consent_v1';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 ano

export type ConsentStatus = 'unknown' | 'accepted' | 'rejected';

function readConsentCookie(): ConsentStatus {
  if (typeof document === 'undefined') return 'unknown';
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));
  if (!match) return 'unknown';
  const value = match.split('=')[1];
  if (value === 'accepted') return 'accepted';
  if (value === 'rejected') return 'rejected';
  return 'unknown';
}

function writeConsentCookie(status: 'accepted' | 'rejected'): void {
  if (typeof document === 'undefined') return;
  const isSecure = window.location.protocol === 'https:';
  document.cookie = [
    `${COOKIE_NAME}=${status}`,
    `path=/`,
    `max-age=${COOKIE_MAX_AGE_SECONDS}`,
    `SameSite=Strict`,
    isSecure ? `Secure` : '',
  ]
    .filter(Boolean)
    .join('; ');
}

export function useConsent() {
  // Inicializamos como 'unknown' siempre — la lectura real ocurre en useEffect
  // para evitar hydration mismatch con SSR (document es undefined en el server).
  const [status, setStatus] = useState<ConsentStatus>('unknown');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStatus(readConsentCookie());
    setHydrated(true);
  }, []);

  const accept = useCallback(() => {
    writeConsentCookie('accepted');
    setStatus('accepted');
  }, []);

  const reject = useCallback(() => {
    writeConsentCookie('rejected');
    setStatus('rejected');
  }, []);

  return {
    /** 'unknown' antes del mount (SSR-safe), 'accepted' o 'rejected' despues. */
    status,
    /** True una vez que el hook leyo el cookie del browser (post-mount). */
    hydrated,
    /** Setea cookie + status a 'accepted' (paciente acepto T&C). */
    accept,
    /** Setea cookie + status a 'rejected' (paciente rechazo, futuro use). */
    reject,
  };
}
