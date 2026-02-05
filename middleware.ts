import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const sessionCookie = request.cookies.get("session");

    // DEBUG LOGGING (Check your terminal after login!)
    console.log(`[Middleware] Path: ${pathname} | Cookie Found: ${!!sessionCookie?.value}`);

    const isPublicPath = pathname === "/sign-in" || pathname === "/sign-up";

    // 1. IF USER IS LOGGED IN
    if (sessionCookie) {
        if (isPublicPath) {
            return NextResponse.redirect(new URL("/", request.url));
        }
        return NextResponse.next();
    }

    // 2. IF USER IS NOT LOGGED IN
    if (!sessionCookie) {
        if (isPublicPath) {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};