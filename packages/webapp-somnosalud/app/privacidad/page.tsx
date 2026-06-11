import Link from 'next/link';
import { Lock, Stethoscope } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { FadeIn } from '@/components/motion/FadeIn';

/**
 * Pantalla /privacidad — politica de privacidad publica.
 *
 * Texto canonico de docs/vault/clinical/COMPLIANCE-ARGENTINA.md
 * "Politica de privacidad (puntos canonicos)". NO modificar sin
 * signoff Pablo Ferrero (regla compliance-anmat).
 *
 * Compliance Ley 25.326 art. 6: politica de privacidad publica
 * accesible antes del consent.
 *
 * Server Component puro.
 */
export const metadata = {
  title: 'Política de privacidad — SomnoSalud',
  description:
    'Política de privacidad y protección de datos de SomnoSalud (Ley 25.326 + Ley 26.529 + Decreto 1089/2012).',
};

export default function PrivacidadPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="container max-w-3xl flex-1 py-12 md:py-20">
        <FadeIn>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-somno-accent/20 bg-somno-tint-info px-3.5 py-1.5 text-xs font-medium text-somno-accent-soft">
            <Lock size={14} aria-hidden="true" />
            Política de privacidad · vigente desde 2026-05
          </div>

          <h1 className="mb-4 font-display text-5xl font-normal leading-[1.05] tracking-tight md:text-6xl">
            Política de privacidad
          </h1>
          <p className="mb-8 text-base leading-relaxed text-muted-foreground">
            Versión 1 · Marco legal: Ley 25.326 (Protección de Datos
            Personales) + Ley 26.529 (Derechos del Paciente) + Decreto
            1089/2012 (datos genéticos).
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Alert
            variant="info"
            className="mb-10 rounded-2xl border-somno-accent/25 bg-somno-tint-info"
          >
            <Stethoscope className="h-5 w-5 text-somno-accent" aria-hidden="true" />
            <AlertTitle className="font-semibold text-somno-accent-soft">
              Resumen en 30 segundos
            </AlertTitle>
            <AlertDescription className="text-foreground/85">
              <ul className="mt-2 space-y-1.5 text-sm">
                <li className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-somno-accent" aria-hidden="true" /><span>Tus respuestas se guardan localmente en tu navegador (sessionStorage). Si cerrás la pestaña, se pierden.</span></li>
                <li className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-somno-accent" aria-hidden="true" /><span>NO enviamos datos clínicos a servidores externos en esta etapa pre-launch.</span></li>
                <li className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-somno-accent" aria-hidden="true" /><span>Cuando habilitemos cuentas (próximas semanas), vas a poder optar por guardar tu evaluación en nuestra base de datos encriptada con acceso exclusivo tuyo.</span></li>
                <li className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-somno-warm" aria-hidden="true" /><span>NUNCA vendemos data ni mostramos publicidad.</span></li>
                <li className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-somno-accent" aria-hidden="true" /><span>Responsable de Tratamiento: <strong className="text-foreground">Dr. Pablo Ferrero / IFN</strong>.</span></li>
              </ul>
            </AlertDescription>
          </Alert>
        </FadeIn>

        <FadeIn delay={0.15}>
          <section className="glass-card space-y-7 p-8 text-sm leading-relaxed text-foreground/85">
          <div>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              1. ¿Quién recolecta los datos?
            </h2>
            <p>
              SomnoSalud, operado por el{' '}
              <strong>Instituto Ferrero de Neurología y Sueño (IFN)</strong>
              {' '}— Director: Dr. Pablo Ferrero (M.N. 119.783), Buenos Aires,
              Argentina. Pampa Labs actúa como partner técnico (desarrollo
              y mantenimiento).
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              2. ¿Qué datos recolectamos?
            </h2>
            <p className="mb-2">
              En esta etapa pre-launch (sin cuentas todavía), solo recolectamos
              localmente:
            </p>
            <ul className="ml-5 list-disc space-y-1">
              <li>
                <strong>Datos clínicos:</strong> respuestas a cuestionarios
                estandarizados (ISI, ESS, STOP-BANG, PHQ-9, GAD-7, DASS-21),
                datos de sueño, lab opcional, genética opcional.
              </li>
              <li>
                <strong>Datos demográficos:</strong> fecha de nacimiento,
                sexo biológico, peso, altura.
              </li>
              <li>
                <strong>Datos técnicos:</strong> nada que se guarde
                server-side. Solo los logs estándar de tu navegador (sin que
                lleguen a nosotros).
              </li>
            </ul>
            <p className="mt-3">
              Cuando habilitemos cuentas de usuario (Sprint 10+), agregaremos:
              email + nombre + timestamp de consentimiento. Recibirás un
              consentimiento separado en ese momento.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              3. ¿Para qué usamos los datos?
            </h2>
            <ul className="ml-5 list-disc space-y-1">
              <li>Generar tu evaluación clínica orientativa.</li>
              <li>Permitirte acceder a tu historial (cuando habilitemos cuentas).</li>
              <li>
                Mejorar nuestros algoritmos clínicos —{' '}
                <strong>anonimizado y agregado, nunca individual</strong>.
              </li>
            </ul>
            <p className="mt-3">
              <strong className="text-yellow-300">NUNCA:</strong> vendemos data
              a terceros, mostramos publicidad, ni usamos tus datos para fines
              no médicos.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              4. ¿Quién accede a los datos?
            </h2>
            <ul className="ml-5 list-disc space-y-1">
              <li>Vos como titular.</li>
              <li>
                Profesionales del IFN si vos autorizás explícitamente
                (compartir resultados pre-consulta).
              </li>
              <li>
                Equipo técnico de Pampa Labs <strong>solo accede a logs
                anonimizados de operación</strong>, nunca a datos
                identificatorios.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              5. ¿Cuánto tiempo guardamos los datos?
            </h2>
            <p>
              Mínimo 10 años (requisito Ley 26.529 — historia clínica).
              Podés solicitar la supresión de datos identificatorios en
              cualquier momento (Ley 25.326 art. 16).
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              6. ¿Cómo ejercés tus derechos?
            </h2>
            <p>
              Tenés derecho a <strong>acceder</strong>, <strong>rectificar</strong>{' '}
              y <strong>suprimir</strong> tus datos. Cuando tengas cuenta de
              usuario, lo podés hacer desde los settings. Mientras tanto, los
              datos viven solo en tu navegador y se borran cerrando la pestaña
              o usando el botón &ldquo;Empezar de nuevo&rdquo;.
            </p>
            <p className="mt-2 text-muted-foreground">
              Contacto para consultas de privacidad:{' '}
              <span className="font-mono">privacidad@somnosalud.com.ar</span>
              {' '}(activo cuando se complete Sprint 14 Resend).
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              7. Encriptación
            </h2>
            <p>
              Sitio sirve sobre HTTPS (TLS 1.2+). Cuando habilitemos
              persistencia server-side (Supabase), los datos quedan
              encriptados <em>at rest</em> con AES-256 + backups encriptados.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              8. Datos sensibles especiales
            </h2>
            <ul className="ml-5 list-disc space-y-1">
              <li>
                <strong>Datos genéticos</strong> (Decreto 1089/2012):
                consentimiento separado granular cuando los uses. No se
                comparten con terceros sin tu autorización explícita por uso.
              </li>
              <li>
                <strong>Datos de salud mental</strong> (PHQ-9, GAD-7,
                DASS-21): misma protección + detección automática de ideación
                suicida → recurso de emergencia 24/7 visible (línea
                0800-999-0091 Argentina).
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              9. Plan de respuesta a brechas
            </h2>
            <p>
              Tenemos monitoreo automático de seguridad. En caso de brecha:
              notificación a Pablo Ferrero (RT) en menos de 4 horas, y a
              usuarios afectados dentro de 72 horas siguiendo buena práctica
              GDPR-aligned.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              10. Responsable de Tratamiento
            </h2>
            <p>
              <strong>Dr. Pablo Ferrero / Instituto Ferrero de Neurología y
              Sueño (IFN)</strong>. M.N. 119.783. Buenos Aires, Argentina.
            </p>
            <p className="mt-2 text-muted-foreground">
              Versión vigente: v1. Si actualizamos esta política, vamos a
              pedirte re-aceptar antes de continuar usando la herramienta.
            </p>
          </div>
          </section>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Button
              asChild
              className="h-12 rounded-full px-6 text-base shadow-glow-accent transition-all hover:shadow-[0_0_44px_rgba(129,140,248,0.45)]"
            >
              <Link href="/">Volver al inicio</Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="h-12 rounded-full border-white/[0.10] bg-white/[0.02] px-6 text-base hover:bg-white/[0.06]"
            >
              <Link href="/terms">Ver términos y condiciones</Link>
            </Button>
          </div>
        </FadeIn>
      </main>

      <PublicFooter />
    </div>
  );
}
