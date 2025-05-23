import mongoose from 'mongoose';

const archivoSchema = new mongoose.Schema({
    fileId: { type: mongoose.Schema.Types.ObjectId, required: true },
    nombreArchivo: { type: String, required: true },
    tipoArchivo: { type: String, required: true },
});

const fileGroupSchema = new mongoose.Schema({
    nombreGrupo: { type: String, required: true },
    archivos: [archivoSchema],
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    compartidoCon: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    fechaCreacion: { type: Date, default: Date.now },
});

export default mongoose.models.FileGroup || mongoose.model('FileGroup', fileGroupSchema);
