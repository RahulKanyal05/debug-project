import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/sign-in", "/sign-up"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("session");

  // CASE 1: User is Logged In + Trying to access Login/Signup
  // ACTION: Redirect them to Home (Stop them from seeing login page again)
  if (sessionCookie && PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // CASE 2: User is on a Public Path (and not logged in)
  // ACTION: Let them pass
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // CASE 3: User is Not Logged In + Trying to access Private Route
  // ACTION: Kick them to Sign In
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // CASE 4: User is Logged In + Accessing Private Route
  // ACTION: Let them pass
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
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};