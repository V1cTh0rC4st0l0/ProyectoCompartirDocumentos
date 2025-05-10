// src/app/api/file-groups/mis-grupos/route.ts
import { connectDB } from '@/lib/mongodb';
import FileGroupModel from '@/models/FileGroup';
import { getUserFromCookies } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { Types } from 'mongoose'; // Importa Types desde mongoose

interface Archivo {
    _id: string;
    nombreArchivo: string;
    tipoArchivo: string;
}

interface Grupo {
    _id: string;
    nombreGrupo: string;
    archivos: Archivo[];
}

export async function GET() {
    try {
        await connectDB();

        const user = await getUserFromCookies();
        if (!user) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }

        const grupos = await FileGroupModel.find({
            $or: [
                { creadoPor: user._id },
                { compartidoCon: user._id },
            ],
        }).lean().exec() as unknown as Grupo[];

        console.log("Datos recuperados de MongoDB:", grupos);
        if (!Array.isArray(grupos)) {
            return NextResponse.json({ error: 'Error inesperado al obtener los grupos' }, { status: 500 });
        }

        const gruposConArchivos = grupos.map((grupo): Grupo => ({
            _id: grupo._id?.toString() ?? '',
            nombreGrupo: grupo.nombreGrupo,
            archivos: grupo.archivos?.map((archivo: any) => ({
                _id: archivo._id?.toString() ?? '', // Conversión más segura
                nombreArchivo: archivo.nombreArchivo,
                tipoArchivo: archivo.tipoArchivo,
            })) ?? [],
        }));

        return NextResponse.json(gruposConArchivos);
    } catch (error) {
        console.error('Error al obtener los grupos', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}