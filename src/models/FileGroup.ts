import mongoose from 'mongoose'

const fileSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    nombreArchivo: String,
    tipoArchivo: String,
    ruta: String,
});

const fileGroupSchema = new mongoose.Schema({
    nombreGrupo: { type: String, required: true },
    archivos: [fileSchema],
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    compartidoCon: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    creadoEn: { type: Date, default: Date.now },
})

export default mongoose.models.FileGroup || mongoose.model('FileGroup', fileGroupSchema)
