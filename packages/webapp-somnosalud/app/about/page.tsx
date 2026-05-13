import Link from 'next/link';
import { ArrowRight, BookOpen, Microscope, Stethoscope } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PublicFooter } from '@/components/layout/PublicFooter';

/**
 * Pantalla /about — informacion del producto + Dr. Pablo Ferrero + IFN.
 *
 * Compliance Ley 26.529: director medico responsable identificable
 * publicamente con su matricula nacional.
 *
 * Server Component puro.
 */
export const metadata = {
  title: 'Sobre SomnoSalud — Dr. Pablo Ferrero · M.N. 119.783',
  description:
    'SomnoSalud es una plataforma médica digital desarrollada por el Instituto Ferrero de Neurología y Sueño (IFN) bajo la dirección del Dr. Pablo Ferrero, M.N. 119.783.',
};

export default function AboutPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="container max-w-3xl flex-1 py-12 md:py-20">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Stethoscope size={14} aria-hidden="true" />
          Director médico: Dr. Pablo Ferrero · M.N. 119.783
        </div>

        <h1 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl">
          Sobre SomnoSalud
        </h1>

        <p className="mb-8 text-lg text-muted-foreground">
          SomnoSalud es una plataforma médica digital que amplifica la
          capacidad de evaluación de trastornos del sueño del{' '}
          <strong>Dr. Pablo Ferrero</strong> en su práctica clínica del
          Instituto Ferrero de Neurología y Sueño (IFN). El objetivo: pasar
          de <em>1 paciente por consulta presencial</em> a{' '}
          <em>miles de pacientes pre-evaluados a escala</em>, reservando la
          consulta para casos que requieren tratamiento médico activo.
        </p>

        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold">Director médico</h2>
          <div className="rounded-lg border border-border/60 bg-card/40 p-6">
            <p className="mb-2 text-lg font-semibold">
              Dr. Pablo Ferrero
            </p>
            <p className="mb-2 text-sm text-muted-foreground">
              Matrícula Nacional: <strong>M.N. 119.783</strong>
              <br />
              Director del Sleep Lab IFN — Instituto Ferrero de Neurología y
              Sueño
              <br />
              Buenos Aires, Argentina
            </p>
            <p className="text-sm text-foreground/90">
              Médico especialista en trastornos del sueño con más de 20 años
              de práctica clínica. Director y fundador del IFN, sleep lab
              acreditado para diagnóstico polisomnográfico (PSG) y
              tratamiento de insomnio, apnea del sueño (SAHOS), narcolepsia,
              parasomnias, síndrome de piernas inquietas (RLS) y trastornos
              circadianos.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold">
            ¿Cómo se construyó esta plataforma?
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Microscope
                    className="text-somno-accent"
                    size={18}
                    aria-hidden="true"
                  />
                  Respaldo científico
                </CardTitle>
                <CardDescription className="text-xs">
                  Cada algoritmo está respaldado por publicaciones
                  peer-reviewed con DOI/PMID verificables. Sin pseudociencia,
                  sin opiniones de redes.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Stethoscope
                    className="text-somno-accent"
                    size={18}
                    aria-hidden="true"
                  />
                  Práctica clínica real
                </CardTitle>
                <CardDescription className="text-xs">
                  El flow refleja el workflow que Pablo usa en consulta:
                  6 cuestionarios validados (ISI, ESS, STOP-BANG, PHQ-9,
                  GAD-7, DASS-21) + datos de sueño + lab/genéticos opcionales.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen
                    className="text-somno-accent"
                    size={18}
                    aria-hidden="true"
                  />
                  Validación abierta
                </CardTitle>
                <CardDescription className="text-xs">
                  Los algoritmos serán validados públicamente con sleep
                  specialists colegas antes de cualquier launch masivo.
                  Transparencia total.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        <section className="mb-10 rounded-lg border border-border/60 bg-card/40 p-6">
          <h2 className="mb-3 text-xl font-semibold">
            Compliance regulatorio
          </h2>
          <p className="mb-3 text-sm text-foreground/90">
            SomnoSalud opera en Argentina bajo el siguiente marco
            regulatorio:
          </p>
          <ul className="ml-5 list-disc space-y-1.5 text-sm text-foreground/85">
            <li>
              <strong>Ley 25.326</strong> — Protección de Datos Personales.
            </li>
            <li>
              <strong>Ley 26.529</strong> — Derechos del Paciente.
            </li>
            <li>
              <strong>Disposición ANMAT 18/2017</strong> — Software médico
              (clasificación Clase I orientativo, pendiente registro formal
              pre-launch público).
            </li>
            <li>
              <strong>Decreto 1089/2012</strong> — Datos genéticos (consent
              granular cuando aplique).
            </li>
          </ul>
          <p className="mt-3 text-sm text-foreground/80">
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

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <Button size="lg" asChild>
            <Link href="/disclaimer">
              Empezar evaluación
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
