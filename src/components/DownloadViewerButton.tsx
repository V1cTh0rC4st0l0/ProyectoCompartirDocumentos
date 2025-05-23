// src/components/DownloadViewerButton.tsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiDownload } from 'react-icons/fi';

export default function DownloadViewerButton() {
    const [viewerInfo, setViewerInfo] = useState<{ fileId: string; fileName: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchViewerInfo = async () => {
            try {
                const res = await axios.get('/api/viewer-info');
                if (res.data.ok) {
                    setViewerInfo({ fileId: res.data.fileId, fileName: res.data.fileName });
                } else {
                    setError(res.data.message || 'No se pudo obtener la información del visor.');
                }
            } catch (err: unknown) {
                console.error('Error fetching viewer info:', err);
                setError('Error al cargar la información del visor.');
            } finally {
                setLoading(false);
            }
        };
        fetchViewerInfo();
    }, []);

    const handleDownload = () => {
        if (viewerInfo && viewerInfo.fileId) {
            window.location.href = `/api/files/${viewerInfo.fileId}`;
        } else {
            alert('El visor no está disponible para descarga en este momento.');
        }
    };

    if (loading) {
        return <button disabled className="bg-gray-300 text-gray-600 px-4 py-2 rounded flex items-center text-sm cursor-not-allowed">Cargando Visor...</button>;
    }

    if (error) {
        return <p className="text-red-600 text-sm">{error}</p>;
    }

    if (!viewerInfo) {
        return <p className="text-gray-600 text-sm">Visor no disponible.</p>;
    }

    return (
        <button
            onClick={handleDownload}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center text-sm mt-4"
        >
            <FiDownload className="mr-2" /> Descargar {viewerInfo.fileName.replace('.exe', '') || 'Visor 3D'}
        </button>
    );
}