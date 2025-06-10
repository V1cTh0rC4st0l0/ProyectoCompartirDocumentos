// src/models/ActivityLog.ts
import mongoose, { Document, Schema } from 'mongoose';

interface IActivityLogDetails {
    fileName?: string;
    groupName?: string;
    sharedWithUsernames?: string;
    isNewGroup?: boolean;
    oldValue?: unknown;
    newValue?: unknown;
}

export interface IActivityLog extends Document {
    userId: mongoose.Types.ObjectId;
    username: string;
    action: 'upload' | 'share' | 'delete_file' | 'delete_group' | 'update_user' | 'login' | 'logout';
    targetType: 'file' | 'fileGroup' | 'user';
    targetId?: mongoose.Types.ObjectId;
    details: IActivityLogDetails;
    timestamp: Date;
}

const ActivityLogSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    action: { type: String, required: true },
    targetType: { type: String, required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: false },
    details: {
        fileName: { type: String },
        groupName: { type: String },
        sharedWithUsernames: { type: String },
        isNewGroup: { type: Boolean },
        oldValue: { type: mongoose.Schema.Types.Mixed },
        newValue: { type: mongoose.Schema.Types.Mixed },
    },
    timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);