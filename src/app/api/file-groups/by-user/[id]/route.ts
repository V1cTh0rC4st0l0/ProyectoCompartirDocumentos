// src/app/api/file-groups/by-user/[id]/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import FileGroup from '@/models/FileGroup';
import mongoose from 'mongoose';

export async function GET(_req: Request, context: { params: { id: string } }) {
    await connectDB();

    const { id } = await context.params;

    try {
        const grupos = await FileGroup.find({
            $or: [
                { usuario: new mongoose.Types.ObjectId(id) },
                { compartidoCon: new mongoose.Types.ObjectId(id) }
            ]
        });

        return NextResponse.json({ ok: true, grupos });
    } catch (error) {
        console.error('Error al obtener grupos del usuario:', error);
        return NextResponse.json({ ok: false, message: 'Error al obtener grupos' }, { status: 500 });
    }
}
