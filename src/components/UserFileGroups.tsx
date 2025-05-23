// src/components/UserFileGroups.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

type FileData = {
    _id: string;
    nombreArchivo: string;
    tipoArchivo: string;
    url: string;
};

type FileGroup = {
    _id: string;
    nombre: string;
    archivos: FileData[];
};

export default function UserFileGroups({ usuarioId }: { usuarioId: string }) {
    const [grupos, setGrupos] = useState<FileGroup[]>([]);

    useEffect(() => {
        const fetchGrupos = async () => {
            try {
                const res = await fetch(`/api/file-groups/compartidos/${usuarioId}`);
                if (!res.ok) {
                    throw new Error(`Error HTTP: ${res.status}`);
                }
                const data = await res.json();
                if (Array.isArray(data)) {
                    setGrupos(data);
                } else {
                    console.error("Datos recibidos no son un array:", data);
                    setGrupos([]);
                }
            } catch (error) {
                console.error("Error al cargar grupos compartidos:", error);
                setGrupos([]);
            }
        };
        fetchGrupos();
    }, [usuarioId]);

    const renderIcon = (file: FileData) => {
        const tipo = file.tipoArchivo;

        if (tipo.startsWith('image/')) {
            return (

                <Image
                    src={file.url}
                    alt={file.nombreArchivo}
                    width={96}
                    height={96}
                    className="object-cover rounded shadow"
                />
            );
        }

        if (tipo === 'application/pdf') return <span role="img" aria-label="PDF icon">📄</span>;
        if (tipo.includes('zip') || tipo.includes('rar')) return <span role="img" aria-label="Archive icon">📦</span>;
        if (file.nombreArchivo.endsWith('.dcm')) return <span role="img" aria-label="DCM icon">🧪</span>;
        if (file.nombreArchivo.endsWith('.xml')) return <span role="img" aria-label="XML icon">📁</span>;

        return <span role="img" aria-label="File icon">📎</span>;
    };

    return (
        <div className="space-y-6">
            {grupos.map((grupo) => (
                <div key={grupo._id} className="border rounded p-4 shadow">
                    <h2 className="text-xl font-semibold mb-3">{grupo.nombre}</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {grupo.archivos.map((archivo) => (
                            <div
                                key={archivo._id}
                                className="flex flex-col items-center text-center"
                            >
                                {renderIcon(archivo)}
                                <p className="mt-2 text-sm">{archivo.nombreArchivo}</p>
                                <a
                                    href={archivo.url}
                                    download
                                    className="text-blue-600 hover:underline text-xs mt-1"
                                >
                                    Descargar
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}