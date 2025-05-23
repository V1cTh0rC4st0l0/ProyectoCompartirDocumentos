// /models/Collage.ts
import mongoose from 'mongoose';

const CollageSchema = new mongoose.Schema({
    _id: { type: String, default: 'default_collage' },
    imageUrls: { type: [String], default: [] },
    updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Collage || mongoose.model('Collage', CollageSchema);