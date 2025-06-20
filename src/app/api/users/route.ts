import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import bcrypt from 'bcryptjs'
import User from '@/models/User'

// GET usuarios
export async function GET() {
    await connectDB();
    try {
        const users = await User.find({}, 'username email rol').exec();
        return NextResponse.json({ users }, { status: 200 });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ message: 'Error interno del servidor al obtener usuarios.' }, { status: 500 });
    }
}

// POST para crear usuario
export async function POST(req: Request) {
    const { username, email, password, rol } = await req.json();
    await connectDB();

    try {
        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
            return NextResponse.json({ message: 'Ya existe un usuario con este correo electrónico.' }, { status: 409 });
        }

        const existingUserByUsername = await User.findOne({ username });
        if (existingUserByUsername) {
            return NextResponse.json({ message: 'Ya existe un usuario con este nombre de usuario.' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            rol,
        });

        await newUser.save();

        return NextResponse.json({ message: 'Usuario creado exitosamente', user: newUser }, { status: 201 });
    } catch (error: unknown) {
        console.error('Error al crear usuario:', error);
        if (error === 'ValidationError') {
            return NextResponse.json({ message: error }, { status: 400 });
        }
        return NextResponse.json({ message: 'Error interno del servidor al crear usuario.' }, { status: 500 });
    }
}

// DELETE usuario
export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ message: 'ID de usuario no proporcionado.' }, { status: 400 });
    }

    await connectDB();
    try {
        const result = await User.findByIdAndDelete(id);
        if (!result) {
            return NextResponse.json({ message: 'Usuario no encontrado.' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Usuario eliminado exitosamente.' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ message: 'Error interno del servidor al eliminar usuario.' }, { status: 500 });
    }
}

// PUT (actualizar usuario)
export async function PUT(req: Request) {
    const { id, username, email, password, rol } = await req.json();
    await connectDB();

    try {
        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ message: 'Usuario no encontrado.' }, { status: 404 });
        }

        if (email && email !== user.email) {
            const existingUserByEmail = await User.findOne({ email });
            if (existingUserByEmail && existingUserByEmail._id.toString() !== id) {
                return NextResponse.json({ message: 'El correo electrónico ya está en uso por otro usuario.' }, { status: 409 });
            }
        }
        if (username && username !== user.username) {
            const existingUserByUsername = await User.findOne({ username });
            if (existingUserByUsername && existingUserByUsername._id.toString() !== id) {
                return NextResponse.json({ message: 'El nombre de usuario ya está en uso por otro usuario.' }, { status: 409 });
            }
        }

        user.username = username || user.username;
        user.email = email || user.email;
        user.rol = rol || user.rol;

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();

        return NextResponse.json({ message: 'Usuario actualizado exitosamente.' }, { status: 200 });
    } catch (error: unknown) {
        console.error('Error al actualizar usuario:', error);
        return NextResponse.json({ message: 'Error interno del servidor al actualizar usuario.' }, { status: 500 });
    }
}