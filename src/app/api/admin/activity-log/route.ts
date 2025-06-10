// app/api/admin/activity-log/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ActivityLog from '@/models/ActivityLog';

export async function GET(request: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = parseInt(searchParams.get('skip') || '0');

        const activityLogs = await ActivityLog.find()
            .sort({ timestamp: -1 })
            .limit(limit)
            .skip(skip);

        const totalLogs = await ActivityLog.countDocuments();

        return NextResponse.json({ activityLogs, totalLogs });
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        return NextResponse.json({ error: 'Failed to fetch activity logs' }, { status: 500 });
    }
};