import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Readable } from 'stream';
import FileGroupModel from '@/models/FileGroup';
import { GridFSBucket } from 'mongodb';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic'; // Soporta multipart/form-data en Next.js

export async function POST(req: NextRequest) {
    await connectDB();

    const formData = await req.formData();

    const nombreGrupo = formData.get('nombreGrupo') as string;
    const usuarioId = formData.get('usuarioId') as string;

    if (!nombreGrupo || !usuarioId) {
        return NextResponse.json({ ok: false, message: 'Faltan datos requeridos' }, { status: 400 });
    }

    const archivos = formData.getAll('archivos') as File[];

    if (!archivos.length) {
        return NextResponse.json({ ok: false, message: 'No se subieron archivos' }, { status: 400 });
    }

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db!, {
        bucketName: 'uploads',
    });

    const archivosGuardados: any[] = [];

    for (const archivo of archivos) {
        const bytes = await archivo.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const stream = Readable.from(buffer);

        const uploadStream = bucket.openUploadStream(archivo.name, {
            contentType: archivo.type,
            metadata: {
                usuarioId,
                nombreGrupo,
            },
        });

        await new Promise((resolve, reject) => {
            stream.pipe(uploadStream)
                .on('error', reject)
                .on('finish', () => {
                    archivosGuardados.push({
                        fileId: uploadStream.id,
                        nombreArchivo: archivo.name,
                        tipoArchivo: archivo.type,
                    });
                    resolve(true);
                });
        });
    }

    const grupo = await FileGroupModel.create({
        nombre: nombreGrupo,
        usuario: usuarioId,
        archivos: archivosGuardados,
        fechaCreacion: new Date(),
    });

    return NextResponse.json({ ok: true, message: 'Archivos subidos correctamente', grupo });
}
