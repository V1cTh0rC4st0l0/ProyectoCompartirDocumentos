'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import UserFileGroups from '@/components/UserFileGroups';
import UserList from './components/UserList';

// Define la estructura del usuario, incluyendo los grupos de archivos compartidos
type User = {
  _id: string;
  username: string;
  sharedFileGroups: Grupo[]; // Ajusta la estructura si es diferente
};

// Define la estructura del Grupo (de tu UserFileGroups.tsx)
interface Archivo {
  nombreArchivo: string;
  tipoArchivo: string;
  ruta: string;
}

interface Grupo {
  _id: string;
  nombreGrupo: string;
  archivos: Archivo[];
  creadoEn: string;
}

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
        const res = await fetch('/api/admin/dashboard-data'); // La misma API endpoint
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setUsers(data.users); // Asume que la API devuelve usuarios con sharedFileGroups
      } catch (err: any) {
        console.error('Error fetching admin data:', err);
        setError('Error al cargar los datos del administrador.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div>Cargando datos...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex min-h-screen">
      <main className="flex-1 p-6 bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">Administrador</h1>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar usuarios..."
            className="w-full px-4 py-2 border rounded shadow"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className="rounded-lg border shadow p-4 bg-white"
            >
              <h2 className="text-lg font-semibold mb-2">Archivos compartidos con {user.username}</h2>
              <UserFileGroups usuarioId={user._id} /> {/* Renderiza el componente */}
            </div>
          ))}
        </div>
        <div>
          <UserList />
        </div>
      </main>
    </div>
  );
}