// src/app/admin/components/UserFileDetailsModalContent.tsx
import React from 'react';
import Image from 'next/image';
import { FiDownload, FiFile, FiFileText, FiTrash2 } from 'react-icons/fi';
import { FaFilePdf, FaFileArchive } from 'react-icons/fa';
import styles from '@/styles/dashboardadmin.module.css';

type FileData = {
    fileId: string;
    nombreArchivo: string;
    tipoArchivo: string;
    ruta?: string;
};

type FileGroup = {
    _id: string;
    nombreGrupo: string;
    archivos: FileData[];
    creadoEn?: string;
};

type User = {
    _id: string;
    username: string;
    email: string;
    sharedFileGroups?: FileGroup[];
};

interface UserFileDetailsModalContentProps {
    user: User;
    handleDownloadGroup: (groupId: string) => void;
    handleDownloadFile: (fileId: string) => void;
    handleDeleteGroup: (groupId: string, userId: string) => void;
    handleDeleteFile: (fileId: string, groupId: string, userId: string) => void;
}

const UserFileDetailsModalContent: React.FC<UserFileDetailsModalContentProps> = ({
    user,
    handleDownloadGroup,
    handleDownloadFile,
    handleDeleteGroup,
    handleDeleteFile,
}) => {
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
            return <FaFilePdf className="text-5xl text-red-500 mx-auto" />;
        }
        if (
            file.tipoArchivo === 'application/zip' ||
            file.tipoArchivo === 'application/x-zip-compressed' ||
            file.tipoArchivo === 'application/x-rar-compressed' ||
            file.tipoArchivo === 'application/gzip'
        ) {
            return <FaFileArchive className="text-5xl text-orange-500 mx-auto" />;
        }
        if (file.tipoArchivo.startsWith('text/')) {
            return <FiFileText className="text-5xl text-blue-500 mx-auto" />;
        }
        if (file.tipoArchivo.startsWith('video/')) {
            return <div className="text-4xl mx-auto">🎬</div>;
        }
        if (file.tipoArchivo.startsWith('audio/')) {
            return <div className="text-4xl mx-auto">🎵</div>;
        }
        return <FiFile className="text-5xl text-gray-500 mx-auto" />;
    };

    return (
        <div>
            <h2 className={styles.modalTitle}>Archivos compartidos con {user.username}</h2>

            {user.sharedFileGroups && user.sharedFileGroups.length > 0 ? (
                <div className={styles.modalFilesContainer}>
                    {user.sharedFileGroups.map((group) => (
                        <div key={group._id} className={styles.modalFileGroup}>
                            <div className={styles.modalGroupHeader}>
                                <h3 className={styles.modalGroupTitle}>{group.nombreGrupo}</h3>
                                <div className={styles.groupActions}>
                                    <button
                                        onClick={() => handleDownloadGroup(group._id)}
                                        className={styles.downloadGroupButton}
                                    >
                                        <FiDownload className="mr-1" /> Descargar todo
                                    </button>
                                    <button
                                        onClick={() => handleDeleteGroup(group._id, user._id)}
                                        className={styles.deleteGroupButton}
                                    >
                                        <FiTrash2 className="mr-1" /> Eliminar Grupo
                                    </button>
                                </div>
                            </div>
                            <div className={styles.modalFilesGrid}>
                                {group.archivos.map((file) => (
                                    <div key={file.fileId} className={styles.modalFileCard}>
                                        <div className={styles.modalFileIconContainer}>
                                            {renderFileIcon(file)}
                                        </div>
                                        <p className={styles.modalFileName}>{file.nombreArchivo}</p>
                                        <div className={styles.fileActions}>
                                            <button
                                                onClick={() => handleDownloadFile(file.fileId)}
                                                className={styles.downloadFileButton}
                                            >
                                                <FiDownload className="mr-1" /> Descargar
                                            </button>
                                            <button
                                                onClick={() => handleDeleteFile(file.fileId, group._id, user._id)}
                                                className={styles.deleteFileButton}
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-600 mt-4">No hay archivos compartidos con este usuario.</p>
            )}
        </div>
    );
};

export default UserFileDetailsModalContent;