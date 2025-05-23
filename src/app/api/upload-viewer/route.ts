// src/app/api/upload-viewer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Readable } from 'stream';
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    await connectDB();

    const formData = await req.formData();
    const viewerFile = formData.get('viewerFile') as File;

    if (!viewerFile) {
        return NextResponse.json({ ok: false, message: 'No se proporcionó el archivo del visor.' }, { status: 400 });
    }

    if (viewerFile.type !== 'application/x-msdownload' && !viewerFile.name.endsWith('.exe')) {
        return NextResponse.json({ ok: false, message: 'Tipo de archivo no permitido. Solo se permiten archivos .exe' }, { status: 400 });
    }

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db!, {
        bucketName: 'uploads',
    });

    try {
        const bytes = await viewerFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const stream = Readable.from(buffer);

        const uploadStream = bucket.openUploadStream(viewerFile.name, {
            contentType: viewerFile.type,
            metadata: {
                isViewer: true,
                version: new Date().toISOString(),
            },
        });

        await new Promise((resolve, reject) => {
            stream.pipe(uploadStream)
                .on('error', reject)
                .on('finish', () => {
                    resolve(true);
                });
        });

        const fileId = uploadStream.id;

        return NextResponse.json({
            ok: true,
            message: 'Visor subido correctamente.',
            fileId: fileId.toString(),
            fileName: viewerFile.name,
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error al subir el visor:', error);
        return NextResponse.json({ ok: false, message: 'Error interno del servidor al subir el visor.', error: error.message }, { status: 500 });
    }
}