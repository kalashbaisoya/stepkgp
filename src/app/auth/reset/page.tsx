"use client";

import Link from "next/link";
import { use, useActionState } from "react";
import { resetAction, type FormState } from "@/modules/auth/actions";
import { Input, Label, FieldError } from "@/components/ui/input";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormAlert } from "@/components/auth/form-alert";

const initial: FormState = {};

export default function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = use(searchParams);
  const [state, action] = useActionState(resetAction, initial);

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="text-xl font-semibold tracking-tight">Invalid link</h1>
        <p className="mt-2 mb-6 text-sm text-muted-foreground">
          This reset link is missing or malformed.
        </p>
        <Link href="/auth/forgot" className="font-medium text-brand hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight">Choose a new password</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Enter a new password for your account.
      </p>
      <FormAlert error={state.error} />
      <form action={action} className="space-y-4" noValidate>
        <input type="hidden" name="token" value={token} />
        <div>
          <Label htmlFor="password">New password</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" required />
          <FieldError>{state.fieldErrors?.password}</FieldError>
        </div>
        <SubmitButton>Update password</SubmitButton>
      </form>
    </>
  );
}
