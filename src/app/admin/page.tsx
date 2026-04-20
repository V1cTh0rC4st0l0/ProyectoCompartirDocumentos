'use client';

import { useState, useEffect } from 'react';
import UserList from './components/UserList';
import UserFileDetailsModalContent from './components/UserFileDetailsModalContent';
import { FiSearch, FiEdit, FiMoon, FiSun } from 'react-icons/fi';
import styles from '@/styles/dashboardadmin.module.css';
import ActivityLogCard from './components/ActivityLogCard';

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
  createdFileGroups?: FileGroup[];
  sharedFileGroups?: FileGroup[];
  totalFilesSharedByThisUser?: number;
  totalFilesSharedWithThisUser?: number;
  lastActivityDate?: string | null;
};

export default function AdminDashboard() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 🔥 NUEVO: control de pestañas
  const [activeTab, setActiveTab] = useState<'files' | 'users' | 'activity'>('files');

  const refreshAdminData = async () => {
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
      setError('Error al cargar los datos del administrador.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAdminData();
  }, []);

  const filteredUsers = users.filter((user) => {
    if (!search) return true;
    const lower = search.toLowerCase();
    return (
      user.username?.toLowerCase().includes(lower) ||
      user.email?.toLowerCase().includes(lower)
    );
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const dateA = a.lastActivityDate ? new Date(a.lastActivityDate).getTime() : 0;
    const dateB = b.lastActivityDate ? new Date(b.lastActivityDate).getTime() : 0;
    return dateB - dateA;
  });

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleDownloadGroup = (groupId: string) => {
    window.location.href = `/api/file-groups/download/${groupId}`;
  };

  const handleDownloadFile = (fileId: string) => {
    window.location.href = `/api/files/${fileId}`;
  };

  const openModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteGroup = async (groupId: string, userId: string) => {
    if (!confirm('¿Seguro que quieres eliminar este grupo?')) return;

    try {
      const res = await fetch(`/api/file-groups/${groupId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Error al eliminar grupo');
      }

      // actualizar estado
      setUsers(prev =>
        prev.map(user => {
          if (user._id === userId) {
            return {
              ...user,
              sharedFileGroups: user.sharedFileGroups?.filter(
                g => g._id !== groupId
              ),
            };
          }
          return user;
        })
      );

      alert('Grupo eliminado');
      refreshAdminData();

    } catch (err) {
      console.error(err);
      alert('Error al eliminar grupo');
    }
  };

  const handleDeleteFile = async (fileId: string, groupId: string, userId: string) => {
    if (!confirm('¿Seguro que quieres eliminar este archivo?')) return;

    try {
      const res = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Error al eliminar archivo');
      }

      // actualizar estado
      setUsers(prev =>
        prev.map(user => {
          if (user._id === userId) {
            return {
              ...user,
              sharedFileGroups: user.sharedFileGroups?.map(group => {
                if (group._id === groupId) {
                  return {
                    ...group,
                    archivos: group.archivos.filter(f => f.fileId !== fileId),
                  };
                }
                return group;
              }),
            };
          }
          return user;
        })
      );

      alert('Archivo eliminado');
      refreshAdminData();

    } catch (err) {
      console.error(err);
      alert('Error al eliminar archivo');
    }
  };

  return (
    <div className={`${styles.dashboardContainer} ${isDarkMode ? styles.darkMode : ''}`}>
      <main className={styles.mainContent}>

        {/* 🔷 HEADER */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1>Panel Administrador</h1>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.searchBar}>
              <FiSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Buscar..."
                className={styles.searchInput}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button onClick={toggleDarkMode} className={styles.themeToggle}>
              {isDarkMode ? <FiSun /> : <FiMoon />}
            </button>
          </div>
        </header>

        {/* 🔥 TABS */}
        <div className={styles.tabs}>
          <button
            className={activeTab === 'files' ? styles.activeTab : ''}
            onClick={() => setActiveTab('files')}
          >
            Archivos
          </button>

          <button
            className={activeTab === 'users' ? styles.activeTab : ''}
            onClick={() => setActiveTab('users')}
          >
            Usuarios
          </button>

          <button
            className={activeTab === 'activity' ? styles.activeTab : ''}
            onClick={() => setActiveTab('activity')}
          >
            Actividad
          </button>
        </div>

        {/* 🔥 CONTENIDO */}
        <div className={styles.tabContent}>

          {/* 📁 ARCHIVOS */}
          {activeTab === 'files' && (
            <section className={styles.userFilesSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Archivos Compartidos</h2>
                <span>{users.length} Usuarios</span>
              </div>

              {loading ? (
                <p className={styles.loadingMessage}>Cargando...</p>
              ) : error ? (
                <p className={styles.errorMessage}>{error}</p>
              ) : (
                <div className={styles.userTableContainer}>
                  <table className={styles.userTable}>
                    <thead>
                      <tr>
                        <th>Usuario</th>
                        <th>Grupos</th>
                        <th>Última actividad</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedUsers.map((user) => (
                        <tr key={user._id}>
                          <td>{user.username}</td>
                          <td>{user.sharedFileGroups?.length || 0}</td>
                          <td>
                            {user.lastActivityDate
                              ? new Date(user.lastActivityDate).toLocaleString()
                              : 'N/A'}
                          </td>
                          <td>
                            <button
                              onClick={() => openModal(user)}
                              className={styles.editButton}
                            >
                              <FiEdit /> Ver
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* 👥 USUARIOS */}
          {activeTab === 'users' && (
            <div className={styles.metricCard}>
              <h2 className={styles.metricTitle}>Gestión de Usuarios</h2>
              <UserList />
            </div>
          )}

          {/* 📊 ACTIVIDAD */}
          {activeTab === 'activity' && (
            <div className={styles.metricCard}>
              <ActivityLogCard />
            </div>
          )}

        </div>
      </main>

      {/* 🔥 MODAL */}
      {isModalOpen && selectedUser && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalCloseButton} onClick={closeModal}>
              &times;
            </button>

            <UserFileDetailsModalContent
              user={selectedUser}
              handleDownloadGroup={handleDownloadGroup}
              handleDownloadFile={handleDownloadFile}
              handleDeleteGroup={handleDeleteGroup}
              handleDeleteFile={handleDeleteFile}
            />
          </div>
        </div>
      )}
    </div>
  );
}