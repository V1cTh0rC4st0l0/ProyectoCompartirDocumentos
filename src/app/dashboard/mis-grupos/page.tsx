// src/app/(dashboard)/mis-grupos/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FileText, FileArchive, File } from 'lucide-react';

interface Archivo {
    _id: string;
    nombreArchivo: string;
    tipoArchivo: string;
}

interface Grupo {
    _id: string;
    nombreGrupo: string;
    archivos: Archivo[];
}

export default function MisGruposPage() {
    const [grupos, setGrupos] = useState<Grupo[]>([]);

    useEffect(() => {
        fetch('/api/file-groups/mis-grupos')
            .then((res) => res.json())
            .then(setGrupos);
    }, []);

    const renderArchivo = (archivo: Archivo) => {
        const ext = archivo.tipoArchivo.split('/')[1];

        if (archivo.tipoArchivo.startsWith('image/')) {
            return (
                <a href={`/api/files/${archivo._id}`} download className="hover:opacity-80 transition">
                    <Image
                        src={`/api/files/${archivo._id}`}
                        alt={archivo.nombreArchivo}
                        width={100}
                        height={100}
                        className="object-cover border rounded"
                    />
                </a>
            );
        }

        const icon =
            archivo.tipoArchivo === 'application/pdf' ? <FileText size={32} /> :
                archivo.tipoArchivo.includes('zip') || archivo.tipoArchivo.includes('rar') ? <FileArchive size={32} /> :
                    <File size={32} />;

        return (
            <a
                href={`/api/files/${archivo._id}`}
                download
                className="flex flex-col items-center gap-1 hover:opacity-80 transition"
            >
                {icon}
                <span className="text-sm text-center">{archivo.nombreArchivo}</span>
            </a>
        );
    };

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-xl font-bold">Mis Grupos de Archivos</h1>
            {grupos.map((grupo) => (
                <div key={grupo._id} className="border rounded-lg p-4 shadow">
                    <h2 className="text-lg font-semibold mb-2">{grupo.nombreGrupo}</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {grupo.archivos.map((archivo) => (
                            <div key={archivo._id} className="flex flex-col items-center">
                                {renderArchivo(archivo)}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
