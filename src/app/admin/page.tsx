// src/app/admin/page.tsx
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
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (err: unknown) {
      console.error('Error fetching admin data:', err);
      setError('Error al cargar los datos del administrador. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAdminData();
  }, []);

  const filteredUsers = users.filter((user) => {
    if (!search) {
      return true;
    }
    const username = user?.username || '';
    const email = user?.email || '';
    const lowerCaseSearch = search.toLowerCase();

    return (
      username.toLowerCase().includes(lowerCaseSearch) ||
      email.toLowerCase().includes(lowerCaseSearch)
    );
  });

  const getLastModifiedDate = (user: User): Date | null => {
    if (user.lastActivityDate) {
      return new Date(user.lastActivityDate);
    }
    return null;
  };

  const getNumberOfSharedGroups = (user: User): number => {
    return user.sharedFileGroups?.length || 0;
  };

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const dateA = a.lastActivityDate ? new Date(a.lastActivityDate).getTime() : 0;
    const dateB = b.lastActivityDate ? new Date(b.lastActivityDate).getTime() : 0;
    return dateB - dateA;
  });

  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
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

  const handleDeleteGroup = async (groupId: string, userId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este grupo de archivos y todos sus contenidos? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const res = await fetch(`/api/file-groups/${groupId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      setUsers(prevUsers =>
        prevUsers.map(user => {
          if (user._id === userId) {
            return {
              ...user,
              sharedFileGroups: user.sharedFileGroups?.filter(
                group => group._id !== groupId
              ),
            };
          }
          return user;
        })
      );
      alert('Grupo de archivos eliminado con éxito.');

      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(prevSelectedUser => {
          if (prevSelectedUser) {
            return {
              ...prevSelectedUser,
              sharedFileGroups: prevSelectedUser.sharedFileGroups?.filter(
                group => group._id !== groupId
              ),
            };
          }
          return null;
        });
      }
      refreshAdminData();
    } catch (err) {
      console.error('Error al eliminar el grupo de archivos:', err);
      alert('Error al eliminar el grupo de archivos. Por favor, inténtalo de nuevo.');
    }
  };

  const handleDeleteFile = async (fileId: string, groupId: string, userId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este archivo? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const res = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      setUsers(prevUsers =>
        prevUsers.map(user => {
          if (user._id === userId) {
            return {
              ...user,
              sharedFileGroups: user.sharedFileGroups?.map(group => {
                if (group._id === groupId) {
                  return {
                    ...group,
                    archivos: group.archivos.filter(file => file.fileId !== fileId),
                  };
                }
                return group;
              }),
            };
          }
          return user;
        })
      );
      alert('Archivo eliminado con éxito.');
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(prevSelectedUser => {
          if (prevSelectedUser) {
            return {
              ...prevSelectedUser,
              sharedFileGroups: prevSelectedUser.sharedFileGroups?.map(group => {
                if (group._id === groupId) {
                  return {
                    ...group,
                    archivos: group.archivos.filter(file => file.fileId !== fileId),
                  };
                }
                return group;
              }),
            };
          }
          return null;
        });
      }
      refreshAdminData();
    } catch (err) {
      console.error('Error al eliminar el archivo:', err);
      alert('Error al eliminar el archivo. Por favor, inténtalo de nuevo.');
    }
  };

  const openModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className={`${styles.dashboardContainer} ${isDarkMode ? styles.darkMode : ''}`}>
      <main className={styles.mainContent}>
        <header className={styles.header}>
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
        </header>
        <section className={styles.userFilesSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Archivos Compartidos</h2>
            <div className={styles.sectionStats}>
              <span className={styles.statItem}>{users.length} Usuarios</span>
            </div>
          </div>

          {loading ? (
            <p className={styles.loadingMessage}>Cargando datos de usuarios...</p>
          ) : error ? (
            <p className={styles.errorMessage}>{error}</p>
          ) : sortedUsers.length === 0 ? (
            <p className={styles.noFilesMessage}>No se encontraron usuarios que coincidan con la búsqueda o con archivos compartidos.</p>
          ) : (
            <div className={styles.userTableContainer}>
              <table className={styles.userTable}>
                <thead>
                  <tr>
                    <th>Nombre de Usuario</th>
                    <th>Grupos Compartidos</th>
                    <th>Última Modificación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUsers.map((user) => {
                    const latestDate = getLastModifiedDate(user);

                    const dateDisplay = latestDate
                      ? new Date(latestDate).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                      : 'N/A';
                    const timeDisplay = latestDate
                      ? new Date(latestDate).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                      : '';
                    return (
                      <tr key={user._id}>
                        <td>
                          <div className={styles.userTableCell}>
                            {user.username}
                          </div>
                        </td>
                        <td className={styles.groupCountCell}>
                          {getNumberOfSharedGroups(user)}
                        </td>
                        <td>
                          {latestDate ? (
                            <>
                              <span className={styles.dateCell}>{dateDisplay}</span>
                              <span className={styles.timeCell}>{timeDisplay}</span>
                            </>
                          ) : (
                            'Sin archivos'
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() => openModal(user)}
                            className={styles.editButton}
                          >
                            <FiEdit className="mr-1" /> Visualizar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <h2 className={styles.metricTitle}>Gestión de Usuarios</h2>
            <div className={styles.metricContent}>
              <UserList />
            </div>
          </div>

          <div className={styles.metricCard}>
            <ActivityLogCard />
          </div>
        </section>
      </main>

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