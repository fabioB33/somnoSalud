'use client';

import { Toaster as SonnerToaster } from 'sonner';

/**
 * Toaster — sistema de notificaciones global con sonner.
 *
 * Se monta una sola vez en app/layout.tsx. Después se usa desde
 * cualquier client component:
 * ```tsx
 * import { toast } from 'sonner';
 * toast.success('Guardado');
 * toast.error('Falló');
 * toast.info('Procesando...');
 * ```
 *
 * Sprint 8.7: sistema disponible para feedback futuro (post-Supabase
 * Sprint 9+). Hoy todavia no se invoca desde ningun lado — queda
 * listo para cuando aparezcan acciones que necesiten feedback.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      theme="dark"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            'group border border-border/60 bg-card text-card-foreground shadow-lg',
          description: 'text-muted-foreground',
        },
      }}
    />
  );
}
