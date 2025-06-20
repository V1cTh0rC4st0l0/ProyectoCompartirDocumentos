'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '@/styles/adminLayout.module.css';
import CreateUserModal from '@/components/CreateUserModal';
import UploadFilesModal from '@/components/UploadFilesModal';
import UploadViewerModal from '@/components/UploadViewerModal';
import { FiMenu, FiX } from 'react-icons/fi';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
    const [isUploadFilesModalOpen, setIsUploadFilesModalOpen] = useState(false);
    const [isUploadViewerModalOpen, setIsUploadViewerModalOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const openCreateUserModal = () => {
        setIsCreateUserModalOpen(true);
        setIsSidebarOpen(false);
    };

    const closeCreateUserModal = () => {
        setIsCreateUserModalOpen(false);
    };

    const openUploadFilesModal = () => {
        setIsUploadFilesModalOpen(true);
        setIsSidebarOpen(false);
    };

    const closeUploadFilesModal = () => {
        setIsUploadFilesModalOpen(false);
    };

    const openUploadViewerModal = () => {
        setIsUploadViewerModalOpen(true);
        setIsSidebarOpen(false);
    };

    const closeUploadViewerModal = () => {
        setIsUploadViewerModalOpen(false);
    };

    return (
        <div className={styles.dashboardLayoutContainer}>
            <button className={styles.menuButton} onClick={toggleSidebar}>
                {isSidebarOpen ? <FiX /> : <FiMenu />}
            </button>
            {isSidebarOpen && (
                <div className={styles.overlay + ' ' + styles.show} onClick={toggleSidebar}></div>
            )}

            <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.show : ''}`}>
                <h1 className={styles.sidebarTitle}>Raxvel</h1>
                <nav className={styles.sidebarNav}>
                    <Link href="/login" className={styles.sidebarLink} onClick={() => setIsSidebarOpen(false)}>
                        Salir
                    </Link>
                    <button onClick={openUploadFilesModal} className={styles.sidebarLink}>
                        Subir Archivos
                    </button>
                    <button onClick={openCreateUserModal} className={styles.sidebarLink}>
                        Crear Usuario
                    </button>
                    <button onClick={openUploadViewerModal} className={styles.sidebarLink}>
                        Subir Aplicación
                    </button>
                </nav>
            </aside>

            <main className={styles.mainContent}>{children}</main>
            {isCreateUserModalOpen && (
                <div className={styles.modalOverlay} onClick={closeCreateUserModal}>
                    <CreateUserModal onClose={closeCreateUserModal} />
                </div>
            )}
            {isUploadFilesModalOpen && (
                <div className={styles.modalOverlay} onClick={closeUploadFilesModal}>
                    <UploadFilesModal onClose={closeUploadFilesModal} />
                </div>
            )}
            {isUploadViewerModalOpen && (
                <div className={styles.modalOverlay} onClick={closeUploadViewerModal}>
                    <UploadViewerModal onClose={closeUploadViewerModal} />
                </div>
            )}
        </div>
    );
}