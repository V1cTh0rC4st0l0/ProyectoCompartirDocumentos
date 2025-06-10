// src/models/User.ts
import mongoose, { Document, Schema } from 'mongoose';

// 1. Interfaz para la ESTRUCTURA DE DATOS BASE del Usuario (POJO)
// Esto es lo que .lean() te devolverá para un usuario
export interface IUserBase {
    email: string;
    username: string;
    password?: string; // La contraseña no siempre se expone, por eso opcional en base
    rol?: 'admin' | 'usuario'; // Puedes especificar roles
    // Si usas timestamps, considera añadir:
    // createdAt?: Date;
    // updatedAt?: Date;
}

// 2. Interfaz para el DOCUMENTO COMPLETO de Mongoose (para cuando NO usas .lean())
// Extiende IUserBase y Document de Mongoose
export interface IUserDocument extends IUserBase, Document {
    // Si tienes métodos de instancia, los declararías aquí
    // por ejemplo: comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUserDocument> = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: { type: String, required: true },
    rol: { type: String, default: 'usuario' },
}, {
    timestamps: true // Considera añadir esto si quieres createdAt/updatedAt
});

export default mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
