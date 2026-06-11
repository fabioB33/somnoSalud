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
  Sparkles,
  Stethoscope,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { FadeIn } from '@/components/motion/FadeIn';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { createClient } from '@/lib/supabase/server';

/**
 * HomePage — pantalla de bienvenida de SomnoSalud.
 *
 * Sprint UX polish 2026-06-11: reescrita visualmente sobre tokens v2.0.
 *  - Hero asymmetric con BrandLogo grande + Fraunces display + spotlight.
 *  - Glass cards con backdrop-blur sutil (perf-friendly).
 *  - Dual accent (cool purpura para info clínica + warm gold para insights).
 *  - Stagger animation en cards.
 *  - Iconography rica: bg tint + size mayor + drop-shadow.
 *
 * Compliance: el login obligatorio garantiza que el consent informado
 * (Ley 26.529) tenga un sujeto identificable, y que cualquier dato
 * clinico procesado (Ley 25.326) sea atribuible a un user con derecho
 * de acceso/rectificacion/supresion.
 *
 * Server Component async — preserva detección de session para CTA routing.
 */
export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const evalCtaHref = user ? '/disclaimer' : '/login?next=/disclaimer';

  const STEPS = [
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
  ] as const;

  return (
    <div className="flex min-h-dvh flex-col">
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-white/[0.06] backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <BrandLogo size="sm" />
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
            <span className="badge-tint-info inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider">
              <Sparkles size={10} aria-hidden="true" />
              Pre-launch
            </span>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* ─── HERO ──────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          {/* Spotlight detrás del hero */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px]"
            style={{
              background:
                'radial-gradient(ellipse 80% 65% at 50% 0%, rgba(129, 140, 248, 0.22) 0%, transparent 70%)',
            }}
          />

          <div className="container section-y">
            <div className="mx-auto max-w-3xl text-center">
              <FadeIn>
                <div className="mb-8 flex justify-center">
                  <BrandLogo size="xl" withWordmark={false} glow />
                </div>
              </FadeIn>

              <FadeIn delay={0.08}>
                <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-somno-accent/20 bg-somno-tint-info px-3.5 py-1.5 text-xs font-medium text-somno-accent-soft">
                  <Stethoscope size={14} aria-hidden="true" />
                  Director médico: Dr. Pablo Ferrero · M.N. 119.783
                </p>
              </FadeIn>

              <FadeIn delay={0.15}>
                <h1 className="text-balance font-display text-5xl font-normal leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
                  Evaluación integral de tu{' '}
                  <span className="relative inline-block text-somno-accent">
                    sueño
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-2 h-[3px] rounded-full bg-gradient-to-r from-transparent via-somno-accent/60 to-transparent"
                    />
                  </span>
                </h1>
              </FadeIn>

              <FadeIn delay={0.25}>
                <p className="mt-7 text-balance text-lg leading-relaxed text-muted-foreground md:text-xl">
                  Una plataforma médica digital que evalúa, orienta y educa
                  sobre trastornos del sueño con respaldo científico
                  verificable.{' '}
                  <span className="text-foreground/85">
                    No reemplaza la consulta médica — la prepara.
                  </span>
                </p>
              </FadeIn>

              <FadeIn delay={0.35}>
                <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                  <Button
                    size="lg"
                    asChild
                    className="group h-12 rounded-full px-6 text-base shadow-glow-accent transition-all hover:shadow-[0_0_44px_rgba(129,140,248,0.45)]"
                  >
                    <Link href={evalCtaHref}>
                      Empezar evaluación
                      <ArrowRight
                        aria-hidden="true"
                        className="ml-1 transition-transform group-hover:translate-x-0.5"
                      />
                    </Link>
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Tarda ~10 minutos · 100% gratis · Disclaimer obligatorio
                  </p>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ─── ¿CÓMO FUNCIONA? ──────────────────────────────────────── */}
        <section className="border-t border-white/[0.06]">
          <div className="container max-w-5xl section-y">
            <FadeIn whenInView>
              <h2 className="mb-3 text-center font-display text-4xl font-normal tracking-tight md:text-5xl">
                ¿Cómo funciona?
              </h2>
              <p className="mb-14 text-balance text-center text-base text-muted-foreground">
                4 pasos simples. Tu evaluación se guarda mientras respondés.
              </p>
            </FadeIn>

            <Stagger
              delayChildren={0.1}
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
            >
              {STEPS.map(({ num, Icon, title, description }) => (
                <StaggerItem
                  key={num}
                  className="glass-card card-hover-lift group p-6"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="badge-tint-info inline-flex size-9 items-center justify-center rounded-xl font-display text-base font-semibold">
                      {num}
                    </div>
                    <Icon
                      className="size-5 text-somno-accent-soft transition-colors group-hover:text-somno-accent"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="mb-2 text-base font-semibold tracking-tight">
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ─── ¿QUÉ VAS A RECIBIR? ──────────────────────────────────── */}
        <section className="border-t border-white/[0.06]">
          <div className="container max-w-5xl section-y">
            <div className="grid items-start gap-12 md:grid-cols-[1.1fr_1fr]">
              <FadeIn whenInView direction="left">
                <h2 className="mb-3 font-display text-4xl font-normal tracking-tight md:text-5xl">
                  ¿Qué vas a recibir?
                </h2>
                <p className="mb-7 text-muted-foreground">
                  Al final de los 12 pasos vas a tener un perfil clínico
                  orientativo con:
                </p>
                <ul className="space-y-4 text-sm">
                  {[
                    {
                      strong: 'Score de cada instrumento',
                      rest: ' con severidad clínica y referencia científica.',
                    },
                    {
                      strong: 'Perfil de insomnio',
                      rest: ' (onset / maintenance / mixto) y nivel de riesgo integrado.',
                    },
                    {
                      strong: 'Recomendaciones personalizadas',
                      rest: ' respetando reglas de seguridad clínica.',
                    },
                    {
                      strong: 'Derivación a especialista',
                      rest: ' si tu caso lo requiere (banderas de riesgo automáticas).',
                    },
                    {
                      strong: 'PDF exportable',
                      rest: ' para llevar a la consulta médica.',
                    },
                  ].map(({ strong, rest }) => (
                    <li key={strong} className="flex gap-3">
                      <div className="badge-tint-info mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-md">
                        <ListChecks
                          size={14}
                          aria-hidden="true"
                          className="text-somno-accent"
                        />
                      </div>
                      <span className="text-foreground/85">
                        <strong className="text-foreground">{strong}</strong>
                        {rest}
                      </span>
                    </li>
                  ))}
                </ul>
              </FadeIn>

              {/* Mock preview card de resultados con storytelling visual. */}
              <FadeIn whenInView direction="right" delay={0.1}>
                <div
                  aria-hidden="true"
                  className="glass-card-elevated p-6"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <p className="badge-tint-info inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider">
                      Vista previa
                    </p>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      DEMO
                    </span>
                  </div>

                  {/* Score card ISI con jerarquía display. */}
                  <div className="mb-4 rounded-xl border border-white/[0.06] bg-black/20 p-5">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      ISI · Insomnio
                    </p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="font-display text-5xl font-normal leading-none text-somno-accent drop-shadow-[0_0_18px_rgba(129,140,248,0.35)]">
                        14
                      </span>
                      <span className="font-display text-xl text-muted-foreground/70">
                        / 28
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-foreground/85">
                      Insomnio clínico moderado
                    </p>
                  </div>

                  {/* Recomendación primaria con warm tint */}
                  <div className="mb-4 rounded-xl border border-somno-warm/20 bg-somno-tint-warn p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Sparkles
                        className="size-4 text-somno-warm"
                        aria-hidden="true"
                      />
                      <p className="text-[10px] font-medium uppercase tracking-wider text-somno-warm-soft">
                        Recomendación primaria
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">
                        Higiene del sueño
                      </span>
                      <span className="rounded-full border border-somno-warm/30 bg-somno-warm/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-somno-warm-soft">
                        Evidencia A
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Confianza del análisis:{' '}
                    <strong className="text-somno-accent">87%</strong>
                  </p>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ─── ORIENTATIVO + RESPALDO ───────────────────────────────── */}
        <section className="border-t border-white/[0.06]">
          <div className="container max-w-4xl section-y-sm">
            <Stagger
              delayChildren={0.1}
              className="grid gap-5 sm:grid-cols-2"
            >
              <StaggerItem className="glass-card p-6">
                <div className="mb-3 flex items-center gap-3">
                  <div className="badge-tint-info inline-flex size-10 items-center justify-center rounded-xl">
                    <ShieldCheck
                      className="size-5 text-somno-accent"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-base font-semibold tracking-tight">
                    Orientativo, no diagnóstico
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Esta herramienta es <strong className="text-foreground/85">orientativa</strong>{' '}
                  y NO reemplaza la consulta médica. Las recomendaciones
                  deben ser validadas por un profesional antes de
                  implementarlas.
                </p>
              </StaggerItem>

              <StaggerItem className="glass-card p-6">
                <div className="mb-3 flex items-center gap-3">
                  <div className="badge-tint-warm inline-flex size-10 items-center justify-center rounded-xl">
                    <Moon
                      className="size-5 text-somno-warm"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-base font-semibold tracking-tight">
                    Respaldo científico
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Cada algoritmo de scoring (ISI, ESS, STOP-BANG, PHQ-9,
                  GAD-7, DASS-21) está respaldado por publicaciones
                  peer-reviewed con DOI/PMID verificables.
                </p>
              </StaggerItem>
            </Stagger>
          </div>
        </section>

        {/* ─── FAQ ─────────────────────────────────────────────────── */}
        <section className="border-t border-white/[0.06]">
          <div className="container max-w-3xl section-y">
            <FadeIn whenInView>
              <h2 className="mb-3 text-center font-display text-4xl font-normal tracking-tight md:text-5xl">
                Preguntas frecuentes
              </h2>
              <p className="mb-10 text-balance text-center text-muted-foreground">
                Si tu pregunta no está acá,{' '}
                <Link
                  href="/about"
                  className="text-somno-accent underline-offset-4 hover:underline"
                >
                  conocé más sobre SomnoSalud
                </Link>
                .
              </p>
            </FadeIn>

            <FadeIn whenInView delay={0.05}>
              <Accordion
                type="single"
                collapsible
                className="glass-card divide-y divide-white/[0.06] px-6"
              >
                <AccordionItem value="es-gratis" className="border-b-0">
                  <AccordionTrigger>¿Es gratis usar SomnoSalud?</AccordionTrigger>
                  <AccordionContent>
                    Sí, la evaluación es 100% gratuita en Argentina.
                    SomnoSalud forma parte del trabajo clínico del Dr. Pablo
                    Ferrero (IFN) — el objetivo es facilitar el acceso a una
                    primera orientación clínica de calidad sin barreras
                    económicas.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="datos-privados" className="border-b-0">
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

                <AccordionItem value="reemplaza-medico" className="border-b-0">
                  <AccordionTrigger>
                    ¿Reemplaza la consulta con un médico?
                  </AccordionTrigger>
                  <AccordionContent>
                    <strong className="text-somno-warm">No.</strong>{' '}
                    SomnoSalud es <strong>orientativo</strong>. Te da un
                    perfil clínico estructurado para que vos y tu profesional
                    tomen decisiones informadas. Toda recomendación debe ser
                    validada por un médico antes de implementarse. Si tu
                    caso lo requiere, te derivamos automáticamente a un
                    especialista.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="cuanto-tarda" className="border-b-0">
                  <AccordionTrigger>
                    ¿Cuánto tarda completar la evaluación?
                  </AccordionTrigger>
                  <AccordionContent>
                    Aproximadamente <strong>10-15 minutos</strong> si vas
                    fluido. Los pasos de lab y genéticos son opcionales y
                    podés saltarlos. Si te interrumpen, tus respuestas
                    persisten mientras la pestaña esté abierta.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="que-hago-resultados" className="border-b-0">
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
            </FadeIn>

            <FadeIn whenInView delay={0.1}>
              <div className="mt-8 rounded-2xl border border-somno-warm/30 bg-somno-tint-warn p-5">
                <div className="flex items-start gap-3">
                  <div className="badge-tint-warm inline-flex size-10 shrink-0 items-center justify-center rounded-xl">
                    <Phone
                      className="size-5 text-somno-warm"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="text-sm leading-relaxed">
                    <strong className="text-somno-warm-soft">
                      Si necesitás ayuda urgente:
                    </strong>{' '}
                    línea de Salud Mental gratuita 24/7 en Argentina{' '}
                    <strong className="font-mono text-foreground">
                      0800-999-0091
                    </strong>
                    .
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ─── CTA final ──────────────────────────────────────────── */}
        <section className="border-t border-white/[0.06]">
          <div className="container max-w-2xl section-y-sm text-center">
            <FadeIn whenInView>
              <h2 className="text-balance font-display text-3xl font-normal tracking-tight md:text-4xl">
                ¿Listo para entender mejor cómo dormís?
              </h2>
              <p className="mt-3 text-muted-foreground">
                10 minutos. Sin obligaciones. Resultados al final.
              </p>
              <Button
                size="lg"
                asChild
                className="group mt-7 h-12 rounded-full px-7 text-base shadow-glow-accent transition-all hover:shadow-[0_0_44px_rgba(129,140,248,0.45)]"
              >
                <Link href={evalCtaHref}>
                  Empezar evaluación
                  <ArrowRight
                    aria-hidden="true"
                    className="ml-1 transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </Button>
            </FadeIn>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
