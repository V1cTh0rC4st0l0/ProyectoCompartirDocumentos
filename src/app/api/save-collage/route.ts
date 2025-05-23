// /app/api/save-collage/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Collage from '@/models/Collage';

export async function POST(req: Request) {
    const { imageUrls } = await req.json();

    try {
        await connectDB();

        const filter = { _id: 'default_collage' };
        const update = { imageUrls, updatedAt: new Date() };
        const options = { upsert: true };

        const result = await Collage.updateOne(filter, update, options);

        return NextResponse.json({ message: 'Collage guardado exitosamente', result });
    } catch (error: any) {
        console.error('Error al guardar el collage:', error);
        return NextResponse.json({ message: 'Error al guardar el collage', error: error.message }, { status: 500 });
    }
}