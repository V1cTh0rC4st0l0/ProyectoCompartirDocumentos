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
    } catch (error: unknown) {
        console.error('Error al obtener el collage:', error);
        let errorMessage = 'Error al obtener el collage.';

        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
            errorMessage = (error as { message: string }).message;
        }

        return NextResponse.json({ message: 'Error al obtener el collage', error: errorMessage }, { status: 500 });
    }
}