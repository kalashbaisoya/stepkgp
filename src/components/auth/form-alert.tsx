import { cn } from "@/lib/utils";

export function FormAlert({
  error,
  message,
}: {
  error?: string;
  message?: string;
}) {
  const text = error ?? message;
  if (!text) return null;
  return (
    <div
      role="status"
      className={cn(
        "mb-4 rounded-md border px-3 py-2 text-sm",
        error
          ? "border-status-danger/30 bg-status-danger/10 text-status-danger"
          : "border-status-success/30 bg-status-success/10 text-status-success",
      )}
    >
      {text}
    </div>
  );
}
