import { NextRequest, NextResponse } from 'next/server'

const ACCESS_TOKEN_COOKIE_KEY = 'algolab_access_token'
const USER_ROLE_COOKIE_KEY = 'algolab_user_role'

const protectedPrefixes = ['/dashboard', '/experiments', '/reports', '/analytics', '/analysis', '/admin']
const authPages = ['/login', '/register', '/auth/login', '/auth/signup']

const analyticsPrefixes = ['/analytics']
const adminPrefixes = ['/admin']

function hasRoleAccess(pathname: string, role: string | undefined) {
  const isAnalyticsRoute = analyticsPrefixes.some((prefix) => startsWithPath(pathname, prefix))
  if (isAnalyticsRoute) {
    return role === 'instructor' || role === 'admin'
  }

  const isAdminRoute = adminPrefixes.some((prefix) => startsWithPath(pathname, prefix))
  if (isAdminRoute) {
    return role === 'admin'
  }

  return true
}

function startsWithPath(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasAccessToken = Boolean(request.cookies.get(ACCESS_TOKEN_COOKIE_KEY)?.value)
  const role = request.cookies.get(USER_ROLE_COOKIE_KEY)?.value

  const isProtectedRoute = protectedPrefixes.some((prefix) => startsWithPath(pathname, prefix))
  if (isProtectedRoute && !hasAccessToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isProtectedRoute && !hasRoleAccess(pathname, role)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  const isAuthPage = authPages.some((page) => startsWithPath(pathname, page))
  if (isAuthPage && hasAccessToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/experiments/:path*',
    '/analysis/:path*',
    '/analytics/:path*',
    '/reports/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/auth/login',
    '/auth/signup',
  ],
}
