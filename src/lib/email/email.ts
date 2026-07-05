import "server-only";

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

/**
 * Email adapter (Phase 9 §8). Milestone 1 uses a dev transport that logs to the
 * server console; a real provider (SMTP/Resend/SES) is wired here in Milestone 10
 * without touching callers.
 */
export async function sendEmail(msg: EmailMessage): Promise<void> {
  if (process.env.NODE_ENV === "production" && process.env.SMTP_URL) {
    // TODO(M10): real provider transport.
  }
  console.log(
    `\n📧 [email:dev] to=${msg.to}\n   subject: ${msg.subject}\n   ${msg.text ?? msg.html.replace(/<[^>]+>/g, "")}\n`,
  );
}
