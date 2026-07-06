"use client";

import Link from "next/link";
import { use } from "react";
import { useActionState } from "react";
import { loginAction, type FormState } from "@/modules/auth/actions";
import { Input, Label, FieldError } from "@/components/ui/input";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormAlert } from "@/components/auth/form-alert";

const initial: FormState = {};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string; verified?: string; next?: string }>;
}) {
  const params = use(searchParams);
  const [state, action] = useActionState(loginAction, initial);
  const notice = params.reset
    ? "Password updated — please sign in."
    : params.verified
      ? "Email verified — please sign in."
      : undefined;

  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Sign in to continue your application.
      </p>
      <FormAlert error={state.error} message={notice} />
      <form action={action} className="space-y-4" noValidate>
        {params.next && <input type="hidden" name="next" value={params.next} />}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
          <FieldError>{state.fieldErrors?.email}</FieldError>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/auth/forgot" className="mb-1.5 text-xs text-brand hover:underline">
              Forgot?
            </Link>
          </div>
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
          <FieldError>{state.fieldErrors?.password}</FieldError>
        </div>
        <SubmitButton>Log in</SubmitButton>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        <Link href="/auth/otp" className="text-brand hover:underline">
          Sign in with a one-time code
        </Link>
      </p>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to STEP?{" "}
        <Link href="/auth/register" className="font-medium text-brand hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
