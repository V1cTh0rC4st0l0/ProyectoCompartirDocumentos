import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import FileGroupModel from '@/models/FileGroup';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_temporal';

export async function GET(req: NextRequest) {
    await connectDB();

    // Extraer el token desde las cookies
    const token = req.cookies.get('token')?.value;

    if (!token) {
        return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
    }

    try {
        // Verificar token
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

        const userId = decoded.id;

        // Buscar los grupos compartidos con este usuario
        const sharedFileGroups = await FileGroupModel.find({ compartidoCon: userId }).populate('archivos');

        return NextResponse.json(sharedFileGroups);
    } catch (error) {
        console.error('Error al obtener grupos compartidos:', error);
        return NextResponse.json({ message: 'Error interno' }, { status: 500 });
    }
}
