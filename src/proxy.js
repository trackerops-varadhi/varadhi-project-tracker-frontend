import { NextResponse } from 'next/server'

// These pages don't need login
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/accept-invite'
]

export function proxy(request) {
  const { pathname } = request.nextUrl
  if (pathname === '/api' || pathname.startsWith('/api/')) {
    const backend = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    const isLocalBackend = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?=[:/]|$)/i.test(backend)
    const origin = request.headers.get('origin')
    // Only same-origin development requests to our local backend are proxied
    // without Origin. Cross-origin requests retain the backend's CORS checks.
    if (process.env.NODE_ENV === 'development' && isLocalBackend && origin) {
      try {
        if (new URL(origin).host === request.headers.get('host')) {
          const headers = new Headers(request.headers)
          headers.delete('origin')
          return NextResponse.next({ request: { headers } })
        }
      } catch {
        // Leave malformed origins for the backend to reject.
      }
    }
    return NextResponse.next()
  }
  const token = request.cookies.get('varadhi_token')?.value

  // Reuse the existing password page while keeping reset links valid.
  if (pathname === '/auth/reset-password') {
    const resetUrl = request.nextUrl.clone()
    resetUrl.pathname = '/auth/forgot-password'
    resetUrl.searchParams.set('mode', 'reset')
    return NextResponse.rewrite(resetUrl)
  }

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  )

  // Not logged in + trying to access private page → go to login
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Already logged in + trying to access auth pages → go to dashboard
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Root path → redirect based on login status
  if (pathname === '/') {
    return NextResponse.redirect(
      new URL(token ? '/dashboard' : '/auth/login', request.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  // PWA assets MUST be reachable while logged out, or the app is silently not
  // installable — with no error surfaced anywhere:
  //
  //   sw.js                 browsers refuse to register a service worker that
  //                         redirects to an HTML login page
  //   manifest.webmanifest  fetched during first paint, often before any auth
  //                         state exists; a 307 makes it parse as HTML
  //   icons/, apple-touch-icon
  //                         the OS installer fetches these entirely outside the
  //                         page's auth context
  //   offline               the fallback page must render when there is no
  //                         network to redirect over (used from SF6)
  //
  // `offline$` is anchored so a future /offline-report stays auth-protected.
  matcher: [
    '/api/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|icons/|apple-touch-icon|offline$|robots.txt|sitemap.xml).*)',
  ],
}
