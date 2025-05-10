// src/app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

export async function GET() {
    try {
        await connectDB();
        return NextResponse.json({ ok: true, message: 'Conectado exitosamente a MongoDB' });
    } catch (error) {
        console.error('Error al conectar:', error);
        return NextResponse.json({ ok: false, message: 'Error al conectar a MongoDB' });
    }
}