import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rol: { type: String, default: 'usuario' },
})

export default mongoose.models.User || mongoose.model('User', UserSchema)