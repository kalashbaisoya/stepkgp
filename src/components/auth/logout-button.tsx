import { logoutAction } from "@/modules/auth/actions";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        Sign out
      </button>
    </form>
  );
}
