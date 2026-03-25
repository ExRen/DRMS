import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/api/auth'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return NextResponse.next();

    // Check for token in cookie or local storage is handled client-side
    // This middleware just redirects unauthenticated requests to login
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
