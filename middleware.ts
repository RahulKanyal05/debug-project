// // middleware.ts
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// // Paths that don't require authentication
// const PUBLIC_PATHS = ['/sign-in', '/sign-up', '/reset-password'];

// // Check if the current path matches any of the public paths
// function isPublicPath(path: string): boolean {
//   return PUBLIC_PATHS.some(publicPath => path.startsWith(publicPath));
// }

// export async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;
  
//   // Get session cookie
//   const sessionCookie = request.cookies.get("session");
//   const isAuthenticated = !!sessionCookie?.value;
  
//   // If not authenticated and trying to access a protected route, redirect to sign-in
//   if (!isAuthenticated && !isPublicPath(pathname)) {
//     const signInUrl = new URL('/sign-in', request.url);
//     return NextResponse.redirect(signInUrl);
//   }
  
//   // If authenticated and trying to access auth pages, redirect to home
//   if (isAuthenticated && isPublicPath(pathname)) {
//     return NextResponse.redirect(new URL('/', request.url));
//   }
  
//   return NextResponse.next();
// }

// // Configure which paths the middleware applies to
// export const config = {
//   matcher: [
//     '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$).*)',
//   ],
// };

// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/sign-in", "/sign-up"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore public routes
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("session");

  // Protect everything else
  if (!sessionCookie) {
    return NextResponse.redirect(
      new URL("/sign-in", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
