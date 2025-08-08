import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname

  // Apply security headers to all requests
  const response = NextResponse.next()
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Check if the request is for admin paths
  if (pathname.startsWith('/admin')) {
    // Check authentication via cookies
    const adminSession = request.cookies.get('admin_session')?.value
    const sessionId = request.cookies.get('session_id')?.value
    
    // If not authenticated, redirect to login
    if (adminSession !== 'authenticated' || !sessionId) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      loginUrl.searchParams.set('reason', 'authentication_required')
      
      // Clear any invalid cookies
      const redirectResponse = NextResponse.redirect(loginUrl)
      redirectResponse.cookies.delete('admin_session')
      redirectResponse.cookies.delete('session_id')
      
      return redirectResponse
    }

    // Add additional security for admin paths
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  }

  // Prevent direct access to API auth routes from browser (except login)
  if (pathname.startsWith('/api/auth') && !pathname.includes('/login')) {
    // Only allow POST requests to auth endpoints
    if (request.method !== 'POST' && request.method !== 'GET') {
      return new NextResponse(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/auth/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
}
