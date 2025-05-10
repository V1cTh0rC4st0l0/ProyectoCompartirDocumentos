'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';

type File = {
    _id: string;
    nombreArchivo: string;
    tipoArchivo: string;
};

type FileGroup = {
    _id: string;
    nombreGrupo: string;
    archivos: File[];
};

export default function DashboardPage() {
    const [fileGroups, setFileGroups] = useState<FileGroup[]>([]);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const res = await axios.get('/api/file-groups/mis-grupos');
                setFileGroups(res.data);
            } catch (error) {
                console.error('Error al cargar grupos de archivos', error);
            }
        };

        fetchGroups();
    }, []);

    const renderFileIcon = (file: File) => {
        if (file.tipoArchivo.startsWith('image/')) {
            return (
                <Image
                    src={`/api/files/${file._id}`}
                    alt={file.nombreArchivo}
                    width={100}
                    height={100}
                    className="rounded shadow"
                />
            );
        }

        if (file.tipoArchivo === 'application/pdf') {
            return <div className="text-4xl">📄</div>;
        }

        if (
            file.tipoArchivo === 'application/zip' ||
            file.tipoArchivo === 'application/x-zip-compressed'
        ) {
            return <div className="text-4xl">🗜️</div>;
        }

        return <div className="text-4xl">📁</div>;
    };

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 text-white p-4">
                <h2 className="text-xl font-bold mb-4">Usuario</h2>
                <ul className="space-y-2">
                    <li>
                        <Link href="/dashboard" className="block hover:underline">
                            Mis archivos
                        </Link>
                    </li>
                    {/* Puedes añadir más enlaces aquí si necesitas */}
                </ul>
            </aside>

            {/* Contenido principal */}
            <main className="flex-1 p-6 bg-gray-100">
                <h1 className="text-2xl font-bold mb-6">Archivos compartidos contigo</h1>
                {fileGroups.map((group) => (
                    <div key={group._id} className="mb-6 border p-4 rounded shadow bg-white">
                        <h2 className="text-lg font-semibold mb-2">{group.nombreGrupo}</h2>
                        <div className="flex flex-wrap gap-4">
                            {group.archivos.map((file) => (
                                <div
                                    key={file._id}
                                    className="w-[120px] text-center p-2 border rounded bg-gray-50 hover:bg-gray-100"
                                >
                                    <Link href={`/api/files/${file._id}`} target="_blank">
                                        {renderFileIcon(file)}
                                        <p className="text-sm mt-1 truncate">{file.nombreArchivo}</p>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
}
