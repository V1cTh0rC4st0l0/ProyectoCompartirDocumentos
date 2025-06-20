// src/components/FileGroupModal.tsx
'use client';

import { FiDownload, FiFile, FiFileText } from 'react-icons/fi';
import { FaFilePdf, FaFileArchive } from 'react-icons/fa';
import Image from 'next/image';
import { AiOutlineClose } from 'react-icons/ai';
import styles from '@/styles/fileGroupModal.module.css';

type FileData = {
    fileId: string;
    nombreArchivo: string;
    tipoArchivo: string;
    ruta?: string;
};

type FileGroupModalProps = {
    group: {
        _id: string;
        nombreGrupo: string;
        archivos: FileData[];
    };
    onClose: () => void;
};

const renderFileIcon = (file: FileData) => {
    if (file.tipoArchivo.startsWith('image/')) {
        return (
            <Image
                src={file.fileId ? `/api/files/${file.fileId}` : '/placeholder-image.png'}
                alt={file.nombreArchivo}
                width={100}
                height={100}
                className={styles.iconImage}
            />
        );
    }

    if (file.tipoArchivo === 'application/pdf') {
        return <FaFilePdf className={styles.iconPdf} />;
    }

    if (
        file.tipoArchivo === 'application/zip' ||
        file.tipoArchivo === 'application/x-zip-compressed' ||
        file.tipoArchivo === 'application/x-rar-compressed' ||
        file.tipoArchivo === 'application/gzip'
    ) {
        return <FaFileArchive className={styles.iconArchive} />;
    }

    if (file.tipoArchivo.startsWith('text/')) {
        return <FiFileText className={styles.iconText} />;
    }
    if (file.tipoArchivo.startsWith('video/')) {
        return <div className={styles.iconEmoji}>🎬</div>;
    }
    if (file.tipoArchivo.startsWith('audio/')) {
        return <div className={styles.iconEmoji}>🎵</div>;
    }

    return <FiFile className={styles.iconDefault} />;
};


export default function FileGroupModal({ group, onClose }: FileGroupModalProps) {
    const handleDownloadFile = (fileId: string) => {
        if (!fileId) {
            console.error('No se proporcionó un ID de archivo para descargar.');
            alert('Error: ID de archivo no disponible para descarga.');
            return;
        }
        window.location.href = `/api/files/${fileId}`;
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>
                    <AiOutlineClose />
                </button>
                <h2 className={styles.modalTitle}>{group.nombreGrupo}</h2>
                <div className={styles.modalHeaderActions}>
                </div>

                <div className={styles.filesGrid}>
                    {group.archivos.map((file) => (
                        <div
                            key={file.fileId}
                            className={styles.fileCard}
                        >
                            <div className={styles.fileIconContainer}>
                                {renderFileIcon(file)}
                            </div>
                            <p className={styles.fileName}>{file.nombreArchivo}</p>
                            <button
                                onClick={() => handleDownloadFile(file.fileId)}
                                className={styles.downloadFileButton}
                            >
                                <FiDownload className="mr-1" /> Descargar
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}