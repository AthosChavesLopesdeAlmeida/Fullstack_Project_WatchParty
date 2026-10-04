import { NextRequest, NextResponse } from "next/server";

const AUTH_ROUTES = ["/login", "/register"];
const PROTECTED_ROUTES = ["/main", "/me", "/friends", "/rooms", "/room"];

async function isTokenValid(token: string | undefined): Promise<boolean> {
  if (!token) return false;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
      headers: { Cookie: `token=${token}` },
    });
    return res.ok;
  } catch {
    // servidor da API fora do ar, ou erro de rede — trata como não autenticado
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const valid = await isTokenValid(token);
  const { pathname } = req.nextUrl;

  const isLandingPage = pathname === "/";
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (valid && (isLandingPage || isAuthRoute)) {
    return NextResponse.redirect(new URL("/rooms", req.url));
  }

  if (!valid && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/main/:path*",
    "/me/:path*",
    "/friends/:path*",
    "/rooms/:path*",
    "/room/:path*",
  ],
};