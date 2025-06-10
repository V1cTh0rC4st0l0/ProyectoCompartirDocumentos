// src/app/api/file-groups/compartidos-conmigo/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import FileGroupModel from '@/models/FileGroup';
import UserModel from '@/models/User'; // <-- Tu modelo de usuario
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_temporal';

export async function GET(req: NextRequest) {
    await connectDB();

    const token = req.cookies.get('token')?.value;

    if (!token) {
        return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        const userId = decoded.id;

        // 1. Buscar el usuario para obtener su 'username'
        // Usamos .select('username') para obtener solo ese campo y optimizar la consulta.
        const user = await UserModel.findById(userId).select('username');

        if (!user) {
            // Podría pasar si el usuario fue eliminado después de que se emitió el token
            return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
        }

        // Obtener el nombre de usuario del campo 'username'
        const userName = user.username;

        // Buscar los grupos compartidos con este usuario
        const sharedFileGroups = await FileGroupModel.find({ compartidoCon: userId }).populate('archivos');

        // Devolver tanto los grupos como el nombre del usuario
        return NextResponse.json({
            userName: userName,
            fileGroups: sharedFileGroups
        });

    } catch (error) {
        console.error('Error al obtener grupos compartidos:', error);
        if (error instanceof jwt.JsonWebTokenError) {
            // Esto incluye tokens inválidos, expirados, etc.
            return NextResponse.json({ message: 'Token de autenticación inválido o expirado' }, { status: 401 });
        }
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
}