// app/api/file-groups/[groupId]/route.ts
'use server'; // Asegúrate de que esto esté presente para rutas de servidor en Next.js App Router

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
// Importa IFileGroupBase para tipar el resultado de .lean()
import FileGroupModel, { IFileGroupBase } from '@/models/FileGroup';
import ActivityLog from '@/models/ActivityLog';
import { getAuthenticatedUserFromToken } from '@/lib/auth';

// export const dynamic = 'force-dynamic'; // Esta línea es redundante con 'use server', puedes quitarla

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

        // --- INICIO: Verificación de autenticación y rol de administrador ---
        const authenticatedUser = await getAuthenticatedUserFromToken();
        const userId = authenticatedUser?.userId;
        const username = authenticatedUser?.username;
        const userRole = authenticatedUser?.rol;

        if (!userId || !username || userRole !== 'admin') {
            return NextResponse.json({ ok: false, message: 'No autorizado. Se requiere rol de administrador.' }, { status: 403 });
        }
        // --- FIN: Verificación de autenticación y rol de administrador ---

        const bucket = new GridFSBucket(db, {
            bucketName: 'uploads',
        });

        const objectId = new mongoose.Types.ObjectId(groupId);

        // CORRECCIÓN CLAVE: Tipado explícito para .lean() con IFileGroupBase
        const fileGroup: IFileGroupBase | null = await FileGroupModel.findById(objectId).lean<IFileGroupBase>();

        if (!fileGroup) {
            return NextResponse.json({ message: 'Grupo de archivos no encontrado.' }, { status: 404 });
        }

        // Eliminar los archivos de GridFS asociados al grupo
        // TypeScript ahora sabe que fileGroup.archivos es de tipo IArchivo[]
        if (fileGroup.archivos && fileGroup.archivos.length > 0) {
            await Promise.allSettled(fileGroup.archivos.map(async (file) => { // 'file' ahora está tipado
                try {
                    await bucket.delete(new mongoose.Types.ObjectId(file.fileId));
                    console.log(`Archivo GridFS ${file.fileId} eliminado como parte del grupo.`);
                } catch (gridFSError: unknown) {
                    console.warn(`Advertencia: No se pudo eliminar el archivo GridFS ${file.fileId} (posiblemente ya no existe):`, gridFSError);
                }
            }));
        }

        // Eliminar el documento del grupo de archivos de la base de datos
        await FileGroupModel.findByIdAndDelete(objectId);
        console.log(`Grupo de archivos con ID ${groupId} eliminado de la colección FileGroup.`);

        // --- INICIO: REGISTRAR EN EL HISTORIAL DE ACTIVIDAD ---
        await ActivityLog.create({
            userId: new mongoose.Types.ObjectId(userId),
            username: username,
            action: 'delete_group',
            targetType: 'fileGroup',
            targetId: objectId,
            details: {
                groupName: fileGroup.nombreGrupo, // TypeScript ahora reconoce .nombreGrupo
            },
            timestamp: new Date(),
        });
        // --- FIN: REGISTRAR EN EL HISTORIAL DE ACTIVIDAD ---

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
