// src/models/User.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IUserBase {
    email: string;
    username: string;
    password?: string;
    rol?: 'admin' | 'usuario';
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IUserDocument extends IUserBase, Document {
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
    timestamps: true
});

export default mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
