import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const pathname = request.nextUrl.pathname
  const response = NextResponse.next()

  // Allow access to login pages without redirection
  if (pathname === '/login' || pathname === '/admin/login' || pathname === '/register') {
    if (token) {
      // If already logged in, redirect to appropriate dashboard
      const redirectPath = token.role === 'admin' ? '/admin/dashboard' : '/dashboard'
      return NextResponse.redirect(new URL(redirectPath, request.url))
    }
    return response
  }

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    if (token.role == "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    }

    return response
  }

  // Protect admin routes (except login)
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    // Check admin role
    if (token.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    
    return response
  }

  return response
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register", "/admin/login"],
}