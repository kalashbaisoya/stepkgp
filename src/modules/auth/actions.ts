"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import * as auth from "./service";
import { ServiceError } from "./service";

export type FormState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  message?: string;
};

function toState(err: unknown): FormState {
  if (err instanceof z.ZodError) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of err.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }
  if (err instanceof ServiceError) return { error: err.message };
  console.error("[auth action] unexpected", err);
  return { error: "Something went wrong. Please try again." };
}

async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export async function registerAction(_: FormState, form: FormData): Promise<FormState> {
  try {
    await auth.register({
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
    });
  } catch (err) {
    return toState(err);
  }
  redirect("/auth/verify?sent=1");
}

export async function loginAction(_: FormState, form: FormData): Promise<FormState> {
  try {
    await auth.login(
      { email: form.get("email"), password: form.get("password") },
      (await clientIp()) ?? undefined,
    );
  } catch (err) {
    return toState(err);
  }
  redirect("/app");
}

export async function requestOtpAction(_: FormState, form: FormData): Promise<FormState> {
  try {
    await auth.requestOtp({ email: form.get("email") });
    return { ok: true, message: "If the account exists, a code has been sent." };
  } catch (err) {
    return toState(err);
  }
}

export async function verifyOtpAction(_: FormState, form: FormData): Promise<FormState> {
  try {
    await auth.verifyOtp({ email: form.get("email"), otp: form.get("otp") });
  } catch (err) {
    return toState(err);
  }
  redirect("/app");
}

export async function forgotAction(_: FormState, form: FormData): Promise<FormState> {
  try {
    await auth.forgotPassword({ email: form.get("email") });
    return { ok: true, message: "If the account exists, a reset link has been sent." };
  } catch (err) {
    return toState(err);
  }
}

export async function resetAction(_: FormState, form: FormData): Promise<FormState> {
  try {
    await auth.resetPassword({ token: form.get("token"), password: form.get("password") });
  } catch (err) {
    return toState(err);
  }
  redirect("/auth/login?reset=1");
}

export async function logoutAction(): Promise<void> {
  await auth.logout();
  redirect("/");
}
