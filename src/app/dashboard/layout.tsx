// src/app/dashboard/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '@/styles/adminLayout.module.css';
import DownloadViewerButton from '@/components/DownloadViewerButton';
import { FiMenu, FiX } from 'react-icons/fi';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

    return (
        <div className={styles.dashboardLayoutContainer}>
            {/* Botón de menú para móviles */}
            <button className={styles.menuButton} onClick={toggleSidebar}>
                {isSidebarOpen ? <FiX /> : <FiMenu />}
            </button>

            {/* Overlay para cuando el sidebar está abierto en móvil */}
            {isSidebarOpen && (
                <div className={styles.overlay + ' ' + styles.show} onClick={toggleSidebar}></div>
            )}

            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.show : ''}`}>
                <h2 className={styles.sidebarTitle}>Usuario</h2>
                <ul className={styles.sidebarNav}>
                    <li>
                        <Link href="/login" className={styles.sidebarLink} onClick={() => setIsSidebarOpen(false)}>
                            Salir
                        </Link>
                    </li>
                    <li className="mt-6"> {/* Puedes dejar esta clase de Tailwind o moverla al CSS Module si lo prefieres */}
                        <DownloadViewerButton />
                    </li>
                </ul>
            </aside>

            {/* El contenido de tu page.tsx se renderizará aquí */}
            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
}