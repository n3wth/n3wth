import { NextResponse, type NextRequest } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'
import { getSessionFromHeaders } from './src/server/auth/auth'

export async function proxy(request: NextRequest) {
  if (getSessionCookie(request) && await getSessionFromHeaders(request.headers)) return NextResponse.next()
  const url = request.nextUrl.clone()
  url.pathname = '/'
  url.searchParams.set('login', 'required')
  return NextResponse.redirect(url)
}

export const config = { matcher: ['/create/:path*'] }
