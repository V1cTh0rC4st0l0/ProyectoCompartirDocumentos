'use client';

import { useState } from 'react';

export default function UploadPage() {
    const [files, setFiles] = useState<FileList | null>(null);
    const [nombreGrupo, setNombreGrupo] = useState('');
    const [usuarioId, setUsuarioId] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!files || !nombreGrupo || !usuarioId) {
            alert('Completa todos los campos');
            return;
        }

        const formData = new FormData();
        for (const file of Array.from(files)) {
            formData.append('archivos', file);
        }
        formData.append('nombreGrupo', nombreGrupo);
        formData.append('usuarioId', usuarioId);

        const res = await fetch('/api/file-groups/upload', {
            method: 'POST',
            body: formData,
        });

        const data = await res.json();
        alert(data.message || 'Respuesta del servidor');
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Subir Grupo de Archivos</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="text"
                    placeholder="Nombre del grupo"
                    value={nombreGrupo}
                    onChange={(e) => setNombreGrupo(e.target.value)}
                    className="border p-2"
                />

                <input
                    type="text"
                    placeholder="ID del usuario"
                    value={usuarioId}
                    onChange={(e) => setUsuarioId(e.target.value)}
                    className="border p-2"
                />

                <input
                    type="file"
                    multiple
                    onChange={(e) => setFiles(e.target.files)}
                    className="border p-2"
                />

                <button type="submit" className="bg-blue-500 text-white p-2 rounded">
                    Subir Archivos
                </button>
            </form>
        </div>
    );
}
