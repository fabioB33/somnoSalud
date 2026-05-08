import Link from 'next/link';
import { Phone, Stethoscope } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * Pantalla /eval/menor-no-permitido — destino del redirect cuando edad <18.
 *
 * Compliance gate Capa 3 de ADR-003: SAFE-010 del clinical-engine + decision
 * clinica Pablo Ferrero. Personas <18 anos NO pueden completar evaluacion
 * auto-administrada. Se les ofrece info de contacto con especialista.
 *
 * Server Component (default) — solo informacion estatica.
 *
 * @see packages/clinical-engine/src/safety/rules.ts (SAFE-010)
 * @see docs/vault/architecture/adr/ADR-003-compliance-gates-en-codigo.md (Capa 3)
 */
export default function MenorNoPermitidoPage() {
  return (
    <main className="min-h-dvh">
      <div className="container max-w-2xl py-12 md:py-20">
        <h1 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl">
          Evaluación no disponible para menores de 18 años
        </h1>

        <Alert variant="info" className="mb-8">
          <Stethoscope className="h-5 w-5" aria-hidden="true" />
          <AlertTitle>Te recomendamos consultar con un especialista</AlertTitle>
          <AlertDescription>
            <p className="mb-3">
              La evaluación auto-administrada de SomnoSalud está diseñada para
              personas de <strong>18 años o más</strong>. Para menores de
              edad, los trastornos del sueño se evalúan en consulta con un
              especialista junto con un padre, madre o tutor legal.
            </p>
            <p>
              Esta restricción es parte de nuestras reglas de seguridad clínica
              (SAFE-010) — el sueño en niños y adolescentes requiere
              evaluación presencial con consentimiento de un adulto
              responsable.
            </p>
          </AlertDescription>
        </Alert>

        <section className="mb-10 rounded-lg border border-border/60 bg-card/40 p-6">
          <h2 className="mb-4 text-lg font-semibold">
            Contacto con especialista
          </h2>
          <div className="space-y-3 text-sm text-foreground/90">
            <p>
              <strong>Instituto Ferrero de Neurología y Sueño (IFN)</strong>
              <br />
              Director: Dr. Pablo Ferrero — M.N. 119.783
              <br />
              Buenos Aires, Argentina
            </p>
            <p>
              Para coordinar una evaluación pediátrica del sueño, contactá al
              IFN con un padre, madre o tutor legal presente. Información de
              contacto disponible en{' '}
              <a
                href="https://ifn.com.ar"
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:underline"
              >
                ifn.com.ar
              </a>
              .
            </p>
          </div>
        </section>

        <section className="mb-10 rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-6">
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
                (Argentina) o acercate al servicio de emergencia más cercano.
              </p>
            </div>
          </div>
        </section>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <Button variant="outline" size="lg" asChild>
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
