// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import User from '@/models/User'
import { connectDB } from '@/lib/mongodb'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_temporal'

export async function POST(req: Request) {
    const { email, password } = await req.json()
    await connectDB()

    const user = await User.findOne({ email })

    if (!user) {
        return NextResponse.json({ message: 'Correo electrónico o contraseña incorrectos' }, { status: 401 })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
        return NextResponse.json({ message: 'Correo electrónico o contraseña incorrectos' }, { status: 401 })
    }

    const token = jwt.sign({ id: user._id, rol: user.rol }, JWT_SECRET, { expiresIn: '1d' })

        ; (await
            cookies()).set('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24,
            })

    return NextResponse.json({ message: 'Login exitoso', rol: user.rol })
}