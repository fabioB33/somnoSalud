'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useConsent } from '@/hooks/useConsent';

/**
 * TermsForm — Client Component que captura el consent del paciente.
 *
 * Compliance gate: checkbox NO pre-marcado (Ley 25.326 art. 6 + buena practica
 * GDPR-aligned). Boton "Aceptar" disabled hasta que se marca.
 *
 * Cuando se acepta:
 * 1. Setea cookie `somno_consent_v1=accepted` (1 ano TTL, SameSite=Strict).
 * 2. Loguea timestamp en sessionStorage para auditoria local.
 * 3. Redirige a la URL recibida en `redirectTo` (default /eval/profile).
 *
 * Es Client Component porque necesita useState + useRouter + writeable cookies
 * desde el browser. La pantalla parent (page.tsx) sigue siendo Server Component
 * para que el T&C text se prerendere estatico.
 *
 * @see docs/vault/architecture/adr/ADR-003-compliance-gates-en-codigo.md (Capa 1)
 * @see docs/vault/concepts/CONVENCIONES-FRONTEND-WEBAPP.md §1
 */
export function TermsForm({ redirectTo }: { redirectTo: string }) {
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { accept } = useConsent();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed || submitting) return;

    setSubmitting(true);

    // 1. Setear cookie consent (server-readable por middleware Capa 1).
    accept();

    // 2. Log local timestamp para auditoria (Sprint 11+ migra a Supabase tabla audit_log).
    if (typeof window !== 'undefined') {
      try {
        const log = {
          version: 'v1',
          accepted_at: new Date().toISOString(),
          user_agent: window.navigator.userAgent,
        };
        window.sessionStorage.setItem(
          'somno_consent_log_v1',
          JSON.stringify(log),
        );
      } catch {
        // Silent fail — no bloquear flow si sessionStorage no esta disponible.
      }
    }

    // 3. Redirect a la pantalla original (default /eval/profile).
    router.push(redirectTo);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-border/60 bg-card/40 p-6"
    >
      <div className="mb-6 flex items-start gap-3">
        <Checkbox
          id="consent"
          checked={agreed}
          onCheckedChange={(checked) => setAgreed(checked === true)}
          aria-describedby="consent-desc"
        />
        <Label htmlFor="consent" className="cursor-pointer text-sm leading-snug">
          <span className="font-medium">Leí y acepto los términos arriba.</span>
          <span
            id="consent-desc"
            className="mt-1 block text-xs font-normal text-muted-foreground"
          >
            Confirmo que entiendo que esta evaluación es orientativa y NO
            reemplaza la consulta médica. Soy mayor de 18 años. Doy mi
            consentimiento explícito para procesar mis respuestas según la
            política de privacidad descrita arriba.
          </span>
        </Label>
      </div>

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <Button type="submit" size="lg" disabled={!agreed || submitting}>
          {submitting ? 'Procesando...' : 'Aceptar y continuar'}
          <ArrowRight aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.push('/')}
        >
          Cancelar y volver
        </Button>
      </div>
    </form>
  );
}
