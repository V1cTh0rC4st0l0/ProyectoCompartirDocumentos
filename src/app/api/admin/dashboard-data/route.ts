// app/api/admin/dashboard-data/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import FileGroupModel from '@/models/FileGroup'; // Importa el modelo de FileGroup

export async function GET() {
    try {
        await connectDB();

        const users = await User.find().select('username _id');
        const usersWithSharedGroups = await Promise.all(
            users.map(async (user) => {
                const sharedGroups = await FileGroupModel.find({ usuario: user._id }).populate('archivos'); // Ajusta la consulta según tu modelo
                return { ...user.toObject(), sharedFileGroups: sharedGroups };
            })
        );

        return NextResponse.json({ users: usersWithSharedGroups });
    } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 });
    }
}