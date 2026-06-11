import { Moon } from 'lucide-react';

import { cn } from '@/lib/utils';

interface BrandLogoProps {
  /** sm = 24px icon · md = 32px · lg = 48px (default) · xl = 64px (hero) */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Si false, solo renderiza el icon (sin wordmark). Default true. */
  withWordmark?: boolean;
  /** Si true, aplica glow accent al icon (para hero / login). Default false. */
  glow?: boolean;
  className?: string;
}

const SIZE_CLASSES = {
  sm: {
    icon: 'size-5',
    wrapper: 'size-9 rounded-xl',
    wordmark: 'text-base tracking-tight',
  },
  md: {
    icon: 'size-6',
    wrapper: 'size-11 rounded-xl',
    wordmark: 'text-lg tracking-tight',
  },
  lg: {
    icon: 'size-8',
    wrapper: 'size-14 rounded-2xl',
    wordmark: 'text-2xl tracking-tight',
  },
  xl: {
    icon: 'size-10',
    wrapper: 'size-20 rounded-3xl',
    wordmark: 'text-3xl tracking-tight font-display font-normal',
  },
} as const;

/**
 * Logo de SomnoSalud — Moon icon + wordmark.
 *
 * v2.0 UX polish (2026-06-11):
 *  - Wrapper rounded-2xl con glass effect (fondo tint accent + border accent
 *    soft + glow opcional).
 *  - Tamaño `xl` nuevo para hero con wordmark en Fraunces display.
 *  - Prop `glow` para login + welcome (ambient glow purple).
 *
 * Reusable en login, welcome, 404 y futuras pantallas que requieran
 * reforzar la marca.
 */
export function BrandLogo({
  size = 'lg',
  withWordmark = true,
  glow = false,
  className,
}: BrandLogoProps) {
  const sizes = SIZE_CLASSES[size];

  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      <div
        className={cn(
          'inline-flex items-center justify-center border border-somno-accent/25',
          'bg-gradient-to-br from-somno-accent/15 to-somno-accent/5',
          'shadow-inset-top',
          glow && 'shadow-glow-accent',
          sizes.wrapper,
        )}
        aria-hidden="true"
      >
        <Moon
          className={cn(
            'text-somno-accent-soft drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]',
            sizes.icon,
          )}
        />
      </div>
      {withWordmark && (
        <span
          className={cn(
            'font-semibold text-foreground',
            sizes.wordmark,
          )}
        >
          SomnoSalud
        </span>
      )}
    </div>
  );
}
