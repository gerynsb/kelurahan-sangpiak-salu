import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // Get cookies from request
    const cookieHeader = request.headers.get('cookie')
    const cookies = Object.fromEntries(
      cookieHeader?.split('; ').map(c => c.split('=')) || []
    )

    const adminSession = cookies.admin_session
    const sessionId = cookies.session_id

    // Check if admin session exists and is valid
    const isAuthenticated = adminSession === 'authenticated' && sessionId

    if (isAuthenticated) {
      return NextResponse.json({
        success: true,
        authenticated: true,
        message: 'Session valid'
      })
    } else {
      return NextResponse.json({
        success: false,
        authenticated: false,
        message: 'Session invalid or expired'
      }, { status: 401 })
    }

  } catch (error) {
    console.error('Session verification error:', error)
    return NextResponse.json({
      success: false,
      authenticated: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}
