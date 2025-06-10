// src/app/api/file-groups/upload/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Readable } from 'stream';
import FileGroupModel, { IArchivo } from '@/models/FileGroup';
import ActivityLog from '@/models/ActivityLog';
import User from '@/models/User';
import mongoose from 'mongoose';
import { getAuthenticatedUserFromToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

type LogDetailType = {
    fileName: string;
    groupName: string;
    sharedWithUsernames?: string;
    addedToExistingGroup?: boolean;
};

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const authenticatedUser = await getAuthenticatedUserFromToken();
        const uploaderId = authenticatedUser?.userId;
        const uploaderUsername = authenticatedUser?.username;

        if (!uploaderId || !uploaderUsername) {
            return NextResponse.json({ ok: false, message: 'No autorizado. Se requiere autenticación.' }, { status: 401 });
        }

        const db = mongoose.connection.db;
        if (!db) {
            console.error('Error: La instancia de la base de datos no está disponible.');
            return NextResponse.json({ ok: false, message: 'Error interno del servidor: Base de datos no disponible.' }, { status: 500 });
        }

        const formData = await req.formData();
        const nombreGrupo = formData.get('nombreGrupo') as string;
        const compartidoConRaw = formData.getAll('compartidoCon');
        const compartidoCon = compartidoConRaw
            .filter((id: FormDataEntryValue): id is string => typeof id === 'string' && mongoose.Types.ObjectId.isValid(id))
            .map(id => new mongoose.Types.ObjectId(id));

        if (!nombreGrupo) {
            return NextResponse.json({ ok: false, message: 'Falta el nombre del grupo' }, { status: 400 });
        }

        let sharedWithUsernames: string[] = [];
        if (compartidoCon.length > 0) {
            const sharedUsers = await User.find({ _id: { $in: compartidoCon } }).select('username');
            sharedWithUsernames = sharedUsers.map(u => u.username);
        }

        const archivos = formData.getAll('archivos') as File[];
        if (!archivos.length) {
            return NextResponse.json({ ok: false, message: 'No se subieron archivos' }, { status: 400 });
        }

        const bucket = new mongoose.mongo.GridFSBucket(db, {
            bucketName: 'uploads',
        });

        const archivosGuardados: IArchivo[] = [];
        const uploadedFileNames: string[] = [];

        for (const archivo of archivos) {
            const bytes = await archivo.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const stream = Readable.from(buffer);
            await new Promise<void>((resolve, reject) => {
                const uploadStream = bucket.openUploadStream(archivo.name, {
                    contentType: archivo.type,
                    metadata: {
                        usuarioId: uploaderId,
                        nombreGrupo,
                    },
                });

                stream.pipe(uploadStream)
                    .on('error', (err: Error) => {
                        console.error(`Error al subir el archivo ${archivo.name}:`, err);
                        reject(err);
                    })
                    .on('finish', () => {
                        const fileIdStr = uploadStream.id?.toString?.();
                        if (!fileIdStr) {
                            return reject(new Error('ID de archivo no disponible'));
                        }

                        archivosGuardados.push({
                            fileId: uploadStream.id,
                            nombreArchivo: archivo.name,
                            tipoArchivo: archivo.type,
                            ruta: `/api/files/${fileIdStr}`,
                        });
                        uploadedFileNames.push(archivo.name);
                        resolve();
                    });
            });
        }

        let newFileGroup: typeof FileGroupModel | null = null;
        let logTargetId: mongoose.Types.ObjectId | undefined;
        const logDetails: LogDetailType = {
            fileName: uploadedFileNames.join(', '),
            groupName: nombreGrupo,
        };

        const grupoExistente = await FileGroupModel.findOne({
            nombreGrupo: nombreGrupo,
            usuario: new mongoose.Types.ObjectId(uploaderId),
            compartidoCon: { $all: compartidoCon, $size: compartidoCon.length }
        });

        if (grupoExistente) {
            grupoExistente.archivos.push(...archivosGuardados);
            await grupoExistente.save();
            newFileGroup = grupoExistente;
            logTargetId = grupoExistente._id;
            logDetails.addedToExistingGroup = true;
        } else {
            const grupo = await FileGroupModel.create({
                nombreGrupo: nombreGrupo,
                usuario: new mongoose.Types.ObjectId(uploaderId),
                archivos: archivosGuardados,
                compartidoCon,
                fechaCreacion: new Date(),
            });

            newFileGroup = grupo;
            logTargetId = grupo._id;

            if (compartidoCon.length > 0) {
                logDetails.sharedWithUsernames = sharedWithUsernames.join(', ');
            }
        }

        if (newFileGroup) {
            await ActivityLog.create({
                userId: new mongoose.Types.ObjectId(uploaderId),
                username: uploaderUsername,
                action: 'upload',
                targetType: 'fileGroup',
                targetId: logTargetId,
                details: logDetails,
                timestamp: new Date(),
            });
        }

        return NextResponse.json({ ok: true, message: 'Archivos subidos y grupo gestionado', grupo: newFileGroup });

    } catch (error: unknown) {
        console.error('Error en la ruta de subida de archivos:', error);
        let errorMessage = 'Error interno del servidor al procesar la solicitud.';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
            errorMessage = (error as { message: string }).message;
        }
        return NextResponse.json({ ok: false, message: errorMessage }, { status: 500 });
    }
}
