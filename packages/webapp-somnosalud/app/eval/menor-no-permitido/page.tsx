import Link from 'next/link';
import { Phone, Stethoscope } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FadeIn } from '@/components/motion/FadeIn';

/**
 * Pantalla /eval/menor-no-permitido — destino del redirect cuando edad <18.
 *
 * Sprint UX polish 2026-06-11: tipografía display + glass + jerarquía.
 *
 * Compliance gate Capa 3 de ADR-003: SAFE-010 del clinical-engine + decision
 * clinica Pablo Ferrero.
 *
 * @see packages/clinical-engine/src/safety/rules.ts (SAFE-010)
 * @see docs/vault/architecture/adr/ADR-003-compliance-gates-en-codigo.md (Capa 3)
 */
export default function MenorNoPermitidoPage() {
  return (
    <main className="min-h-dvh">
      <div className="container max-w-2xl py-12 md:py-20">
        <FadeIn>
          <h1 className="mb-8 font-display text-4xl font-normal leading-[1.05] tracking-tight md:text-5xl">
            Evaluación no disponible para menores de 18 años
          </h1>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Alert
            variant="info"
            className="mb-8 rounded-2xl border-somno-accent/30 bg-somno-tint-info"
          >
            <Stethoscope
              className="h-5 w-5 text-somno-accent"
              aria-hidden="true"
            />
            <AlertTitle className="font-semibold text-somno-accent-soft">
              Te recomendamos consultar con un especialista
            </AlertTitle>
            <AlertDescription className="text-foreground/85">
              <p className="mb-3 leading-relaxed">
                La evaluación auto-administrada de SomnoSalud está diseñada
                para personas de <strong>18 años o más</strong>. Para menores
                de edad, los trastornos del sueño se evalúan en consulta con
                un especialista junto con un padre, madre o tutor legal.
              </p>
              <p className="leading-relaxed">
                Esta restricción es parte de nuestras reglas de seguridad
                clínica (SAFE-010) — el sueño en niños y adolescentes
                requiere evaluación presencial con consentimiento de un
                adulto responsable.
              </p>
            </AlertDescription>
          </Alert>
        </FadeIn>

        <FadeIn delay={0.15}>
          <section className="glass-card mb-6 p-7">
            <div className="mb-4 flex items-center gap-3">
              <div className="badge-tint-info inline-flex size-10 items-center justify-center rounded-xl">
                <Stethoscope
                  className="size-5 text-somno-accent"
                  aria-hidden="true"
                />
              </div>
              <h2 className="text-lg font-semibold tracking-tight">
                Contacto con especialista
              </h2>
            </div>
            <div className="space-y-3 text-sm leading-relaxed text-foreground/85">
              <p>
                <strong className="text-foreground">
                  Instituto Ferrero de Neurología y Sueño (IFN)
                </strong>
                <br />
                Director: Dr. Pablo Ferrero — M.N. 119.783
                <br />
                Buenos Aires, Argentina
              </p>
              <p>
                Para coordinar una evaluación pediátrica del sueño, contactá
                al IFN con un padre, madre o tutor legal presente.
                Información de contacto disponible en{' '}
                <a
                  href="https://ifn.com.ar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-somno-accent underline-offset-4 hover:underline"
                >
                  ifn.com.ar
                </a>
                .
              </p>
            </div>
          </section>
        </FadeIn>

        <FadeIn delay={0.2}>
          <section className="mb-10 rounded-2xl border border-somno-warm/30 bg-somno-tint-warn p-6">
            <div className="flex items-start gap-3">
              <div className="badge-tint-warm inline-flex size-10 shrink-0 items-center justify-center rounded-xl">
                <Phone
                  className="size-5 text-somno-warm"
                  aria-hidden="true"
                />
              </div>
              <div className="text-sm leading-relaxed">
                <h3 className="mb-2 text-base font-semibold text-somno-warm-soft">
                  Si necesitás ayuda urgente
                </h3>
                <p className="text-foreground/85">
                  Si tenés pensamientos de hacerte daño o pensás en el
                  suicidio, llamá ahora a la línea de salud mental gratuita
                  24/7:{' '}
                  <strong className="font-mono text-foreground">
                    0800-999-0091
                  </strong>{' '}
                  (Argentina) o acercate al servicio de emergencia más
                  cercano.
                </p>
              </div>
            </div>
          </section>
        </FadeIn>

        <FadeIn delay={0.25}>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Button
              variant="outline"
              size="lg"
              asChild
              className="h-12 rounded-full border-white/[0.10] bg-white/[0.02] px-6 text-base hover:bg-white/[0.06]"
            >
              <Link href="/">Volver al inicio</Link>
            </Button>
          </div>
        </FadeIn>
      </div>
    </main>
  );
}
