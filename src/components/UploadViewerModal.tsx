// src/components/UploadViewerModal.tsx
'use client';

import { useState } from 'react';
import axios from 'axios';
import styles from '@/styles/adminLayout.module.css';

interface UploadViewerModalProps {
    onClose: () => void;
}

export default function UploadViewerModal({ onClose }: UploadViewerModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
            setMessage(null);
            setIsError(false);
        } else {
            setSelectedFile(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setMessage('Por favor, selecciona un archivo .exe para subir.');
            setIsError(true);
            return;
        }

        setUploading(true);
        setMessage('Subiendo archivo...');
        setIsError(false);

        const formData = new FormData();
        formData.append('viewerFile', selectedFile);

        try {
            const res = await axios.post('/api/upload-viewer', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (res.data.ok) {
                setMessage(`¡Éxito! ${res.data.message} ID: ${res.data.fileId}`);
                setIsError(false);
                setSelectedFile(null);
            } else {
                setMessage(`Error: ${res.data.message}`);
                setIsError(true);
            }
        } catch (error: unknown) {
            console.error('Error al subir el archivo:', error);

            let errorMessage = 'Error desconocido al subir el visor.';

            if (axios.isAxiosError(error)) {
                if (error.response?.data?.message) {
                    errorMessage = `Error al subir: ${error.response.data.message}`;
                } else if (error.message) {
                    errorMessage = `Error al subir: ${error.message}`;
                }
            } else if (error instanceof Error) {
                errorMessage = `Error al subir: ${error.message}`;
            }

            setMessage(errorMessage);
            setIsError(true)
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Subir Visor 3D</h2>
            <div className="p-4 border rounded shadow bg-white flex flex-col gap-3">
                <input
                    type="file"
                    accept=".exe,application/x-msdownload"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                />
                <button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    className={`w-full py-2 px-4 rounded font-semibold
                        ${!selectedFile || uploading ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                >
                    {uploading ? 'Subiendo...' : 'Subir Visor'}
                </button>
                {message && (
                    <p className={`mt-2 text-sm ${isError ? 'text-red-600' : 'text-green-600'}`}>
                        {message}
                    </p>
                )}
            </div>
            <button onClick={onClose} className={styles.closeButton}>
                X
            </button>
        </div>
    );
}