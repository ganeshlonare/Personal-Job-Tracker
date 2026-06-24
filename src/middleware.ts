import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isAuthPage =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register");

  const isProtectedPage =
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/today") ||
    nextUrl.pathname.startsWith("/applications") ||
    nextUrl.pathname.startsWith("/companies") ||
    nextUrl.pathname.startsWith("/interviews") ||
    nextUrl.pathname.startsWith("/leetcode") ||
    nextUrl.pathname.startsWith("/projects") ||
    nextUrl.pathname.startsWith("/study") ||
    nextUrl.pathname.startsWith("/goals") ||
    nextUrl.pathname.startsWith("/calendar") ||
    nextUrl.pathname.startsWith("/analytics") ||
    nextUrl.pathname.startsWith("/resumes") ||
    nextUrl.pathname.startsWith("/documents") ||
    nextUrl.pathname.startsWith("/achievements") ||
    nextUrl.pathname.startsWith("/journal") ||
    nextUrl.pathname.startsWith("/settings") ||
    nextUrl.pathname.startsWith("/cold-mails") ||
    nextUrl.pathname.startsWith("/timeline") ||
    nextUrl.pathname.startsWith("/github");

  // Redirect logged-in users away from auth pages
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Redirect non-logged-in users to login for protected pages
  if (isProtectedPage && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Redirect root to dashboard or login
  if (nextUrl.pathname === "/") {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icons|images|fonts).*)",
  ],
};
