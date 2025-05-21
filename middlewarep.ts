import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const pathname = request.nextUrl.pathname
  const response = NextResponse.next()

  // Get localStorage auth data from headers (set by client-side)
  const localStorageAuth = request.headers.get('x-localstorage-auth')
  let authData = null

  try {
    authData = localStorageAuth ? JSON.parse(localStorageAuth) : null
  } catch (e) {
    console.error("Failed to parse localStorage auth data", e)
  }

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    return response
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    // Additional check for admin role from localStorage
    if (authData?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    
    return response
  }

  // Redirect authenticated users away from auth pages
  if (["/login", "/register", "/admin/login"].includes(pathname) && token) {
    const redirectPath = authData?.role === "admin" ? "/admin" : "/dashboard"
    return NextResponse.redirect(new URL(redirectPath, request.url))
  }

  return response
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register", "/admin/login"],
}