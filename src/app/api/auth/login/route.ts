// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import User from '@/models/User'
import { connectDB } from '@/lib/mongodb'

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_temporal'

export async function POST(req: Request) {
    const { username, password } = await req.json()
    await connectDB()
    const user = await User.findOne({ username })

    if (!user) {
        return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 401 })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
        return NextResponse.json({ message: 'Contraseña incorrecta' }, { status: 401 })
    }

    const token = jwt.sign({ id: user._id, rol: user.rol }, JWT_SECRET, { expiresIn: '1d' })

    const response = NextResponse.json({ message: 'Login exitoso', rol: user.rol })
    response.headers.set(
        'Set-Cookie',
        `token=${token}; HttpOnly; Path=/; Max-Age=86400; Secure; SameSite=Strict`
    )
    return response
}
