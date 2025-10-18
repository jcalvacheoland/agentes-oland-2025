import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import authConfig from "./auth.config"

const { auth } = NextAuth(authConfig)

const publicRoutes = new Set(["/", "/login", "api" , "/register"])
const authRoutes = new Set(["/login", "/register"])
const DEFAULT_REDIRECT = "/dashboard"
const API_AUTH_PREFIX = "/api/auth"

export default auth((req) => {
  const { pathname } = req.nextUrl

  if (pathname.startsWith(API_AUTH_PREFIX)) {
    return NextResponse.next()
  }

  const isPublicRoute = publicRoutes.has(pathname)
  const isAuthRoute = authRoutes.has(pathname)
  const isApiRoute = pathname.startsWith("/api")
  const isLoggedIn = Boolean(req.auth)

  if (!isLoggedIn) {
    if (isPublicRoute) {
      return NextResponse.next()
    }

    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const callbackUrl = req.nextUrl.pathname + req.nextUrl.search
    const loginUrl = new URL("/login", req.url)

    if (callbackUrl && callbackUrl !== "/") {
      loginUrl.searchParams.set("callbackUrl", callbackUrl)
    }

    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute) {
    return NextResponse.redirect(new URL(DEFAULT_REDIRECT, req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|assets).*)",
    "/api/:path*",
  ],
}
