'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '@/styles/adminLayout.module.css';
import CreateUserModal from '@/components/CreateUserModal';
import UploadFilesModal from '@/components/UploadFilesModal';
import UploadViewerModal from '@/components/UploadViewerModal';

import {
    FiMenu,
    FiX,
    FiLogOut,
    FiUpload,
    FiUserPlus,
    FiPackage
} from 'react-icons/fi';

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

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className={styles.container}>

            {/* BOTÓN MOBILE */}
            <button className={styles.menuButton} onClick={toggleSidebar}>
                {isSidebarOpen ? <FiX /> : <FiMenu />}
            </button>

            {isSidebarOpen && (
                <div className={styles.overlay} onClick={toggleSidebar}></div>
            )}

            {/* SIDEBAR */}
            <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.show : ''}`}>

                {/* LOGO */}
                <div className={styles.logoContainer}>
                    <Image
                        src="/images/Raxvel_log.png"
                        alt="logo"
                        width={70}
                        height={70}
                        priority
                    />
                    <h2>Raxvel</h2>
                </div>

                {/* NAV */}
                <nav className={styles.nav}>

                    <Link href="/login" className={styles.link}>
                        <FiLogOut /> Salir
                    </Link>

                    <button
                        onClick={() => setIsUploadFilesModalOpen(true)}
                        className={styles.link}
                    >
                        <FiUpload /> Subir Archivos
                    </button>

                    <button
                        onClick={() => setIsCreateUserModalOpen(true)}
                        className={styles.link}
                    >
                        <FiUserPlus /> Crear Usuario
                    </button>

                    <button
                        onClick={() => setIsUploadViewerModalOpen(true)}
                        className={styles.link}
                    >
                        <FiPackage /> Subir Aplicación
                    </button>

                </nav>
            </aside>

            {/* CONTENIDO */}
            <main className={styles.main}>
                {children}
            </main>

            {/* MODALES */}
            {isCreateUserModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsCreateUserModalOpen(false)}>
                    <CreateUserModal onClose={() => setIsCreateUserModalOpen(false)} />
                </div>
            )}

            {isUploadFilesModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsUploadFilesModalOpen(false)}>
                    <UploadFilesModal onClose={() => setIsUploadFilesModalOpen(false)} />
                </div>
            )}

            {isUploadViewerModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsUploadViewerModalOpen(false)}>
                    <UploadViewerModal onClose={() => setIsUploadViewerModalOpen(false)} />
                </div>
            )}
        </div>
    );
}