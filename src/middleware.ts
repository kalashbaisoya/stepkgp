import { NextRequest, NextResponse } from "next/server";

// Edge middleware: cheap gate on session-cookie presence for protected zones.
// Full authorization (roles/permissions) is enforced server-side in layouts/services
// (the edge runtime can't reach Prisma). This only bounces obviously-unauthenticated
// requests to the login page early.
const COOKIE = "stepkgp_session";

export function middleware(req: NextRequest) {
  const hasSession = req.cookies.has(COOKIE);
  if (!hasSession) {
    const url = new URL("/auth/login", req.url);
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};
