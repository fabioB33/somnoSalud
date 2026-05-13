'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, SkipForward } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FormSkeleton } from '@/components/eval/FormSkeleton';
import { usePersistEval } from '@/hooks/usePersistEval';

/**
 * 5 variantes geneticas con genotypes validos del clinical-engine.
 * Hardcoded aqui en lugar de importar VARIANT_DEFS porque las
 * estructuras del engine son nested y no exportan una shape directa
 * para UI dropdowns. Mantener sincronizado con genetics.ts.
 */
const GENE_OPTIONS = [
  {
    code: 'CLOCK',
    name: 'CLOCK (rs1801260)',
    description: 'Cronotipo (matutino/vespertino)',
    genotypes: ['T/T', 'T/C', 'C/C'],
  },
  {
    code: 'PER2',
    name: 'PER2 (rs2304672)',
    description: 'Síndrome de fase avanzada del sueño',
    genotypes: ['C/C', 'C/G', 'G/G'],
  },
  {
    code: 'ADORA2A',
    name: 'ADORA2A (rs5751876)',
    description: 'Sensibilidad a cafeína',
    genotypes: ['C/C', 'C/T', 'T/T'],
  },
  {
    code: 'COMT',
    name: 'COMT (Val158Met)',
    description: 'Metabolismo dopaminérgico',
    genotypes: ['Val/Val', 'Val/Met', 'Met/Met'],
  },
  {
    code: 'MTHFR',
    name: 'MTHFR (C677T)',
    description: 'Metilación + B12',
    genotypes: ['C/C', 'C/T', 'T/T'],
  },
] as const;

const NO_LO_SE = '__no_lo_se__';

/**
 * GeneticsForm — 5 selects opcionales con valor "No lo sé".
 *
 * Comportamiento:
 * - Cada select tiene "No lo sé" + opciones de genotype.
 * - Si paciente selecciona genotype para al menos 1: persiste objeto
 *   Record<gene, genotype> con SOLO los genes con valor.
 * - Si todos "No lo sé" + Continuar: persiste genetics=undefined.
 * - Boton "Saltar este paso" prominente: explicit skip.
 */
export function GeneticsForm() {
  const router = useRouter();
  const { state, hydrated, update } = usePersistEval();

  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    GENE_OPTIONS.forEach((g) => {
      initial[g.code] = NO_LO_SE;
    });
    return initial;
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (state.genetics) {
      setValues((prev) => {
        const next = { ...prev };
        Object.entries(state.genetics!).forEach(([gene, genotype]) => {
          next[gene] = genotype;
        });
        return next;
      });
    }
  }, [hydrated, state.genetics]);

  if (!hydrated) {
    return (
      <FormSkeleton />
    );
  }

  const buildPayload = (): Record<string, string> | undefined => {
    const payload: Record<string, string> = {};
    let any = false;
    Object.entries(values).forEach(([gene, genotype]) => {
      if (genotype !== NO_LO_SE) {
        payload[gene] = genotype;
        any = true;
      }
    });
    return any ? payload : undefined;
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    update({ genetics: buildPayload() });
    router.push('/eval/results');
  };

  const handleSkip = () => {
    update({ genetics: undefined });
    router.push('/eval/results');
  };

  return (
    <form
      onSubmit={handleContinue}
      noValidate
      className="space-y-6 rounded-lg border border-border/60 bg-card/40 p-6"
    >
      <div className="space-y-5">
        {GENE_OPTIONS.map((gene) => {
          const id = `gene-${gene.code}`;
          return (
            <div key={gene.code} className="space-y-1.5">
              <Label htmlFor={id}>
                {gene.name}{' '}
                <span className="text-xs font-normal text-muted-foreground">
                  · {gene.description}
                </span>
              </Label>
              <select
                id={id}
                value={values[gene.code]}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    [gene.code]: e.target.value,
                  }))
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
              >
                <option value={NO_LO_SE}>No lo sé / no lo tengo</option>
                {gene.genotypes.map((gt) => (
                  <option key={gt} value={gt}>
                    {gt}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Button type="button" variant="outline" size="lg" asChild>
          <a href="/eval/lab">
            <ArrowLeft aria-hidden="true" />
            Volver
          </a>
        </Button>
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? 'Procesando...' : 'Ver resultados'}
          <ArrowRight aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={handleSkip}
          className="sm:ml-auto"
        >
          <SkipForward aria-hidden="true" />
          Saltar y ver resultados
        </Button>
      </div>
    </form>
  );
}
