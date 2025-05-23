// src/models/FileGroup.ts
import mongoose, { Document } from 'mongoose';

export interface IArchivo {
    fileId: mongoose.Types.ObjectId;
    nombreArchivo: string;
    tipoArchivo: string;
    ruta: string;
}
export interface IFileGroup extends Document {
    nombreGrupo: string;
    archivos: IArchivo[];
    usuario: mongoose.Types.ObjectId;
    compartidoCon: mongoose.Types.ObjectId[];
    fechaCreacion: Date;
}

const archivoSchema = new mongoose.Schema<IArchivo>({
    fileId: { type: mongoose.Schema.Types.ObjectId, required: true },
    nombreArchivo: { type: String, required: true },
    tipoArchivo: { type: String, required: true },
    ruta: { type: String, required: true },
});

const fileGroupSchema = new mongoose.Schema<IFileGroup>({
    nombreGrupo: { type: String, required: true },
    archivos: [archivoSchema],
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    compartidoCon: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    fechaCreacion: { type: Date, default: Date.now },
});

export default mongoose.models.FileGroup || mongoose.model<IFileGroup>('FileGroup', fileGroupSchema);