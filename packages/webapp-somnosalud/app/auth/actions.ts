'use server';

import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

/**
 * Cierra la sesion del usuario actual y redirige a / (Sprint 9.C).
 *
 * @supabase/ssr maneja la limpieza de cookies automaticamente al invocar
 * signOut() — no requiere logica manual de cookie deletion.
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
