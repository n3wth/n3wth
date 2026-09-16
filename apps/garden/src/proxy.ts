import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { resolveLegacySlug } from '@/lib/legacy-route'

export function proxy(request: NextRequest) {
  const legacySlug = resolveLegacySlug(request.nextUrl.pathname.slice(1))
  if (!legacySlug) return NextResponse.next()

  const destination = request.nextUrl.clone()
  destination.pathname = `/${legacySlug}`
  return NextResponse.redirect(destination, 308)
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}
