// src/models/FileGroup.ts
import mongoose, { Document, Types } from 'mongoose';

export interface IArchivo {
    fileId: Types.ObjectId;
    nombreArchivo: string;
    tipoArchivo: string;
    ruta?: string;
}

export interface IFileGroupBase {
    nombreGrupo: string;
    archivos: IArchivo[];
    usuario: Types.ObjectId;
    compartidoCon: Types.ObjectId[];
    fechaCreacion: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IFileGroupDocument extends IFileGroupBase, Document { }

const archivoSchema = new mongoose.Schema<IArchivo>({
    fileId: { type: mongoose.Schema.Types.ObjectId, required: true },
    nombreArchivo: { type: String, required: true },
    tipoArchivo: { type: String, required: true },
    ruta: { type: String, required: false },
});

const fileGroupSchema = new mongoose.Schema<IFileGroupDocument>({
    nombreGrupo: { type: String, required: true },
    archivos: [archivoSchema],
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    compartidoCon: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    fechaCreacion: { type: Date, default: Date.now },
}, {
    timestamps: true
});

export default mongoose.models.FileGroup || mongoose.model<IFileGroupDocument>('FileGroup', fileGroupSchema);