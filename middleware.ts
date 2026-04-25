import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const basicAuth = request.headers.get('authorization')
  const password = process.env.SITE_PASSWORD

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    const decoded = atob(authValue)
    const [, pwd] = decoded.split(':')
    if (pwd === password) return NextResponse.next()
  }

  return new NextResponse('Protected', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  })
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
}