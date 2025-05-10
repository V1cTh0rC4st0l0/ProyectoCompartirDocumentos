import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import bcrypt from 'bcryptjs'
import User from '@/models/User'

// GET usuarios
export async function GET() {
    await connectDB()
    const users = await User.find({}, { password: 0 }) // excluye password
    return NextResponse.json({ users })
}

// POST para crear usuario
export async function POST(req: Request) {
    const { username, password, rol } = await req.json()
    try {
        await connectDB()
        const existing = await User.findOne({ username })
        if (existing) return NextResponse.json({ message: 'El usuario ya existe' }, { status: 400 })

        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new User({ username, password: hashedPassword, rol })
        await newUser.save()

        return NextResponse.json({ message: 'Usuario creado exitosamente' })
    } catch (error) {
        return NextResponse.json({ message: 'Error al crear usuario', error }, { status: 500 })
    }
}

// DELETE usuario
export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    await connectDB()
    const deleted = await User.findByIdAndDelete(id)
    if (!deleted) return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 })

    return NextResponse.json({ message: 'Usuario eliminado' })
}

// PUT (actualizar usuario)
export async function PUT(req: Request) {
    const { id, username, rol } = await req.json()

    await connectDB()
    const user = await User.findById(id)

    if (!user) {
        return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 })
    }

    user.username = username
    user.rol = rol
    await user.save()

    return NextResponse.json({ message: 'Usuario actualizado' })
}