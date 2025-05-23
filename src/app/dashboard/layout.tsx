// src/app/dashboard/layout.tsx
import Link from 'next/link';
import DownloadViewerButton from '@/components/DownloadViewerButton'; // Importa el componente de descarga

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="flex min-h-screen">
            {/* Tu componente Sidebar */}
            <aside className="w-64 bg-gray-800 text-white p-4">
                <h2 className="text-xl font-bold mb-4">Usuario</h2>
                <ul className="space-y-2">
                    <li>
                        <Link href="/dashboard" className="block hover:underline">
                            Mis archivos
                        </Link>
                    </li>
                    <li>
                        <Link href="/dashboard/compartidos-conmigo" className="block hover:underline">
                            Compartidos conmigo
                        </Link>
                    </li>
                    {/* Aquí puedes añadir el botón de descarga del visor */}
                    <li className="mt-6"> {/* Agrega un poco de margen superior */}
                        <DownloadViewerButton />
                    </li>
                </ul>
            </aside>

            {/* El contenido de tu page.tsx se renderizará aquí */}
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}