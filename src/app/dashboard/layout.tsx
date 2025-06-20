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
            <button className={styles.menuButton} onClick={toggleSidebar}>
                {isSidebarOpen ? <FiX /> : <FiMenu />}
            </button>
            {isSidebarOpen && (
                <div className={styles.overlay + ' ' + styles.show} onClick={toggleSidebar}></div>
            )}

            <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.show : ''}`}>
                <h2 className={styles.sidebarTitle}>RAXVEL</h2>
                <ul className={styles.sidebarNav}>
                    <li>
                        <Link href="/login" className={styles.sidebarLink} onClick={() => setIsSidebarOpen(false)}>
                            Salir
                        </Link>
                    </li>
                    <li className="mt-6">
                        <DownloadViewerButton />
                    </li>
                </ul>
            </aside>
            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
}