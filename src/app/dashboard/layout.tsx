'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '@/styles/adminLayout.module.css';
import DownloadViewerButton from '@/components/DownloadViewerButton';

import { FiMenu, FiX, FiLogOut, } from 'react-icons/fi';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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

                    <div className={styles.link}>
                        <DownloadViewerButton />
                    </div>

                </nav>
            </aside>

            {/* MAIN */}
            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
}