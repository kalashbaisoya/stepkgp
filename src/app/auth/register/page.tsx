"use client";

import Link from "next/link";
import { use, useActionState } from "react";
import { registerAction, type FormState } from "@/modules/auth/actions";
import { Input, Label, FieldError } from "@/components/ui/input";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormAlert } from "@/components/auth/form-alert";

const initial: FormState = {};

export default function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = use(searchParams);
  const [state, action] = useActionState(registerAction, initial);
  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight">Create your account</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        One account, every incubation cycle.
      </p>
      <FormAlert error={state.error} />
      <form action={action} className="space-y-4" noValidate>
        {/* registerAction reads this to decide where to land, same as login. */}
        {params.next && <input type="hidden" name="next" value={params.next} />}
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" autoComplete="name" required />
          <FieldError>{state.fieldErrors?.name}</FieldError>
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
          <FieldError>{state.fieldErrors?.email}</FieldError>
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" required />
          <FieldError>{state.fieldErrors?.password}</FieldError>
        </div>
        <SubmitButton>Create account</SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={params.next ? `/auth/login?next=${encodeURIComponent(params.next)}` : "/auth/login"}
          className="font-medium text-brand hover:underline"
        >
          Log in
        </Link>
      </p>
    </>
  );
}
