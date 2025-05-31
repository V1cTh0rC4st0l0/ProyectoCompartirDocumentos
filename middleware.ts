import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_temporal';

export function middleware(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    const { pathname } = req.nextUrl;

    const url = req.nextUrl.clone();

    if (pathname === '/') {
        if (!token) {
            url.pathname = '/login';
            return NextResponse.redirect(url);
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { rol: string };
            url.pathname = decoded.rol === 'admin' ? '/admin' : '/dashboard';
            return NextResponse.redirect(url);
        } catch {
            url.pathname = '/login';
            return NextResponse.redirect(url);
        }
    }

    // Protege rutas /admin y /dashboard con validación de rol
    if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
        if (!token) {
            url.pathname = '/login';
            return NextResponse.redirect(url);
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { rol: string };

            if (pathname.startsWith('/admin') && decoded.rol !== 'admin') {
                url.pathname = '/login';
                return NextResponse.redirect(url);
            }

            if (pathname.startsWith('/dashboard') && !['admin', 'user'].includes(decoded.rol)) {
                url.pathname = '/login';
                return NextResponse.redirect(url);
            }

            return NextResponse.next();
        } catch {
            url.pathname = '/login';
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', './admin/:path*', '/dashboard/:path*'],
};