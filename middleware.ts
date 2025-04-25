import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

// Protected routes that require authentication
const protectedRoutes = [
  '/leaderboard',
  '/tweets',
  '/projector',
  '/profile'
]

// Auth routes that should redirect to /leaderboard if already authenticated
const authRoutes = [
  '/auth/signin',
  '/auth/signup',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get the token from the request
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })
  
  const isAuthenticated = !!token
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname === route)
  
  // Case 1: User is logged in and trying to access auth routes
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL('/leaderboard', request.url))
  }
  
  // Case 2: User is not logged in and trying to access protected routes
  if (!isAuthenticated && isProtectedRoute) {
    const url = new URL('/auth/signin', request.url)
    // Add the original path as a "callbackUrl" parameter
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }
  
  // Case 3: User is logged in and hits the root path
  if (isAuthenticated && pathname === '/') {
    return NextResponse.redirect(new URL('/leaderboard', request.url))
  }
  
  // In all other cases, continue
  return NextResponse.next()
}

// Configure the paths for which the middleware will run
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes: /api/*
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public images)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
} 