import Link from "next/link";
import { verifyEmail } from "@/modules/auth/service";

// Server component: verifies the email token if present, otherwise shows a
// "check your inbox" confirmation after registration (?sent=1).
export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; sent?: string }>;
}) {
  const { token, sent } = await searchParams;

  if (token) {
    let ok = false;
    try {
      await verifyEmail({ token });
      ok = true;
    } catch {
      ok = false;
    }
    return (
      <div className="text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          {ok ? "Email verified" : "Verification failed"}
        </h1>
        <p className="mt-2 mb-6 text-sm text-muted-foreground">
          {ok
            ? "Your account is active. You can now sign in."
            : "This link is invalid or has expired. Try registering again or request a new link."}
        </p>
        <Link
          href={ok ? "/auth/login?verified=1" : "/auth/register"}
          className="font-medium text-brand hover:underline"
        >
          {ok ? "Go to sign in" : "Back to register"}
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h1 className="text-xl font-semibold tracking-tight">Check your inbox</h1>
      <p className="mt-2 mb-6 text-sm text-muted-foreground">
        {sent
          ? "We've sent you a verification link. Click it to activate your account."
          : "Open the verification link we emailed you to continue."}
      </p>
      <Link href="/auth/login" className="font-medium text-brand hover:underline">
        Back to sign in
      </Link>
    </div>
  );
}
