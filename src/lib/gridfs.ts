// src/lib/gridfs.ts
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || '';

let gfsBucket: GridFSBucket;

export const connectGridFS = async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(MONGODB_URI);
    }

    if (!gfsBucket) {
        const db = mongoose.connection.db;
        gfsBucket = new mongoose.mongo.GridFSBucket(db!, {
            bucketName: 'uploads',
        });
    }

    return gfsBucket;
};
