// /app/api/get-collage/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Collage from '@/models/Collage';

export async function GET() {
    try {
        await connectDB();
        const collageData = await Collage.findOne({ _id: 'default_collage' });
        const imageUrls = collageData ? collageData.imageUrls : [];
        return NextResponse.json({ imageUrls });
    } catch (error: any) {
        console.error('Error al obtener el collage:', error);
        return NextResponse.json({ message: 'Error al obtener el collage', error: error.message }, { status: 500 });
    }
}