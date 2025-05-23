// /app/api/file-groups/download/[groupId]/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import FileGroupModel from '@/models/FileGroup'; // Tu modelo de FileGroup
import archiver from 'archiver';
import { Readable } from 'stream';
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

export async function GET(
    request: Request,
    { params }: { params: { groupId: string } }
) {
    // *** CAMBIO AQUÍ: await params antes de desestructurar ***
    const awaitedParams = await params;
    const { groupId } = awaitedParams;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
        return NextResponse.json({ message: 'ID de grupo inválido.' }, { status: 400 });
    }

    try {
        await connectDB();
        const db = mongoose.connection.db;

        const fileGroup = await FileGroupModel.findById(groupId);

        if (!fileGroup) {
            return NextResponse.json({ message: 'Grupo de archivos no encontrado.' }, { status: 404 });
        }

        const bucket = new GridFSBucket(db, {
            bucketName: 'uploads',
        });

        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        const responseStream = new ReadableStream({
            start(controller) {
                archive.on('data', (chunk) => {
                    controller.enqueue(chunk);
                });
                archive.on('end', () => {
                    controller.close();
                });
                archive.on('error', (err) => {
                    console.error("Error en el stream de archiver:", err);
                    controller.error(err);
                });

                if (fileGroup.archivos && fileGroup.archivos.length > 0) {
                    fileGroup.archivos.forEach(fileMeta => {
                        const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileMeta.fileId));
                        archive.append(downloadStream, { name: fileMeta.nombreArchivo });
                    });
                }
                archive.finalize();
            },
            cancel() {
                archive.destroy();
            }
        });

        const headers = new Headers();
        headers.set('Content-Type', 'application/zip');
        headers.set('Content-Disposition', `attachment; filename="${fileGroup.nombreGrupo}.zip"`);

        return new NextResponse(responseStream, { headers });

    } catch (error: any) {
        console.error('Error al descargar grupo de archivos desde GridFS:', error);
        return NextResponse.json({ message: 'Error al descargar grupo de archivos', error: error.message }, { status: 500 });
    }
}