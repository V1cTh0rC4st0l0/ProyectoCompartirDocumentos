import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_temporal';

export async function GET(req: Request) {
    await connectDB();
    const token = req.headers.get('cookie')?.split('; ').find(c => c.startsWith('token='))?.split('=')[1];

    if (!token) {
        return NextResponse.json({ message: 'Token no encontrado' }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        const user = await User.findById(decoded.id).select('username rol');

        if (!user) return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });

        return NextResponse.json({ username: user.username, rol: user.rol });
    } catch {
        return NextResponse.json({ message: 'Token inválido' }, { status: 401 });
    }
}
