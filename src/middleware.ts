import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';
  const url = new URL(req.url);
  const isApiOrStatic = url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/') || url.pathname.startsWith('/assets') || url.pathname.startsWith('/favicon');

  // Redirect apex pt-fbs.com -> www.pt-fbs.com (only for HTML routes)
  if (!isApiOrStatic && host === 'pt-fbs.com') {
    url.host = 'www.pt-fbs.com';
    return NextResponse.redirect(url, 301);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|assets|favicon.ico).*)'],
};


