import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("session");

  // 1. Define Public Paths (Exact matches or starts with)
  const isPublicPath = pathname === "/sign-in" || pathname === "/sign-up";

  // 2. IF USER IS LOGGED IN
  if (sessionCookie) {
    // If they are on Login/Signup page, force them to Home
    if (isPublicPath) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    // Otherwise, let them go wherever they want
    return NextResponse.next();
  }

  // 3. IF USER IS *NOT* LOGGED IN
  if (!sessionCookie) {
    // If they are ALREADY on a public page, let them stay there (STOPS THE LOOP)
    if (isPublicPath) {
      return NextResponse.next();
    }
    // Otherwise, kick them to Sign In
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (svg, png, jpg, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png).*)",
  ],
};