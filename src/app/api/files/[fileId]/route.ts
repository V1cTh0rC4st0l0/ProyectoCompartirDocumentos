// /app/api/files/[fileId]/route.ts
'use server';

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';
import { GridFSBucket, GridFSFile } from 'mongodb';
import FileGroupModel, { IFileGroupBase } from '@/models/FileGroup';
import ActivityLog from '@/models/ActivityLog';
import { getAuthenticatedUserFromToken } from '@/lib/auth';

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

export async function DELETE(
    request: Request,
    { params }: { params: { fileId: string } }
) {
    const authenticatedUser = await getAuthenticatedUserFromToken();
    const userId = authenticatedUser?.userId;
    const username = authenticatedUser?.username;
    const userRole = authenticatedUser?.rol;

    if (!userId || !username || userRole !== 'admin') {
        return NextResponse.json({ ok: false, message: 'No autorizado. Se requiere rol de administrador.' }, { status: 403 });
    }

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
            return NextResponse.json({ message: 'Error interno del servidor: Base de database no disponible.' }, { status: 500 });
        }

        const bucket = new GridFSBucket(db, {
            bucketName: 'uploads',
        });

        const objectId = new mongoose.Types.ObjectId(fileId);

        const fileToDeleteDetails = await bucket.find({ _id: objectId }).toArray();
        if (fileToDeleteDetails.length === 0) {
            return NextResponse.json({ message: 'Archivo no encontrado en GridFS para eliminar.' }, { status: 404 });
        }
        const originalFileName = fileToDeleteDetails[0].filename;

        const fileGroup: IFileGroupBase | null = await FileGroupModel.findOne({
            'archivos.fileId': objectId
        }).lean<IFileGroupBase>();

        await bucket.delete(objectId);
        console.log(`Archivo con ID ${fileId} eliminado de GridFS.`);

        await FileGroupModel.updateMany(
            { 'archivos.fileId': objectId },
            { $pull: { archivos: { fileId: objectId } } }
        );
        console.log(`Referencia de archivo ${fileId} eliminada de FileGroup(s).`);

        await FileGroupModel.deleteMany({ archivos: { $size: 0 } });
        console.log('Grupos vacíos eliminados.');

        await ActivityLog.create({
            userId: new mongoose.Types.ObjectId(userId),
            username: username,
            action: 'delete_file',
            targetType: 'file',
            targetId: objectId,
            details: {
                fileName: originalFileName,
                groupName: fileGroup ? fileGroup.nombreGrupo : 'N/A',
            },
            timestamp: new Date(),
        });

        return NextResponse.json({ message: 'Archivo eliminado con éxito.' }, { status: 200 });

    } catch (error: unknown) {
        console.error('Error al eliminar el archivo:', error);
        let errorMessage = 'Error interno del servidor al eliminar el archivo.';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return NextResponse.json({ message: 'Error al eliminar el archivo.', error: errorMessage }, { status: 500 });
    }
}