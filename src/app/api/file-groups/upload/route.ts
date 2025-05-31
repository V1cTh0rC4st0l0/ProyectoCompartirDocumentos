// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Readable } from 'stream';
import FileGroupModel, { IArchivo } from '@/models/FileGroup';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const db = mongoose.connection.db;
        if (!db) {
            console.error('Error: La instancia de la base de datos no está disponible.');
            return NextResponse.json({ ok: false, message: 'Error interno del servidor: Base de datos no disponible.' }, { status: 500 });
        }

        const formData = await req.formData();

        const nombreGrupo = formData.get('nombreGrupo') as string;
        const usuarioId = formData.get('usuarioId') as string;

        const compartidoConRaw = formData.getAll('compartidoCon');
        const compartidoCon = compartidoConRaw
            .filter(id => typeof id === 'string' && mongoose.Types.ObjectId.isValid(id))
            .map(id => new mongoose.Types.ObjectId(id.toString()));

        if (!nombreGrupo || !usuarioId) {
            return NextResponse.json({ ok: false, message: 'Faltan datos requeridos (nombreGrupo o usuarioId)' }, { status: 400 });
        }

        const archivos = formData.getAll('archivos') as File[];

        if (!archivos.length) {
            return NextResponse.json({ ok: false, message: 'No se subieron archivos' }, { status: 400 });
        }

        const bucket = new mongoose.mongo.GridFSBucket(db, {
            bucketName: 'uploads',
        });

        const archivosGuardados: IArchivo[] = [];

        for (const archivo of archivos) {
            const bytes = await archivo.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const stream = Readable.from(buffer);

            await new Promise<void>((resolve, reject) => {
                const uploadStream = bucket.openUploadStream(archivo.name, {
                    contentType: archivo.type,
                    metadata: {
                        usuarioId,
                        nombreGrupo,
                    },
                });

                stream.pipe(uploadStream)
                    .on('error', (err: Error) => {
                        console.error(`Error al subir el archivo ${archivo.name}:`, err);
                        reject(err);
                    })
                    .on('finish', () => {
                        const fileIdStr = uploadStream.id?.toString?.(); // por seguridad
                        if (!fileIdStr) {
                            return reject(new Error('ID de archivo no disponible'));
                        }

                        archivosGuardados.push({
                            fileId: uploadStream.id,
                            nombreArchivo: archivo.name,
                            tipoArchivo: archivo.type,
                            ruta: `/api/files/${fileIdStr}`,
                        });
                        resolve();
                    });
            });
        }

        // 🔍 Verificar si ya existe un grupo con el mismo nombre, usuario y destinatarios
        const grupoExistente = await FileGroupModel.findOne({
            nombreGrupo: nombreGrupo,
            usuario: new mongoose.Types.ObjectId(usuarioId),
            compartidoCon: { $all: compartidoCon, $size: compartidoCon.length }
        });

        if (grupoExistente) {
            grupoExistente.archivos.push(...archivosGuardados);
            await grupoExistente.save();

            return NextResponse.json({ ok: true, message: 'Archivos añadidos al grupo existente', grupo: grupoExistente });
        }

        // 🆕 Si no existe, crear un nuevo grupo
        const grupo = await FileGroupModel.create({
            nombreGrupo: nombreGrupo,
            usuario: new mongoose.Types.ObjectId(usuarioId),
            archivos: archivosGuardados,
            compartidoCon,
            fechaCreacion: new Date(),
        });

        return NextResponse.json({ ok: true, message: 'Archivos subidos y nuevo grupo creado', grupo });

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
