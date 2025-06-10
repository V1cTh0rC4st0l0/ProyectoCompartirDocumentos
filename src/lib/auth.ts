// src/lib/auth.ts
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { connectDB } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_temporal';

interface JwtPayload {
    id: string;
    rol: string;
    iat: number;
    exp: number;
}

export async function getAuthenticatedUserFromToken() {
    try {
        const token = (await cookies()).get('token')?.value;

        if (!token) {
            return null;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        if (!decoded || !decoded.id) {
            return null;
        }

        await connectDB();
        const user = await User.findById(decoded.id).select('username rol');

        if (!user) {
            return null;
        }

        return {
            userId: user._id.toString(),
            username: user.username,
            rol: user.rol,
        };
    } catch {
        return null;
    }
}