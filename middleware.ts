import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  // Pages that require login
  const isProtectedUserPage =
    pathname.startsWith("/my-reports") ||
    pathname.startsWith("/report");

  // Protect admin routes
  if (isAdminPage || isAdminApi) {
    const sessionCookie = req.cookies.get("session")?.value;
    if (!sessionCookie) {
      if (isAdminApi) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Protect user routes
  if (isProtectedUserPage) {
    const sessionCookie = req.cookies.get("session")?.value;
    if (!sessionCookie) {
      // Save where they were trying to go so we can redirect back after login
      return NextResponse.redirect(
        new URL(`/login?from=${pathname}`, req.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/my-reports/:path*",
    "/report",
  ],
};