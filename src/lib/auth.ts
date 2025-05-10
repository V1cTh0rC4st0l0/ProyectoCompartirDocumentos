// src/lib/auth.ts
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'secreto';

export async function getUserFromCookies() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null;

    try {
        const decoded = verify(token, JWT_SECRET) as { userId: string };
        const user = await User.findById(decoded.userId).lean();
        return user;
    } catch (err) {
        return null;
    }
}
