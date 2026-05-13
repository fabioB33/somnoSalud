import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Brain,
  ClipboardList,
  ListChecks,
  Moon,
  Phone,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { PublicFooter } from '@/components/layout/PublicFooter';

/**
 * HomePage — pantalla de bienvenida de SomnoSalud (Sprint 8.6 expandida).
 *
 * Server Component (default). Renderiza:
 * - Header: logo + status pill.
 * - Hero: titulo + descripcion + CTA + tagline tiempos.
 * - Seccion "Como funciona": 4 steps numerados.
 * - Seccion "Que vas a recibir": preview card de resultados.
 * - 2 cards: orientativo + respaldo cientifico.
 * - FAQ Accordion: 5 preguntas frecuentes.
 * - PublicFooter compartido.
 *
 * El CTA "Empezar evaluacion" lleva a /disclaimer (primer paso del
 * flow compliance gates ADR-003).
 */
export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon
              className="text-somno-accent"
              aria-hidden="true"
              size={22}
            />
            <span className="font-semibold tracking-tight">SomnoSalud</span>
          </div>
          <nav className="hidden items-center gap-5 text-xs text-muted-foreground sm:flex">
            <Link
              href="/about"
              className="transition-colors hover:text-foreground"
            >
              Sobre
            </Link>
            <Link
              href="/privacidad"
              className="transition-colors hover:text-foreground"
            >
              Privacidad
            </Link>
            <span className="rounded-full border border-border/60 bg-card/60 px-2 py-0.5">
              Pre-launch · Fase 0
            </span>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO */}
        <section className="container py-16 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Stethoscope size={14} aria-hidden="true" />
              Director médico: Dr. Pablo Ferrero · M.N. 119.783
            </p>
            <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
              Evaluación integral de tu{' '}
              <span className="text-somno-accent">sueño</span>
            </h1>
            <p className="mt-6 text-balance text-lg text-muted-foreground">
              Una plataforma médica digital que evalúa, orienta y educa
              sobre trastornos del sueño con respaldo científico
              verificable. No reemplaza la consulta médica — la prepara.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/disclaimer">
                  Empezar evaluación
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                Tarda ~10 minutos · 100% gratis · Disclaimer obligatorio
              </p>
            </div>
          </div>
        </section>

        {/* ¿CÓMO FUNCIONA? */}
        <section className="border-t border-border/40 bg-card/20 py-16 md:py-20">
          <div className="container max-w-4xl">
            <h2 className="mb-3 text-center text-3xl font-bold tracking-tight">
              ¿Cómo funciona?
            </h2>
            <p className="mb-12 text-center text-base text-muted-foreground">
              4 pasos simples. Tu evaluación se guarda localmente mientras
              respondés.
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  num: 1,
                  Icon: ClipboardList,
                  title: 'Datos básicos',
                  description:
                    'Edad, sexo, peso, altura. Y verificamos algunas condiciones especiales (embarazo, medicación).',
                },
                {
                  num: 2,
                  Icon: Brain,
                  title: 'Cuestionarios validados',
                  description:
                    '6 instrumentos clínicos (ISI, ESS, STOP-BANG, PHQ-9, GAD-7, DASS-21) con respaldo DOI/PMID.',
                },
                {
                  num: 3,
                  Icon: Moon,
                  title: 'Diario de sueño',
                  description:
                    'Cómo dormís típicamente. Lab y genéticos son opcionales.',
                },
                {
                  num: 4,
                  Icon: BarChart3,
                  title: 'Resultados',
                  description:
                    'Score por instrumento + perfil clínico + recomendaciones por nivel de evidencia A/B/C.',
                },
              ].map(({ num, Icon, title, description }) => (
                <div key={num} className="relative">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary bg-primary/10 font-mono text-sm font-bold text-primary">
                    {num}
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <Icon
                      className="text-somno-accent"
                      size={18}
                      aria-hidden="true"
                    />
                    <h3 className="font-semibold">{title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ¿QUÉ VAS A RECIBIR? */}
        <section className="container py-16 md:py-20">
          <div className="mx-auto max-w-4xl">
            <div className="grid items-start gap-10 md:grid-cols-2">
              <div>
                <h2 className="mb-3 text-3xl font-bold tracking-tight">
                  ¿Qué vas a recibir?
                </h2>
                <p className="mb-5 text-muted-foreground">
                  Al final de los 12 pasos vas a tener un perfil clínico
                  orientativo con:
                </p>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <ListChecks
                      className="mt-0.5 shrink-0 text-somno-accent"
                      size={18}
                      aria-hidden="true"
                    />
                    <span>
                      <strong>Score de cada instrumento</strong> con
                      severidad clínica y referencia científica.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <ListChecks
                      className="mt-0.5 shrink-0 text-somno-accent"
                      size={18}
                      aria-hidden="true"
                    />
                    <span>
                      <strong>Perfil de insomnio</strong> (onset / maintenance
                      / mixto) y nivel de riesgo integrado.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <ListChecks
                      className="mt-0.5 shrink-0 text-somno-accent"
                      size={18}
                      aria-hidden="true"
                    />
                    <span>
                      <strong>Recomendaciones personalizadas</strong>{' '}
                      respetando reglas de seguridad clínica.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <ListChecks
                      className="mt-0.5 shrink-0 text-somno-accent"
                      size={18}
                      aria-hidden="true"
                    />
                    <span>
                      <strong>Derivación a especialista</strong> si tu
                      caso lo requiere (banderas de riesgo automáticas).
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <ListChecks
                      className="mt-0.5 shrink-0 text-somno-accent"
                      size={18}
                      aria-hidden="true"
                    />
                    <span>
                      <strong>PDF exportable</strong> para llevar a la
                      consulta médica.
                    </span>
                  </li>
                </ul>
              </div>
              {/* Mock preview card de resultados */}
              <div
                aria-hidden="true"
                className="rounded-xl border border-border/60 bg-card/60 p-5 shadow-xl"
              >
                <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Vista previa
                </p>
                <div className="mb-4 rounded-md border border-border/40 bg-card/40 p-3">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    ISI (Insomnio)
                  </p>
                  <p className="mt-1 font-mono text-2xl font-bold text-somno-accent">
                    14<span className="text-base text-muted-foreground">/28</span>
                  </p>
                  <p className="text-sm">Insomnio clínico moderado</p>
                </div>
                <div className="mb-4 rounded-md border border-border/40 bg-card/40 p-3">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Recomendación primaria
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">Higiene del sueño</span>
                    <span className="rounded-full bg-primary/20 px-2 py-0.5 font-mono text-xs text-primary">
                      Evidencia A
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Confianza del análisis:{' '}
                  <strong className="text-somno-accent">87%</strong>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CARDS ORIENTATIVO + RESPALDO */}
        <section className="container pb-16">
          <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck
                    className="text-somno-accent"
                    size={20}
                    aria-hidden="true"
                  />
                  Orientativo, no diagnóstico
                </CardTitle>
                <CardDescription>
                  Esta herramienta es <strong>orientativa</strong> y NO
                  reemplaza la consulta médica. Las recomendaciones deben
                  ser validadas por un profesional antes de implementarlas.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Moon
                    className="text-somno-accent"
                    size={20}
                    aria-hidden="true"
                  />
                  Respaldo científico
                </CardTitle>
                <CardDescription>
                  Cada algoritmo de scoring (ISI, ESS, STOP-BANG, PHQ-9,
                  GAD-7, DASS-21) está respaldado por publicaciones
                  peer-reviewed con DOI/PMID verificables.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-border/40 bg-card/20 py-16 md:py-20">
          <div className="container max-w-3xl">
            <h2 className="mb-3 text-center text-3xl font-bold tracking-tight">
              Preguntas frecuentes
            </h2>
            <p className="mb-10 text-center text-muted-foreground">
              Si tu pregunta no está acá,{' '}
              <Link
                href="/about"
                className="text-somno-accent underline-offset-4 hover:underline"
              >
                conocé más sobre SomnoSalud
              </Link>
              .
            </p>
            <Accordion
              type="single"
              collapsible
              className="rounded-lg border border-border/60 bg-card/40 px-5"
            >
              <AccordionItem value="es-gratis">
                <AccordionTrigger>¿Es gratis usar SomnoSalud?</AccordionTrigger>
                <AccordionContent>
                  Sí, la evaluación es 100% gratuita en Argentina.
                  SomnoSalud forma parte del trabajo clínico del Dr. Pablo
                  Ferrero (IFN) — el objetivo es facilitar el acceso a una
                  primera orientación clínica de calidad sin barreras
                  económicas.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="datos-privados">
                <AccordionTrigger>
                  ¿Mis datos son privados? ¿Quién los ve?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">
                    Sí. En esta etapa, tus respuestas se guardan{' '}
                    <strong>solo en tu navegador</strong> (sessionStorage)
                    y se pierden si cerrás la pestaña. No enviamos tus
                    datos clínicos a servidores externos.
                  </p>
                  <p>
                    Cuando habilitemos cuentas de usuario, vas a poder
                    optar por guardar tu evaluación en nuestra base de
                    datos encriptada con acceso exclusivo tuyo. Ver{' '}
                    <Link
                      href="/privacidad"
                      className="text-somno-accent underline-offset-4 hover:underline"
                    >
                      política de privacidad
                    </Link>
                    .
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="reemplaza-medico">
                <AccordionTrigger>
                  ¿Reemplaza la consulta con un médico?
                </AccordionTrigger>
                <AccordionContent>
                  <strong className="text-yellow-300">No.</strong>{' '}
                  SomnoSalud es <strong>orientativo</strong>. Te da un
                  perfil clínico estructurado para que vos y tu profesional
                  tomen decisiones informadas. Toda recomendación debe ser
                  validada por un médico antes de implementarse. Si tu
                  caso lo requiere, te derivamos automáticamente a un
                  especialista.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="cuanto-tarda">
                <AccordionTrigger>¿Cuánto tarda completar la evaluación?</AccordionTrigger>
                <AccordionContent>
                  Aproximadamente <strong>10-15 minutos</strong> si vas
                  fluido. Los pasos de lab y genéticos son opcionales y
                  podés saltarlos. Si te interrumpen, tus respuestas
                  persisten mientras la pestaña esté abierta.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="que-hago-resultados">
                <AccordionTrigger>
                  ¿Qué hago con los resultados?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">
                    Los podés <strong>exportar como PDF</strong> e
                    imprimirlos para llevarlos a la consulta con tu
                    médico. Si tu evaluación detecta condiciones que
                    requieren atención especializada, te orientamos al{' '}
                    <strong>
                      Instituto Ferrero de Neurología y Sueño (IFN)
                    </strong>{' '}
                    o a un especialista cercano.
                  </p>
                  <p>
                    Si en algún momento detectamos señales de crisis (por
                    ejemplo, pensamientos de hacerte daño), te mostramos{' '}
                    <strong>de inmediato</strong> el recurso de emergencia
                    24/7 — línea{' '}
                    <strong className="font-mono">0800-999-0091</strong>{' '}
                    (Argentina).
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="mt-10 rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-5">
              <div className="flex items-start gap-3">
                <Phone
                  className="mt-0.5 shrink-0 text-yellow-400"
                  size={20}
                  aria-hidden="true"
                />
                <p className="text-sm leading-relaxed">
                  <strong className="text-yellow-200">
                    Si necesitás ayuda urgente:
                  </strong>{' '}
                  línea de Salud Mental gratuita 24/7 en Argentina{' '}
                  <strong className="font-mono">0800-999-0091</strong>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="container py-16">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-balance text-2xl font-bold md:text-3xl">
              ¿Listo para entender mejor cómo dormís?
            </h2>
            <p className="mt-3 text-muted-foreground">
              10 minutos. Sin obligaciones. Resultados al final.
            </p>
            <Button size="lg" asChild className="mt-6">
              <Link href="/disclaimer">
                Empezar evaluación
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
