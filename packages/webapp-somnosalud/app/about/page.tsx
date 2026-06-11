import Link from 'next/link';
import { ArrowRight, BookOpen, Microscope, Stethoscope } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { FadeIn } from '@/components/motion/FadeIn';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';

/**
 * Pantalla /about — informacion del producto + Dr. Pablo Ferrero + IFN.
 *
 * Sprint UX polish 2026-06-11: tipografía display + glass cards + stagger
 * en pilares. Copy y compliance preservados.
 *
 * Server Component puro.
 */
export const metadata = {
  title: 'Sobre SomnoSalud — Dr. Pablo Ferrero · M.N. 119.783',
  description:
    'SomnoSalud es una plataforma médica digital desarrollada por el Instituto Ferrero de Neurología y Sueño (IFN) bajo la dirección del Dr. Pablo Ferrero, M.N. 119.783.',
};

export default function AboutPage() {
  const PILARES = [
    {
      Icon: Microscope,
      tone: 'info',
      title: 'Respaldo científico',
      description:
        'Cada algoritmo está respaldado por publicaciones peer-reviewed con DOI/PMID verificables. Sin pseudociencia, sin opiniones de redes.',
    },
    {
      Icon: Stethoscope,
      tone: 'warm',
      title: 'Práctica clínica real',
      description:
        'El flow refleja el workflow que Pablo usa en consulta: 6 cuestionarios validados (ISI, ESS, STOP-BANG, PHQ-9, GAD-7, DASS-21) + datos de sueño + lab/genéticos opcionales.',
    },
    {
      Icon: BookOpen,
      tone: 'info',
      title: 'Validación abierta',
      description:
        'Los algoritmos serán validados públicamente con sleep specialists colegas antes de cualquier launch masivo. Transparencia total.',
    },
  ] as const;

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="container max-w-3xl flex-1 py-12 md:py-20">
        <FadeIn>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-somno-accent/20 bg-somno-tint-info px-3.5 py-1.5 text-xs font-medium text-somno-accent-soft">
            <Stethoscope size={14} aria-hidden="true" />
            Director médico: Dr. Pablo Ferrero · M.N. 119.783
          </div>

          <h1 className="mb-6 font-display text-5xl font-normal leading-[1.05] tracking-tight md:text-6xl">
            Sobre SomnoSalud
          </h1>

          <p className="mb-10 text-balance text-lg leading-relaxed text-muted-foreground">
            SomnoSalud es una plataforma médica digital que amplifica la
            capacidad de evaluación de trastornos del sueño del{' '}
            <strong className="text-foreground/85">Dr. Pablo Ferrero</strong>{' '}
            en su práctica clínica del Instituto Ferrero de Neurología y
            Sueño (IFN). El objetivo: pasar de{' '}
            <em>1 paciente por consulta presencial</em> a{' '}
            <em>miles de pacientes pre-evaluados a escala</em>, reservando la
            consulta para casos que requieren tratamiento médico activo.
          </p>
        </FadeIn>

        <FadeIn whenInView>
          <section className="mb-12">
            <h2 className="mb-4 font-display text-3xl font-normal tracking-tight">
              Director médico
            </h2>
            <div className="glass-card p-7">
              <p className="mb-2 text-xl font-semibold">Dr. Pablo Ferrero</p>
              <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                Matrícula Nacional:{' '}
                <strong className="text-foreground/85">M.N. 119.783</strong>
                <br />
                Director del Sleep Lab IFN — Instituto Ferrero de Neurología y
                Sueño
                <br />
                Buenos Aires, Argentina
              </p>
              <p className="text-sm leading-relaxed text-foreground/85">
                Médico especialista en trastornos del sueño con más de 20 años
                de práctica clínica. Director y fundador del IFN, sleep lab
                acreditado para diagnóstico polisomnográfico (PSG) y
                tratamiento de insomnio, apnea del sueño (SAHOS), narcolepsia,
                parasomnias, síndrome de piernas inquietas (RLS) y trastornos
                circadianos.
              </p>
            </div>
          </section>
        </FadeIn>

        <FadeIn whenInView>
          <section className="mb-12">
            <h2 className="mb-5 font-display text-3xl font-normal tracking-tight">
              ¿Cómo se construyó esta plataforma?
            </h2>
            <Stagger
              delayChildren={0.1}
              className="grid gap-4 sm:grid-cols-3"
            >
              {PILARES.map(({ Icon, tone, title, description }) => (
                <StaggerItem
                  key={title}
                  className="glass-card card-hover-lift p-5"
                >
                  <div
                    className={`mb-3 inline-flex size-10 items-center justify-center rounded-xl ${
                      tone === 'warm' ? 'badge-tint-warm' : 'badge-tint-info'
                    }`}
                  >
                    <Icon
                      size={18}
                      aria-hidden="true"
                      className={
                        tone === 'warm'
                          ? 'text-somno-warm'
                          : 'text-somno-accent'
                      }
                    />
                  </div>
                  <h3 className="mb-2 text-base font-semibold tracking-tight">
                    {title}
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </StaggerItem>
              ))}
            </Stagger>
          </section>
        </FadeIn>

        <FadeIn whenInView>
          <section className="glass-card mb-12 p-7">
            <h2 className="mb-4 font-display text-2xl font-normal tracking-tight">
              Compliance regulatorio
            </h2>
            <p className="mb-4 text-sm text-foreground/85">
              SomnoSalud opera en Argentina bajo el siguiente marco
              regulatorio:
            </p>
            <ul className="space-y-2.5 text-sm text-foreground/85">
              {[
                {
                  strong: 'Ley 25.326',
                  rest: ' — Protección de Datos Personales.',
                },
                {
                  strong: 'Ley 26.529',
                  rest: ' — Derechos del Paciente.',
                },
                {
                  strong: 'Disposición ANMAT 18/2017',
                  rest: ' — Software médico (clasificación Clase I orientativo, pendiente registro formal pre-launch público).',
                },
                {
                  strong: 'Decreto 1089/2012',
                  rest: ' — Datos genéticos (consent granular cuando aplique).',
                },
              ].map(({ strong, rest }) => (
                <li key={strong} className="flex gap-3">
                  <span
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-somno-accent"
                    aria-hidden="true"
                  />
                  <span>
                    <strong className="text-foreground">{strong}</strong>
                    {rest}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-muted-foreground">
              Ver{' '}
              <Link
                href="/privacidad"
                className="text-somno-accent underline-offset-4 hover:underline"
              >
                política de privacidad completa
              </Link>{' '}
              o{' '}
              <Link
                href="/terms"
                className="text-somno-accent underline-offset-4 hover:underline"
              >
                términos y condiciones
              </Link>
              .
            </p>
          </section>
        </FadeIn>

        <FadeIn whenInView>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Button
              size="lg"
              asChild
              className="group h-12 rounded-full px-6 text-base shadow-glow-accent transition-all hover:shadow-[0_0_44px_rgba(129,140,248,0.45)]"
            >
              <Link href="/disclaimer">
                Empezar evaluación
                <ArrowRight
                  aria-hidden="true"
                  className="ml-1 transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </Button>
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
      </main>

      <PublicFooter />
    </div>
  );
}
