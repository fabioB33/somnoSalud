import { DisclaimerBanner } from '@/components/compliance/DisclaimerBanner';

/**
 * EvalLayout — Capa 2 de compliance gates (ADR-003).
 *
 * Renderiza <DisclaimerBanner /> obligatorio en TODAS las rutas
 * /eval/*. Aprovecha layouts segmentation de Next.js App Router —
 * imposible bypassear desde una page child.
 *
 * Compliance: cumple Ley 26.529 art. 5 + Disposicion ANMAT 18/2017
 * (paciente debe tener visible en TODA pantalla que la evaluacion es
 * orientativa + identidad del director medico responsable).
 *
 * Server Component (default).
 *
 * @see docs/vault/architecture/adr/ADR-003-compliance-gates-en-codigo.md (Capa 2)
 */
export default function EvalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DisclaimerBanner />
      {children}
    </>
  );
}
