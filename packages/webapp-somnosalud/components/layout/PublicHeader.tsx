import Link from 'next/link';
import { LogOut } from 'lucide-react';

import { BrandLogo } from '@/components/brand/BrandLogo';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { signOut } from '@/app/auth/actions';

/**
 * PublicHeader — Server Component que renderiza el branding + auth slot.
 *
 * Sprint UX polish 2026-06-11: bordes white/[0.06] + glass blur ambient.
 *
 * Sprint 9.C: si hay sesion, muestra email + link "Mis resultados" + boton
 * "Cerrar sesion" (Server Action). Si anonimo, link "Iniciá sesión".
 */
export async function PublicHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-background/60 backdrop-blur-md print:hidden">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center transition-opacity hover:opacity-80"
          aria-label="SomnoSalud — Inicio"
        >
          <BrandLogo size="sm" />
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          {user ? (
            <>
              <span
                className="hidden text-xs text-muted-foreground sm:inline"
                title={user.email ?? undefined}
              >
                {user.email}
              </span>
              <Button asChild variant="ghost" size="sm" className="rounded-full">
                <Link href="/mis-resultados">Mis resultados</Link>
              </Button>
              <form action={signOut}>
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  aria-label="Cerrar sesión"
                  className="rounded-full border-white/[0.10] bg-white/[0.02] hover:bg-white/[0.06]"
                >
                  <LogOut className="size-4 sm:mr-2" aria-hidden="true" />
                  <span className="hidden sm:inline">Cerrar sesión</span>
                </Button>
              </form>
            </>
          ) : (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-full border-white/[0.10] bg-white/[0.02] hover:bg-white/[0.06]"
            >
              <Link href="/login">Iniciar sesión</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
