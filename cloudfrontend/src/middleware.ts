import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl;
    const userAgent = request.headers.get('user-agent') || '';

    // Check if request is from PWA (mobile app)
    const isPWA = searchParams.get('mobile') === 'true' ||
        request.headers.get('x-requested-with') === 'org.mozilla.firefox' ||
        userAgent.includes('wv') || // WebView
        request.headers.get('x-purpose') === 'install';

    // Check if user is on mobile device
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

    // Get authentication token from cookies
    const token = request.cookies.get('token')?.value;

    // If accessing root and is PWA/mobile, redirect to auth or dashboard
    if (pathname === '/' && (isPWA || isMobile)) {
        if (token) {
            // User is authenticated, redirect to dashboard
            return NextResponse.redirect(new URL('/dashboard', request.url));
        } else {
            // User is not authenticated, redirect to auth
            return NextResponse.redirect(new URL('/auth', request.url));
        }
    }

    // If accessing root on desktop, allow normal flow
    if (pathname === '/' && !isPWA && !isMobile) {
        return NextResponse.next();
    }

    // For all other routes, continue normally
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - manifest.json (PWA manifest)
         * - sw.js (service worker)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js).*)',
    ],
};