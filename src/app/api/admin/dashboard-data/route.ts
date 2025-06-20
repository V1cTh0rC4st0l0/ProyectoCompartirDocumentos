// src/app/api/admin/dashboard-data/route.ts
'use server';

import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import FileGroupModel from '@/models/FileGroup';
import { NextResponse } from 'next/server';
import { getAuthenticatedUserFromToken } from '@/lib/auth';

export async function GET() {
    try {
        await connectDB();

        const authenticatedUser = await getAuthenticatedUserFromToken();
        if (!authenticatedUser || authenticatedUser.rol !== 'admin') {
            return NextResponse.json({ ok: false, message: 'No autorizado. Se requiere rol de administrador.' }, { status: 403 });
        }

        const users = await User.find({}).lean();

        const usersWithFileData = await Promise.all(
            users.map(async (user) => {
                const createdFileGroups = await FileGroupModel.find({ usuario: user._id })
                    .populate('archivos')
                    .sort({ fechaCreacion: -1 })
                    .lean();

                const sharedFileGroups = await FileGroupModel.find({ compartidoCon: user._id })
                    .populate('archivos')
                    .sort({ fechaCreacion: -1 })
                    .lean();

                let totalFilesSharedByThisUser = 0;
                createdFileGroups.forEach(group => {
                    if (group.compartidoCon && group.compartidoCon.length > 0) {
                        totalFilesSharedByThisUser += group.archivos.length;
                    }
                });

                let totalFilesSharedWithThisUser = 0;
                sharedFileGroups.forEach(group => {
                    totalFilesSharedWithThisUser += group.archivos.length;
                });

                let lastActivityDate: Date | null = null;
                createdFileGroups.forEach(group => {
                    if (group.fechaCreacion && (!lastActivityDate || group.fechaCreacion > lastActivityDate)) {
                        lastActivityDate = group.fechaCreacion;
                    }
                });
                sharedFileGroups.forEach(group => {
                    if (group.fechaCreacion && (!lastActivityDate || group.fechaCreacion > lastActivityDate)) {
                        lastActivityDate = group.fechaCreacion;
                    }
                });

                return {
                    ...user,
                    createdFileGroups: createdFileGroups,
                    sharedFileGroups: sharedFileGroups,
                    totalFilesSharedByThisUser: totalFilesSharedByThisUser,
                    totalFilesSharedWithThisUser: totalFilesSharedWithThisUser,
                    lastActivityDate: lastActivityDate ? (lastActivityDate as Date).toISOString() : null,
                };
            })
        );

        usersWithFileData.sort((a, b) => {
            const dateA = a.lastActivityDate ? new Date(a.lastActivityDate).getTime() : 0;
            const dateB = b.lastActivityDate ? new Date(b.lastActivityDate).getTime() : 0;
            return dateB - dateA;
        });


        return NextResponse.json({ ok: true, users: usersWithFileData }, { status: 200 });

    } catch (error: unknown) {
        console.error('Error al obtener datos del dashboard de administrador:', error);
        let errorMessage = 'Error interno del servidor.';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return NextResponse.json({ ok: false, message: errorMessage }, { status: 500 });
    }
}