import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina clases Tailwind resolviendo conflictos.
 * Uso canonico shadcn/ui — exportado por todos los componentes ui/*.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
