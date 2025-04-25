import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

// Protected routes that require authentication
const protectedRoutes = [
  '/leaderboard',
  '/tweets',
  '/profile'
]

// Auth routes that should redirect to /leaderboard if already authenticated
const authRoutes = [
  '/auth/signin',
  '/auth/signup',
]

// Disabling authentication checks - making site publicly accessible
export async function middleware(request: NextRequest) {
  // Always continue to the requested page without authentication checks
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