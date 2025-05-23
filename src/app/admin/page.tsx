// src/app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import UserList from './components/UserList';
import Image from 'next/image';
import { FiDownload, FiFile, FiFileText } from 'react-icons/fi';
import { FaFilePdf, FaFileArchive } from 'react-icons/fa';

import styles from '@/styles/dashboard.module.css';

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

export default function AdminDashboard() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/dashboard-data');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setUsers(Array.isArray(data.users) ? data.users : []);
      } catch (err: unknown) {
        console.error('Error fetching admin data:', err);
        setError('Error al cargar los datos del administrador. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  // --- CORRECCIÓN CLAVE AQUÍ ---
  const filteredUsers = users.filter((user) => {
    // Si la barra de búsqueda está vacía, muestra todos los usuarios
    if (!search) {
      return true;
    }

    // Comprobar si el usuario existe y si sus propiedades son strings antes de usar toLowerCase
    const username = user?.username || ''; // Si user.username es undefined/null, usa un string vacío
    const email = user?.email || '';     // Si user.email es undefined/null, usa un string vacío

    const lowerCaseSearch = search.toLowerCase();

    return (
      username.toLowerCase().includes(lowerCaseSearch) ||
      email.toLowerCase().includes(lowerCaseSearch)
    );
  });
  // --- FIN DE LA CORRECCIÓN CLAVE ---


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
    <div className={styles.dashboardContainer}>
      <h1 className={styles.title}>Panel de Administración</h1>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar usuarios por nombre o email..."
          className="w-full px-4 py-2 border rounded shadow"
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
        <div className="space-y-8">
          {filteredUsers.map((user) => (
            <div key={user._id} className={styles.fileGroup}>
              <div className={styles.groupHeader}>
                <h2 className={styles.groupTitle}>Archivos compartidos con {user.username}</h2>
              </div>

              {user.sharedFileGroups && user.sharedFileGroups.length > 0 ? (
                user.sharedFileGroups.map((group) => (
                  <div key={group._id} className={styles.fileGroup} style={{ border: 'none', boxShadow: 'none', padding: '0', marginBottom: '1rem' }}>
                    <div className={styles.groupHeader} style={{ marginBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                      <h3 className="text-md font-medium text-gray-700">{group.nombreGrupo}</h3>
                      <button
                        onClick={() => handleDownloadGroup(group._id)}
                        className={styles.downloadGroupButton}
                        style={{ padding: '00.35rem 0.75rem', fontSize: '0.8rem' }}
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

      <div className="mt-8">
        <h2 className={styles.title} style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Gestión de Usuarios</h2>
        <UserList />
      </div>
    </div>
  );
}