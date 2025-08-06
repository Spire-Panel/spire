import { clerkMiddleware } from "@clerk/nextjs/server";
import { createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/register", "/login", "/forgot-password"];
const AUTH_ROUTES = ["/register", "/login", "/forgot-password"];

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    createRouteMatcher(route)(req)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) =>
    createRouteMatcher(route)(req)
  );
  const pathname = req.nextUrl.pathname;

  // Always allow access to static files
  if (
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  // Redirect authenticated users away from auth pages
  if (userId && isAuthRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Redirect unauthenticated users to login if trying to access a protected route
  if (!userId && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

// ✅ Only run middleware for non-API, non-static routes
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:css|js|json|jpg|jpeg|png|gif|svg|ico|woff|woff2|ttf|eot|txt|xml|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
