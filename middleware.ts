import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_temporal';

export function middleware(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    const { pathname } = req.nextUrl;

    // Manejar solo la raíz "/"
    if (pathname === '/') {
        const url = req.nextUrl.clone();

        if (!token) {
            url.pathname = '/login';
            return NextResponse.redirect(url);
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { rol: string };

            // Redirige a dashboard o admin según el rol
            url.pathname = decoded.rol === 'admin' ? '/admin' : '/dashboard';
            return NextResponse.redirect(url);
        } catch (err) {
            url.pathname = '/login';
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/'],
};