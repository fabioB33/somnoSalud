import { Moon } from 'lucide-react';

import { cn } from '@/lib/utils';

interface BrandLogoProps {
  /** sm = 24px icon · md = 32px · lg = 48px (default) */
  size?: 'sm' | 'md' | 'lg';
  /** Si false, solo renderiza el icon (sin wordmark). Default true. */
  withWordmark?: boolean;
  className?: string;
}

const SIZE_CLASSES = {
  sm: {
    icon: 'size-6',
    wrapper: 'p-2',
    wordmark: 'text-base',
  },
  md: {
    icon: 'size-8',
    wrapper: 'p-3',
    wordmark: 'text-lg',
  },
  lg: {
    icon: 'size-12',
    wrapper: 'p-4',
    wordmark: 'text-2xl',
  },
} as const;

/**
 * Logo de SomnoSalud — Moon icon + wordmark. Reusable en login, welcome,
 * 404 y futuras pantallas que requieran reforzar la marca.
 *
 * Sprint 9.B: implementacion ship-today con Moon icon de lucide. Logo
 * profesional final cuando exista un designer queda como DEBT.
 */
export function BrandLogo({
  size = 'lg',
  withWordmark = true,
  className,
}: BrandLogoProps) {
  const sizes = SIZE_CLASSES[size];

  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      <div
        className={cn(
          'inline-flex items-center justify-center rounded-full border border-border/60 bg-card/40',
          sizes.wrapper,
        )}
        aria-hidden="true"
      >
        <Moon className={cn('text-somno-accent', sizes.icon)} />
      </div>
      {withWordmark && (
        <span
          className={cn(
            'font-bold tracking-tight text-foreground',
            sizes.wordmark,
          )}
        >
          SomnoSalud
        </span>
      )}
    </div>
  );
}
