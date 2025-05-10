// src/app/api/files/[fileId]/route.ts
import { connectGridFS } from '@/lib/gridfs';
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';

export async function GET(
    req: NextRequest,
    { params }: { params: { fileId: string } }
) {
    const gfs = await connectGridFS();
    const fileId = params.fileId;

    try {
        // Obtener el archivo desde GridFS
        const file = await gfs.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray();

        if (!file || file.length === 0) {
            return new Response('Archivo no encontrado', { status: 404 });
        }

        const { filename, contentType } = file[0]; // Acceder a los metadatos

        const fileStream = gfs.openDownloadStream(new mongoose.Types.ObjectId(fileId));

        return new Response(fileStream as any, {
            headers: {
                'Content-Disposition': `attachment; filename="${filename}"`, // Usar el nombre original
                'Content-Type': contentType || 'application/octet-stream', // Usar el tipo MIME si está disponible
            },
        });
    } catch (err) {
        return new Response('Error interno del servidor', { status: 500 });
    }
}