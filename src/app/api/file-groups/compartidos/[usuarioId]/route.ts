// src/app/api/file-groups/compartidos/[usuarioId]/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import FileGroup from '@/models/FileGroup';

export async function GET(request: Request, context: { params: { usuarioId: string } }) {
    const { usuarioId } = await context.params;

    try {
        await connectDB();

        const grupos = await FileGroup.find({ compartidoCon: usuarioId });
        return NextResponse.json(grupos);
    } catch (error) {
        console.error("Error al obtener grupos compartidos:", error);
        return NextResponse.json(
            { message: 'Error al obtener grupos compartidos', error },
            { status: 500 }
        );
    }
}