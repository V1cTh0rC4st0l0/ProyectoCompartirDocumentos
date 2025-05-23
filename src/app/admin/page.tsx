// src/app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link'; // Aunque no lo uses directamente en el renderizado, puede ser útil.
import { useRouter } from 'next/navigation';
import UserList from './components/UserList'; // Mantén el componente UserList
import Image from 'next/image'; // Para renderizar miniaturas de imágenes

// Importa iconos de React-Icons
import { FiDownload, FiFile, FiImage, FiFileText } from 'react-icons/fi';
import { FaFilePdf, FaFileArchive } from 'react-icons/fa';

// Importa los estilos CSS Module desde el archivo de dashboard
import styles from '@/styles/dashboard.module.css'; // Usamos los mismos estilos del dashboard de usuario

// Define la estructura del usuario, incluyendo los grupos de archivos compartidos
type File = {
  fileId: string;
  nombreArchivo: string;
  tipoArchivo: string;
};

type FileGroup = {
  _id: string;
  nombreGrupo: string;
  archivos: File[];
  creadoEn: string; // Puede que necesites este campo o no, depende de tu API
};

type User = {
  _id: string;
  username: string;
  email: string; // Asumiendo que también querrás el email
  sharedFileGroups: FileGroup[]; // Usa la misma estructura de FileGroup
};

export default function AdminDashboard() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Asumiendo que esta API te devuelve los usuarios con sus sharedFileGroups cargados
        const res = await fetch('/api/admin/dashboard-data');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        // Asegúrate de que 'data.users' contenga la estructura esperada
        setUsers(data.users || []);
      } catch (err: any) {
        console.error('Error fetching admin data:', err);
        setError('Error al cargar los datos del administrador. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase()) // Buscar también por email
  );

  // Función para renderizar el icono del archivo (copiada de dashboard/page.tsx)
  const renderFileIcon = (file: File) => {
    if (file.tipoArchivo.startsWith('image/')) {
      return (
        <Image
          src={file.fileId ? `/api/files/${file.fileId}` : '/placeholder-image.png'}
          alt={file.nombreArchivo}
          width={100}
          height={100}
          className={styles.iconImage} // Aplicar clase CSS para la imagen
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

  // Funciones de descarga (similares a dashboard/page.tsx)
  const handleDownloadGroup = (groupId: string) => {
    if (!groupId) {
      console.error('No se proporcionó un ID de grupo para descargar.');
      alert('Error: ID de grupo no disponible.');
      return;
    }
    window.location.href = `/api/file-groups/download/${groupId}`;
  };

  const handleDownloadFile = (fileId: string) => {
    if (!fileId) {
      console.error('No se proporcionó un ID de archivo para descargar.');
      alert('Error: ID de archivo no disponible para descarga.');
      return;
    }
    window.location.href = `/api/files/${fileId}`;
  };


  return (
    <div className={styles.dashboardContainer}> {/* Usa la clase del contenedor principal del dashboard */}
      <h1 className={styles.title}>Panel de Administración</h1>

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar usuarios por nombre o email..."
          className="w-full px-4 py-2 border rounded shadow" // Mantén clases de Tailwind aquí si no tienes una clase específica en dashboard.module.css
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p className={styles.loadingMessage}>Cargando datos de usuarios...</p>
      ) : error ? (
        <p className={styles.errorMessage}>{error}</p>
      ) : filteredUsers.length === 0 ? (
        <p className={styles.noFilesMessage}>No se encontraron usuarios que coincidan con la búsqueda.</p>
      ) : (
        <div className="space-y-8"> {/* Agrega espacio entre las secciones de usuario */}
          {filteredUsers.map((user) => (
            <div key={user._id} className={styles.fileGroup}> {/* Reutiliza la clase fileGroup para la tarjeta de usuario */}
              <div className={styles.groupHeader}>
                <h2 className={styles.groupTitle}>Archivos compartidos con {user.username}</h2>
                {/* Opcional: Podrías añadir un botón para ver todos los archivos de este usuario si fueran muchos */}
              </div>

              {user.sharedFileGroups && user.sharedFileGroups.length > 0 ? (
                user.sharedFileGroups.map((group) => (
                  <div key={group._id} className={styles.fileGroup} style={{ border: 'none', boxShadow: 'none', padding: '0', marginBottom: '1rem' }}> {/* Sub-grupo, sin borde ni sombra externa */}
                    <div className={styles.groupHeader} style={{ marginBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}> {/* Borde inferior para separar */}
                      <h3 className="text-md font-medium text-gray-700">{group.nombreGrupo}</h3> {/* Un h3 para los nombres de grupo */}
                      <button
                        onClick={() => handleDownloadGroup(group._id)}
                        className={styles.downloadGroupButton}
                        style={{ padding: '00.35rem 0.75rem', fontSize: '0.8rem' }} // Hacer el botón un poco más pequeño para sub-grupos
                      >
                        <FiDownload className="mr-1" /> Descargar Grupo
                      </button>
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
                ))
              ) : (
                <p className="text-gray-600 mt-2">No hay grupos de archivos compartidos directamente con este usuario.</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Sección de UserList */}
      <div className="mt-8"> {/* Espacio superior para separar */}
        <h2 className={styles.title} style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Gestión de Usuarios</h2>
        <UserList />
      </div>
    </div>
  );
}