// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { FiDownload, FiFile, FiFileText, FiSearch, FiSun, FiMoon } from 'react-icons/fi';
import { FaFilePdf, FaFileArchive } from 'react-icons/fa';
import styles from '@/styles/dashboard.module.css';
import FileGroupModal from '@/components/FileGroupModal';

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
};

export default function DashboardPage() {
    const [fileGroups, setFileGroups] = useState<FileGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<FileGroup | null>(null);
    const [userName, setUserName] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);

    const GROUP_FILE_DISPLAY_LIMIT = 2;

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const res = await axios.get('/api/file-groups/compartidos-conmigo', {
                    withCredentials: true,
                });

                const { userName, fileGroups } = res.data;

                setUserName(userName || '');
                if (Array.isArray(fileGroups)) {
                    setFileGroups(fileGroups.slice().reverse());
                } else {
                    console.warn('API returned unexpected data for file groups (not an array):', fileGroups);
                    setFileGroups([]);
                }

            } catch (err: unknown) {
                console.error('Error al cargar grupos de archivos', err);
                let errorMessage = 'No se pudieron cargar los archivos compartidos. Por favor, inténtalo de nuevo más tarde.';

                if (axios.isAxiosError(err)) {
                    if (err.response?.status === 401) {
                        errorMessage = 'Su sesión ha expirado o no está autenticado. Por favor, inicie sesión de nuevo.';
                        window.location.href = '/login';
                    } else if (err.response?.data?.message) {
                        errorMessage = err.response.data.message;
                    } else if (err.message) {
                        errorMessage = `Error: ${err.message}`;
                    }
                } else if (err instanceof Error) {
                    errorMessage = `Error: ${err.message}`;
                }

                setError(errorMessage);
                setFileGroups([]);
                setUserName('');
            } finally {
                setLoading(false);
            }
        };

        fetchGroups();
    }, []);

    const handleDownloadFile = (fileId: string) => {
        if (!fileId) {
            console.error('No se proporcionó un ID de archivo para descargar.');
            alert('Error: ID de archivo no disponible para descarga.');
            return;
        }
        window.location.href = `/api/files/${fileId}`;
    };

    const handleOpenModal = (group: FileGroup) => {
        setSelectedGroup(group);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedGroup(null);
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
        <div className={`${styles.dashboardContainer} ${isDarkMode ? styles.darkMode : ''}`}>
            <header className={styles.header}>
                <h1 className={styles.headerTitle}>¡Hola {userName || 'Doctor'}!</h1>
                <div className={styles.headerRight}>
                    <div className={styles.searchBar}>
                        <FiSearch className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={toggleDarkMode} className={styles.themeToggle}>
                        {isDarkMode ? <FiSun /> : <FiMoon />}
                    </button>
                </div>
            </header>

            {loading ? (
                <p className={styles.loadingMessage}>Cargando archivos...</p>
            ) : error ? (
                <p className={styles.errorMessage}>{error}</p>
            ) : fileGroups.length === 0 ? (
                <p className={styles.noFilesMessage}>No hay grupos de archivos compartidos con Usted.</p>
            ) : (
                fileGroups
                    .filter(group =>
                        group.nombreGrupo.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((group) => (
                        <div key={group._id} className={styles.fileGroup}>
                            <div className={styles.groupHeader}>
                                <h2 className={styles.groupTitle}>{group.nombreGrupo}</h2>
                            </div>
                            <div className={styles.filesGrid}>
                                {group.archivos.slice(0, GROUP_FILE_DISPLAY_LIMIT).map((file) => (
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
                                {group.archivos.length > GROUP_FILE_DISPLAY_LIMIT && (
                                    <div className={styles.viewMoreCard} onClick={() => handleOpenModal(group)}>
                                        <p className={styles.viewMoreText}>Ver {group.archivos.length - GROUP_FILE_DISPLAY_LIMIT} archivo(s) más</p>
                                        <p className={styles.viewMoreIcon}>+</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
            )}

            {isModalOpen && selectedGroup && (
                <FileGroupModal group={selectedGroup} onClose={handleCloseModal} />
            )}
        </div>
    );
}