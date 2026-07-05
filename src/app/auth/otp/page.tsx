"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  requestOtpAction,
  verifyOtpAction,
  type FormState,
} from "@/modules/auth/actions";
import { Input, Label, FieldError } from "@/components/ui/input";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormAlert } from "@/components/auth/form-alert";

const initial: FormState = {};

export default function OtpPage() {
  const [reqState, requestAction] = useActionState(requestOtpAction, initial);
  const [verState, verifyAction] = useActionState(verifyOtpAction, initial);
  const codeSent = reqState.ok;

  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight">Sign in with a code</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        {codeSent
          ? "Enter the 6-digit code we emailed you."
          : "We'll email you a one-time login code."}
      </p>

      {!codeSent ? (
        <>
          <FormAlert error={reqState.error} />
          <form action={requestAction} className="space-y-4" noValidate>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required />
              <FieldError>{reqState.fieldErrors?.email}</FieldError>
            </div>
            <SubmitButton>Send code</SubmitButton>
          </form>
        </>
      ) : (
        <>
          <FormAlert error={verState.error} message={reqState.message} />
          <form action={verifyAction} className="space-y-4" noValidate>
            {/* email is re-collected so the verify action has it */}
            <div>
              <Label htmlFor="email2">Email</Label>
              <Input id="email2" name="email" type="email" autoComplete="email" required />
            </div>
            <div>
              <Label htmlFor="otp">6-digit code</Label>
              <Input id="otp" name="otp" inputMode="numeric" maxLength={6} required />
              <FieldError>{verState.fieldErrors?.otp}</FieldError>
            </div>
            <SubmitButton>Verify &amp; sign in</SubmitButton>
          </form>
        </>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/auth/login" className="text-brand hover:underline">
          Back to password sign in
        </Link>
      </p>
    </>
  );
}
