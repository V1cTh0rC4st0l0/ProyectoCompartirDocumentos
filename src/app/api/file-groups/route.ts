// src/app/api/file-groups/route.ts
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { connectDB } from '@/lib/mongodb';
import FileGroupModel, { IFileGroup, IArchivo } from '@/models/FileGroup';
import mongoose from 'mongoose';

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        await fs.mkdir(uploadDir, { recursive: true });

        const formData = await req.formData();

        const nombreGrupo = formData.get('nombreGrupo') as string | null;
        const usuarioId = formData.get('usuarioId') as string | null;
        const uploadedFiles = formData.getAll('archivos');

        const archivosArray: File[] = uploadedFiles.filter(item => item instanceof File) as File[];

        if (!nombreGrupo || archivosArray.length === 0) {
            return NextResponse.json({ error: 'Faltan datos o no se subieron archivos.' }, { status: 400 });
        }

        const fileDocs: Omit<IArchivo, 'fileId'>[] = [];

        for (const file of archivosArray) {
            const originalFilename = file.name;
            const mimetype = file.type || 'application/octet-stream';
            const uniqueFilename = `${Date.now()}-${originalFilename}`;
            const filePath = path.join(uploadDir, uniqueFilename);
            const buffer = await file.arrayBuffer();

            await fs.writeFile(filePath, Buffer.from(buffer));

            fileDocs.push({
                nombreArchivo: originalFilename,
                tipoArchivo: mimetype,
                ruta: `/uploads/${uniqueFilename}`,
            });
        }

        const nuevoGrupo: IFileGroup = await FileGroupModel.create({
            nombreGrupo,
            archivos: fileDocs.map(doc => ({
                ...doc,
                fileId: new mongoose.Types.ObjectId(),
            })),
            usuario: usuarioId ? new mongoose.Types.ObjectId(usuarioId) : undefined,
            fechaCreacion: new Date(),
        });

        return NextResponse.json({ success: true, grupo: nuevoGrupo });

    } catch (error: unknown) {
        console.error('Error en la ruta de subida de archivos:', error);
        let errorMessage = 'Error interno del servidor al procesar la solicitud.';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
            errorMessage = (error as { message: string }).message;
        }
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}