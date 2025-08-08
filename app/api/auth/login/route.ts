import { NextResponse } from 'next/server'

// Simple authentication - in production, use proper password hashing
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'sangpiaksalu2025' // Change this to a secure password
}

// Session storage to track failed attempts and require re-authentication
const sessionStore = new Map<string, {
  attempts: number,
  lastAttempt: number,
  isAuthenticated: boolean,
  sessionId: string
}>()

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const sessionKey = `${clientIP}_${userAgent.slice(0, 50)}`

    // Validate input
    if (!username || !password) {
      return NextResponse.json({
        success: false,
        message: 'Username and password are required'
      }, { status: 400 })
    }

    // Get or create session info
    const sessionInfo = sessionStore.get(sessionKey) || {
      attempts: 0,
      lastAttempt: 0,
      isAuthenticated: false,
      sessionId: Date.now().toString()
    }

    // Check for rate limiting (max 3 attempts per 10 minutes)
    const now = Date.now()
    const tenMinutes = 10 * 60 * 1000
    
    if (sessionInfo.attempts >= 3 && (now - sessionInfo.lastAttempt) < tenMinutes) {
      return NextResponse.json({
        success: false,
        message: 'Too many failed attempts. Please try again in 10 minutes.'
      }, { status: 429 })
    }

    // Reset attempts if 10 minutes have passed
    if ((now - sessionInfo.lastAttempt) >= tenMinutes) {
      sessionInfo.attempts = 0
    }

    // Check credentials
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      // Success - reset attempts and mark as authenticated
      sessionInfo.attempts = 0
      sessionInfo.isAuthenticated = true
      sessionInfo.sessionId = now.toString()
      sessionStore.set(sessionKey, sessionInfo)

      // Create response with secure cookie
      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        sessionId: sessionInfo.sessionId
      })

      // Set secure HTTP-only cookie
      response.cookies.set('admin_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/'
      })

      // Set session ID cookie for client verification
      response.cookies.set('session_id', sessionInfo.sessionId, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/'
      })

      return response
    } else {
      // Failed attempt - increment counter
      sessionInfo.attempts++
      sessionInfo.lastAttempt = now
      sessionInfo.isAuthenticated = false
      sessionStore.set(sessionKey, sessionInfo)

      return NextResponse.json({
        success: false,
        message: `Invalid username or password. ${3 - sessionInfo.attempts} attempts remaining.`
      }, { status: 401 })
    }

  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}
