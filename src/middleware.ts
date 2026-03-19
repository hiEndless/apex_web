import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

import { AUTH_TOKEN_COOKIE_NAME } from './constants/auth-token';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const locales = routing.locales;

function getLocaleAndPathWithoutLocale(pathname: string): {
  locale: string;
  pathWithoutLocale: string;
} {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) {
    return { locale: routing.defaultLocale, pathWithoutLocale: '/' };
  }
  const first = segments[0];
  if (locales.includes(first as (typeof locales)[number])) {
    const rest = segments.slice(1);
    return {
      locale: first,
      pathWithoutLocale: rest.length ? `/${rest.join('/')}` : '/',
    };
  }
  return { locale: routing.defaultLocale, pathWithoutLocale: pathname };
}

function isDashboardPath(pathWithoutLocale: string) {
  return (
    pathWithoutLocale === '/dashboard' ||
    pathWithoutLocale.startsWith('/dashboard/')
  );
}

function signInPathForLocale(locale: string) {
  return locale === routing.defaultLocale
    ? '/auth/sign-in'
    : `/${locale}/auth/sign-in`;
}

function dashboardPathForLocale(locale: string) {
  return locale === routing.defaultLocale ? '/dashboard' : `/${locale}/dashboard`;
}

function isAuthPagePath(pathWithoutLocale: string) {
  return pathWithoutLocale === '/auth/sign-in' || pathWithoutLocale === '/auth/sign-up';
}

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const { locale, pathWithoutLocale } = getLocaleAndPathWithoutLocale(pathname);
  const token = request.cookies.get(AUTH_TOKEN_COOKIE_NAME)?.value;

  if (isDashboardPath(pathWithoutLocale)) {
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = signInPathForLocale(locale);
      return NextResponse.redirect(url);
    }
  }

  if (isAuthPagePath(pathWithoutLocale) && token) {
    const url = request.nextUrl.clone();
    url.pathname = dashboardPathForLocale(locale);
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
