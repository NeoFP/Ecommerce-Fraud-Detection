import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isProtectedApi =
    request.nextUrl.pathname.startsWith("/api/fraud-alerts") ||
    request.nextUrl.pathname.startsWith("/api/dos-alerts");

  // Check if this is a protected route
  if (isAdminRoute || isProtectedApi) {
    // Allow access to login page
    if (request.nextUrl.pathname === "/admin/login") {
      return NextResponse.next();
    }

    // Check if user is authenticated
    const adminAuthenticated = request.cookies.get("adminAuthenticated")?.value;

    // If not authenticated, redirect to login or return 401 for API
    if (!adminAuthenticated) {
      if (isProtectedApi) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/fraud-alerts", "/api/dos-alerts"],
};
