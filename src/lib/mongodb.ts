// src/lib/mongodb.ts
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || ''

if (!MONGODB_URI) throw new Error('MONGODB_URI no está definido')

export const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return

    return mongoose.connect(MONGODB_URI)
}