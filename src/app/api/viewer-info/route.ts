// src/app/api/viewer-info/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

export async function GET() {
    await connectDB();

    const db = mongoose.connection.db;
    if (!db) {
        console.error('Error: Database instance not available.');
        return NextResponse.json({ ok: false, message: 'Internal server error: Database not connected.' }, { status: 500 });
    }

    const bucket = new GridFSBucket(db, { bucketName: 'uploads' });

    try {
        const viewerFile = await bucket.find({ 'metadata.isViewer': true })
            .sort({ uploadDate: -1 })
            .limit(1)
            .toArray();

        if (viewerFile.length === 0) {
            return NextResponse.json({ ok: false, message: 'Visor no encontrado.' }, { status: 404 });
        }

        return NextResponse.json({
            ok: true,
            fileId: viewerFile[0]._id.toString(),
            fileName: viewerFile[0].filename,
        });

    } catch (error: unknown) {
        console.error('Error al obtener info del visor:', error);
        return NextResponse.json({ ok: false, message: 'Error interno del servidor.', error }, { status: 500 });
    }
}