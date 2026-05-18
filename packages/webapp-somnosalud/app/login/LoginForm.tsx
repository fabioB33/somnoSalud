'use client';

import { useFormState, useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { LoginActionResult, signInWithOtp } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Enviando…' : 'Enviame el link'}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState<LoginActionResult | null, FormData>(
    signInWithOtp,
    null,
  );

  if (state?.ok) {
    return (
      <div
        className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-900"
        role="status"
        aria-live="polite"
      >
        <p className="font-medium">Listo, revisá tu email.</p>
        <p className="mt-1">
          Te enviamos un link de acceso a <strong>{state.email}</strong>. Hacé
          click ahí para entrar (el link es válido por una hora).
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="tu.email@ejemplo.com"
          aria-describedby={state?.ok === false ? 'login-error' : undefined}
        />
      </div>

      {state?.ok === false && (
        <p
          id="login-error"
          className="text-sm text-red-600"
          role="alert"
        >
          {state.error}
        </p>
      )}

      <SubmitButton />

      <p className="text-xs text-muted-foreground">
        Te enviamos un link por email. No usamos contraseñas — el link te
        autentica con un click.
      </p>
    </form>
  );
}
