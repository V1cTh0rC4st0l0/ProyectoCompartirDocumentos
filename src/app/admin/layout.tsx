// /app/admin/layout.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import styles from '@/styles/adminLayout.module.css';
import PanelDeOpciones from '@/components/PanelDeOpciones';
import ImageCollage from '@/components/ImageCollage';
import CreateUserModal from '@/components/CreateUserModal';
import UploadFilesModal from '@/components/UploadFilesModal';
import UploadViewerModal from '@/components/UploadViewerModal';
import DownloadViewerButton from '@/components/DownloadViewerButton';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isCollageModalOpen, setIsCollageModalOpen] = useState(false);
    const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
    const [isUploadFilesModalOpen, setIsUploadFilesModalOpen] = useState(false);
    const [isUploadViewerModalOpen, setIsUploadViewerModalOpen] = useState(false);

    const openPanel = () => {
        setIsPanelOpen(true);
    };

    const closePanel = () => {
        setIsPanelOpen(false);
    };

    const openCollageModal = () => {
        setIsCollageModalOpen(true);
    };

    const closeCollageModal = () => {
        setIsCollageModalOpen(false);
    };

    const openCreateUserModal = () => {
        setIsCreateUserModalOpen(true);
    };

    const closeCreateUserModal = () => {
        setIsCreateUserModalOpen(false);
    };

    const openUploadFilesModal = () => {
        setIsUploadFilesModalOpen(true);
    };

    const closeUploadFilesModal = () => {
        setIsUploadFilesModalOpen(false);
    };

    const openUploadViewerModal = () => {
        setIsUploadViewerModalOpen(true);
    };

    const closeUploadViewerModal = () => {
        setIsUploadViewerModalOpen(false);
    };

    return (
        <div className={styles.adminLayoutContainer}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <h1 className={styles.sidebarTitle}>Panel Admin</h1>
                <nav className={styles.sidebarNav}>
                    <Link href="/login" className={styles.sidebarLink}>
                        Salir
                    </Link>
                    <button onClick={openUploadFilesModal} className={styles.sidebarLink}>
                        Subir Archivos
                    </button>
                    <button onClick={openCreateUserModal} className={styles.sidebarLink}>
                        Crear Usuario
                    </button>
                    <button onClick={openCollageModal} className={styles.sidebarLink}>
                        Editar Collage
                    </button>
                    <button onClick={openPanel} className={styles.sidebarLink}>
                        Opciones Extra
                    </button>
                    <button onClick={openUploadViewerModal} className={styles.sidebarLink}>
                        Subir Visor 3D
                    </button>
                    {/*
                    <div className={styles.sidebarLink + ' mt-2'}>
                        <DownloadViewerButton />
                    </div>
                    */}
                </nav>
            </aside>

            {/* Contenido principal */}
            <main className={styles.mainContent}>{children}</main>

            {/* Panel modal (opciones extra) */}
            {isPanelOpen && (
                <div className={styles.modalOverlay} onClick={closePanel}>
                    <PanelDeOpciones onClose={closePanel} />
                </div>
            )}
            {/* Modal del Image Collage */}
            {isCollageModalOpen && (
                <div className={styles.modalOverlay} onClick={closeCollageModal}>
                    <ImageCollage isOpen={isCollageModalOpen} onClose={closeCollageModal} />
                </div>
            )}
            {/* Modal para Crear Usuario */}
            {isCreateUserModalOpen && (
                <div className={styles.modalOverlay} onClick={closeCreateUserModal}>
                    <CreateUserModal onClose={closeCreateUserModal} />
                </div>
            )}
            {/* Modal para Subir Archivos */}
            {isUploadFilesModalOpen && (
                <div className={styles.modalOverlay} onClick={closeUploadFilesModal}>
                    <UploadFilesModal onClose={closeUploadFilesModal} />
                </div>
            )}

            {/* NUEVO MODAL PARA SUBIR EL VISOR */}
            {isUploadViewerModalOpen && (
                <div className={styles.modalOverlay} onClick={closeUploadViewerModal}>
                    <UploadViewerModal onClose={closeUploadViewerModal} />
                </div>
            )}
        </div>
    );
}