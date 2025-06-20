// app/api/file-groups/[groupId]/route.ts
'use server';

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import FileGroupModel, { IFileGroupBase } from '@/models/FileGroup';
import ActivityLog from '@/models/ActivityLog';
import { getAuthenticatedUserFromToken } from '@/lib/auth';

export async function DELETE(
    request: Request,
    { params }: { params: { groupId: string } }
) {
    const awaitedParams = await params;
    const { groupId } = awaitedParams;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
        return NextResponse.json({ message: 'ID de grupo inválido.' }, { status: 400 });
    }

    try {
        await connectDB();
        const db = mongoose.connection.db;

        if (!db) {
            console.error('Error: La instancia de la base de datos no está disponible.');
            return NextResponse.json({ message: 'Error interno del servidor: Base de datos no disponible.' }, { status: 500 });
        }

        const authenticatedUser = await getAuthenticatedUserFromToken();
        const userId = authenticatedUser?.userId;
        const username = authenticatedUser?.username;
        const userRole = authenticatedUser?.rol;

        if (!userId || !username || userRole !== 'admin') {
            return NextResponse.json({ ok: false, message: 'No autorizado. Se requiere rol de administrador.' }, { status: 403 });
        }

        const bucket = new GridFSBucket(db, {
            bucketName: 'uploads',
        });

        const objectId = new mongoose.Types.ObjectId(groupId);

        const fileGroup: IFileGroupBase | null = await FileGroupModel.findById(objectId).lean<IFileGroupBase>();

        if (!fileGroup) {
            return NextResponse.json({ message: 'Grupo de archivos no encontrado.' }, { status: 404 });
        }

        if (fileGroup.archivos && fileGroup.archivos.length > 0) {
            await Promise.allSettled(fileGroup.archivos.map(async (file) => {
                try {
                    await bucket.delete(new mongoose.Types.ObjectId(file.fileId));
                    console.log(`Archivo GridFS ${file.fileId} eliminado como parte del grupo.`);
                } catch (gridFSError: unknown) {
                    console.warn(`Advertencia: No se pudo eliminar el archivo GridFS ${file.fileId} (posiblemente ya no existe):`, gridFSError);
                }
            }));
        }

        await FileGroupModel.findByIdAndDelete(objectId);
        console.log(`Grupo de archivos con ID ${groupId} eliminado de la colección FileGroup.`);

        await ActivityLog.create({
            userId: new mongoose.Types.ObjectId(userId),
            username: username,
            action: 'delete_group',
            targetType: 'fileGroup',
            targetId: objectId,
            details: {
                groupName: fileGroup.nombreGrupo,
            },
            timestamp: new Date(),
        });

        return NextResponse.json({ message: 'Grupo de archivos y sus contenidos eliminados con éxito.' }, { status: 200 });

    } catch (error: unknown) {
        console.error('Error al eliminar el grupo de archivos:', error);
        let errorMessage = 'Error interno del servidor al eliminar el grupo de archivos.';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return NextResponse.json({ message: 'Error al eliminar el grupo de archivos.', error: errorMessage }, { status: 500 });
    }
}
