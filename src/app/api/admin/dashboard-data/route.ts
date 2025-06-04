// app/api/admin/dashboard-data/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import FileGroupModel from '@/models/FileGroup';

export async function GET() {
    try {
        await connectDB();

        // Obtener todos los usuarios
        const users = await User.find().select('username _id email');

        // Mapear usuarios con sus grupos compartidos
        const usersWithSharedGroups = await Promise.all(
            users.map(async (user) => {
                const sharedGroups = await FileGroupModel.find({ usuario: user._id })
                    .populate('archivos')
                    .sort({ fechaCreacion: -1 }); // Ordenar por fechaCreacion descendente para facilitar encontrar la última fecha

                // Asegúrate de que 'creadoEn' en el frontend coincide con 'fechaCreacion' del modelo
                const formattedGroups = sharedGroups.map(group => ({
                    ...group.toObject(),
                    creadoEn: group.fechaCreacion ? group.fechaCreacion.toISOString() : undefined // Convertir a ISO string
                }));

                return { ...user.toObject(), sharedFileGroups: formattedGroups };
            })
        );

        // La API solo devuelve la lista de usuarios con sus grupos
        return NextResponse.json({ users: usersWithSharedGroups });

    } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 });
    }
};