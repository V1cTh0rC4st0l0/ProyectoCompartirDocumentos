// /app/api/files/[fileId]/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';
import { GridFSBucket, GridFSFile } from 'mongodb';

export async function GET(
    request: Request,
    { params }: { params: { fileId: string } }
) {

    const awaitedParams = await params;
    const { fileId } = awaitedParams;

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
        return NextResponse.json({ message: 'ID de archivo inválido.' }, { status: 400 });
    }

    try {
        await connectDB();
        const db = mongoose.connection.db;

        if (!db) {
            console.error('Error: La instancia de la base de datos no está disponible.');
            return NextResponse.json({ message: 'Error interno del servidor: Base de datos no disponible.' }, { status: 500 });
        }

        const bucket = new GridFSBucket(db, {
            bucketName: 'uploads',
        });

        const files: GridFSFile[] = await bucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray();

        if (files.length === 0) {
            return NextResponse.json({ message: 'Archivo no encontrado en GridFS.' }, { status: 404 });
        }

        const file: GridFSFile = files[0];

        const downloadStream = bucket.openDownloadStream(file._id);

        const headers = new Headers();
        headers.set('Content-Type', file.contentType || 'application/octet-stream');
        headers.set('Content-Disposition', `attachment; filename="${file.filename}"`);

        const responseStream = new ReadableStream({
            start(controller) {
                downloadStream.on('data', (chunk: Buffer) => {
                    controller.enqueue(chunk);
                });
                downloadStream.on('end', () => {
                    controller.close();
                });
                downloadStream.on('error', (err: Error) => {
                    console.error("Error en el stream de descarga de GridFS:", err);
                    controller.error(err);
                });
            },
            cancel() {
                downloadStream.destroy();
            }
        });

        return new NextResponse(responseStream, { headers });

    } catch (error: unknown) {
        console.error('Error al servir el archivo desde GridFS:', error);
        let errorMessage = 'Error interno del servidor.';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return NextResponse.json({ message: 'Error interno del servidor.', error: errorMessage }, { status: 500 });
    }
}