// src/models/FileGroup.ts
import mongoose, { Document, Types } from 'mongoose'; // Importa Types para ObjectId

// Interfaz para la estructura de un archivo dentro de un grupo
export interface IArchivo {
    fileId: Types.ObjectId; // Usa Types.ObjectId
    nombreArchivo: string;
    tipoArchivo: string;
    ruta?: string; // Opcional
}

// 1. Interfaz para la ESTRUCTURA DE DATOS BASE del FileGroup (POJO)
// Esto es lo que .lean() te devolverá.
export interface IFileGroupBase {
    nombreGrupo: string;
    archivos: IArchivo[];
    usuario: Types.ObjectId; // El ID del usuario que creó el grupo
    compartidoCon: Types.ObjectId[]; // IDs de los usuarios con los que se comparte
    fechaCreacion: Date;
    // Si usas timestamps: true en el esquema, también puedes añadir
    // createdAt?: Date;
    // updatedAt?: Date;
}

// 2. Interfaz para el DOCUMENTO COMPLETO de Mongoose (para cuando NO usas .lean())
// Extiende IFileGroupBase y Document de Mongoose
export interface IFileGroupDocument extends IFileGroupBase, Document { }

const archivoSchema = new mongoose.Schema<IArchivo>({
    fileId: { type: mongoose.Schema.Types.ObjectId, required: true },
    nombreArchivo: { type: String, required: true },
    tipoArchivo: { type: String, required: true },
    ruta: { type: String, required: false }, // Asegúrate de que sea 'required: false'
});

// El esquema usa IFileGroupDocument, porque representa el documento Mongoose completo
const fileGroupSchema = new mongoose.Schema<IFileGroupDocument>({
    nombreGrupo: { type: String, required: true },
    archivos: [archivoSchema],
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    compartidoCon: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    fechaCreacion: { type: Date, default: Date.now },
}, {
    timestamps: true // Si esto está activo, considera añadir createdAt/updatedAt en IFileGroupBase
});

// Exporta el modelo con el tipo de documento completo
export default mongoose.models.FileGroup || mongoose.model<IFileGroupDocument>('FileGroup', fileGroupSchema);