'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Phone, Stethoscope } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface BlockingRule {
  ruleCode: string;
  ruleName: string;
  message: string;
  action: string;
  references: string[];
}

interface BlockingEvaluation {
  rules: Array<{
    ruleCode: string;
    ruleName: string;
    triggered: boolean;
    severity: 'block' | 'restrict' | 'warn' | 'clear';
    message: string;
    action: string;
    references: string[];
  }>;
}

/**
 * DerivacionContent — Client Component que lee la evaluacion bloqueante
 * desde sessionStorage y muestra el detalle de las rules disparadas.
 *
 * Si no hay evaluacion en sessionStorage (acceso directo a la URL),
 * muestra mensaje generico de derivacion.
 */
export function DerivacionContent() {
  const [blockingRules, setBlockingRules] = useState<BlockingRule[] | null>(
    null,
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(
        'somno_blocking_evaluation_v1',
      );
      if (raw) {
        const evaluation = JSON.parse(raw) as BlockingEvaluation;
        const blocking = evaluation.rules
          .filter((r) => r.triggered && r.severity === 'block')
          .map((r) => ({
            ruleCode: r.ruleCode,
            ruleName: r.ruleName,
            message: r.message,
            action: r.action,
            references: r.references,
          }));
        setBlockingRules(blocking);
      }
    } catch {
      /* silent fail */
    }
    setHydrated(true);
  }, []);

  return (
    <>
      {hydrated && blockingRules && blockingRules.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Reglas de seguridad activadas</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 space-y-3">
              {blockingRules.map((rule) => (
                <li key={rule.ruleCode}>
                  <p className="font-medium">
                    {rule.ruleCode} — {rule.ruleName}
                  </p>
                  <p className="mt-1 text-sm">{rule.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Acción recomendada: {rule.action}
                  </p>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Alert variant="info" className="mb-6">
        <Stethoscope className="h-5 w-5" aria-hidden="true" />
        <AlertTitle>Por qué bloqueamos esta evaluación</AlertTitle>
        <AlertDescription>
          Las recomendaciones que daríamos para tu caso podrían no ser
          seguras sin evaluación clínica presencial. Esto NO significa que
          haya un problema grave — simplemente que un especialista necesita
          ajustar las recomendaciones a tu situación particular.
        </AlertDescription>
      </Alert>

      <section className="mb-8 rounded-lg border border-border/60 bg-card/40 p-6">
        <h2 className="mb-4 text-lg font-semibold">Contacto especialista</h2>
        <div className="space-y-3 text-sm text-foreground/90">
          <p>
            <strong>Instituto Ferrero de Neurología y Sueño (IFN)</strong>
            <br />
            Director: Dr. Pablo Ferrero — M.N. 119.783
            <br />
            Buenos Aires, Argentina
          </p>
          <p>
            Para coordinar una consulta:{' '}
            <a
              href="https://ifn.com.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 hover:underline"
            >
              ifn.com.ar
            </a>
          </p>
        </div>
      </section>

      <section className="mb-8 rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-6">
        <div className="flex items-start gap-3">
          <Phone
            className="mt-0.5 shrink-0 text-yellow-400"
            size={20}
            aria-hidden="true"
          />
          <div className="text-sm leading-relaxed">
            <h3 className="mb-2 font-semibold text-yellow-200">
              Si necesitás ayuda urgente
            </h3>
            <p>
              Si tenés pensamientos de hacerte daño o pensás en el suicidio,
              llamá ahora a la línea de salud mental gratuita 24/7:{' '}
              <strong className="text-yellow-100">0800-999-0091</strong>{' '}
              (Argentina).
            </p>
          </div>
        </div>
      </section>

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <Button variant="outline" size="lg" asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </>
  );
}
