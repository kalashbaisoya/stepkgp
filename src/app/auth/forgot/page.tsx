"use client";

import Link from "next/link";
import { useActionState } from "react";
import { forgotAction, type FormState } from "@/modules/auth/actions";
import { Input, Label, FieldError } from "@/components/ui/input";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormAlert } from "@/components/auth/form-alert";

const initial: FormState = {};

export default function ForgotPage() {
  const [state, action] = useActionState(forgotAction, initial);
  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight">Reset your password</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        We&rsquo;ll email you a link to choose a new password.
      </p>
      <FormAlert error={state.error} message={state.message} />
      {!state.ok && (
        <form action={action} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
            <FieldError>{state.fieldErrors?.email}</FieldError>
          </div>
          <SubmitButton>Send reset link</SubmitButton>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/auth/login" className="text-brand hover:underline">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
