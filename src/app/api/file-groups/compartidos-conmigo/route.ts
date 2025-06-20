// src/app/api/file-groups/compartidos-conmigo/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import FileGroupModel from '@/models/FileGroup';
import UserModel from '@/models/User';
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
        const user = await UserModel.findById(userId).select('username');

        if (!user) {
            return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
        }

        const userName = user.username;
        const sharedFileGroups = await FileGroupModel.find({ compartidoCon: userId }).populate('archivos');

        return NextResponse.json({
            userName: userName,
            fileGroups: sharedFileGroups
        });

    } catch (error) {
        console.error('Error al obtener grupos compartidos:', error);
        if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json({ message: 'Token de autenticación inválido o expirado' }, { status: 401 });
        }
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
}