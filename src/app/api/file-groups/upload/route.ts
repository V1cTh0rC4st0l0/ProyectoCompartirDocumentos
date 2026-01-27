import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import FileGroupModel, { IArchivo } from '@/models/FileGroup';
import ActivityLog from '@/models/ActivityLog';
import User from '@/models/User';
import mongoose from 'mongoose';
import { getAuthenticatedUserFromToken } from '@/lib/auth';
import busboy from 'busboy';
import { Readable } from 'stream';

export const dynamic = 'force-dynamic';

type LogDetailType = {
    fileName: string;
    groupName: string;
    sharedWithUsernames?: string;
    addedToExistingGroup?: boolean;
};

// Helper: Convert Web Stream to Node Stream if needed (for Next.js App Router)
function toNodeReadable(webStream: ReadableStream<Uint8Array>): Readable {
    // @ts-expect-error - Mismatch between DOM ReadableStream and Node ReadableStream types
    return Readable.fromWeb(webStream);
}

export async function POST(req: NextRequest) {
    console.log('[DEBUG] POST request received');
    try {
        console.log('[DEBUG] Connecting to DB...');
        await connectDB();
        console.log('[DEBUG] DB Connected');

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

        const contentType = req.headers.get('content-type') || '';
        console.log('[DEBUG] Content-Type:', contentType);

        if (!contentType.includes('multipart/form-data')) {
            return NextResponse.json({ ok: false, message: `Content-Type inválido. Recibido: ${contentType}` }, { status: 400 });
        }

        const bb = busboy({ headers: { 'content-type': contentType } });

        const archivosGuardados: IArchivo[] = [];
        const uploadedFileNames: string[] = [];
        let nombreGrupo = '';
        const compartidoCon: mongoose.Types.ObjectId[] = [];
        let sharedWithUsernames: string[] = [];

        const fileUploadPromises: Promise<void>[] = [];

        console.log('[DEBUG] Starting busboy extraction');

        // Promise to handle the busboy stream processing
        const processUpload = new Promise<void>((resolve, reject) => {
            const bucket = new mongoose.mongo.GridFSBucket(db, {
                bucketName: 'uploads',
            });

            bb.on('file', (name, file, info) => {
                console.log(`[DEBUG] Busboy File: ${name}, ${info.filename}`);
                const { filename, mimeType } = info;

                const uploadStream = bucket.openUploadStream(filename, {
                    contentType: mimeType,
                    metadata: {
                        usuarioId: uploaderId,
                        usuarioIdString: uploaderId.toString()
                    },
                });

                const filePromise = new Promise<void>((resolveFile, rejectFile) => {
                    file.pipe(uploadStream)
                        .on('error', (error) => {
                            console.error(`[DEBUG] Error uploading ${filename}:`, error);
                            rejectFile(error);
                        })
                        .on('finish', () => {
                            console.log(`[DEBUG] File finished: ${filename}`);
                            const fileIdStr = uploadStream.id?.toString?.();
                            if (fileIdStr) {
                                archivosGuardados.push({
                                    fileId: uploadStream.id,
                                    nombreArchivo: filename,
                                    tipoArchivo: mimeType,
                                    ruta: `/api/files/${fileIdStr}`,
                                });
                                uploadedFileNames.push(filename);
                            }
                            resolveFile();
                        });
                });

                fileUploadPromises.push(filePromise);
            });

            bb.on('field', (name, val) => {
                console.log(`[DEBUG] Busboy Field: ${name}=${val}`);
                if (name === 'nombreGrupo') {
                    nombreGrupo = val;
                } else if (name === 'compartidoCon') {
                    // Handle multiple values or single value
                    if (mongoose.Types.ObjectId.isValid(val)) {
                        compartidoCon.push(new mongoose.Types.ObjectId(val));
                    }
                }
            });

            bb.on('close', async () => {
                console.log('[DEBUG] Busboy Close - Waiting for file uploads');
                try {
                    await Promise.all(fileUploadPromises);
                    console.log('[DEBUG] All files uploaded successfully');
                    resolve();
                } catch (err) {
                    console.error('[DEBUG] Error waiting for files:', err);
                    reject(err);
                }
            });

            bb.on('error', (err) => {
                console.error('[DEBUG] Busboy Error:', err);
                reject(err);
            });

            // Pipe the request body to busboy
            if (req.body) {
                const stream = toNodeReadable(req.body);
                stream.pipe(bb);
            } else {
                reject(new Error('No request body found'));
            }
        });

        await processUpload;

        console.log(`[DEBUG] Processing complete. Group: ${nombreGrupo}, Files: ${archivosGuardados.length}`);

        if (!nombreGrupo) {
            // Clean up uploaded files if group name is missing? 
            return NextResponse.json({ ok: false, message: 'Falta el nombre del grupo (nombreGrupo)' }, { status: 400 });
        }

        if (archivosGuardados.length === 0) {
            return NextResponse.json({ ok: false, message: 'No se subieron archivos (0 files gathered)' }, { status: 400 });
        }

        // Post-processing: resolving usernames and creating DB entries
        if (compartidoCon.length > 0) {
            const sharedUsers = await User.find({ _id: { $in: compartidoCon } }).select('username');
            sharedWithUsernames = sharedUsers.map(u => u.username);
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
        console.error('Error en la ruta de subida de archivos (stream):', error);
        let errorMessage = 'Error interno del servidor al procesar la solicitud.';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
            errorMessage = (error as { message: string }).message;
        }
        return NextResponse.json({ ok: false, message: errorMessage }, { status: 500 });
    }
}
