'use client'
import { useEffect, useState } from 'react'

// Definimos la interfaz completa del usuario
interface User {
    _id: string;
    username: string;
    email: string; // Añadimos el campo email
    rol: string;
    // La contraseña no se trae al frontend por seguridad
}

export default function UserList() {
    const [users, setUsers] = useState<User[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{
        username: string;
        email: string; // Estado para el email en el formulario de edición
        password: string; // Estado para la nueva contraseña (se enviará solo si se cambia)
        rol: string;
    }>({
        username: '',
        email: '',
        password: '', // Inicialmente vacío
        rol: 'usuario',
    });
    const [message, setMessage] = useState<string | null>(null); // Mensajes para el usuario
    const [isSuccess, setIsSuccess] = useState<boolean | null>(null); // Estado de éxito/error del mensaje
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null); // Estado para el ID del usuario a confirmar eliminación

    // Función para obtener la lista de usuarios
    const fetchUsers = async () => {
        setMessage(null);
        setIsSuccess(null);
        try {
            const res = await fetch('/api/users');
            if (!res.ok) {
                throw new Error('Error al cargar usuarios');
            }
            const data = await res.json();
            setUsers(data.users || []);
        } catch (error) {
            console.error("Error fetching users:", error);
            setMessage('Error al cargar la lista de usuarios.');
            setIsSuccess(false);
        }
    };

    // Función para eliminar un usuario
    const handleDeleteUser = async (id: string) => {
        setMessage(null);
        setIsSuccess(null);
        try {
            const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Error al eliminar usuario');
            }
            setMessage(data.message || 'Usuario eliminado exitosamente.');
            setIsSuccess(true);
            fetchUsers(); // Recargar la lista después de eliminar
        } catch (error: unknown) {
            console.error("Error deleting user:", error);
            setMessage('Error al eliminar usuario.');
            setIsSuccess(false);
        } finally {
            setShowDeleteConfirm(null); // Cerrar la confirmación
        }
    };

    // Iniciar el modo de edición para un usuario
    const startEdit = (user: User) => {
        setEditingId(user._id);
        // Poblar el formulario de edición con los datos actuales del usuario
        // La contraseña se deja vacía por seguridad, el usuario debe introducirla para cambiarla
        setEditForm({ username: user.username, email: user.email, password: '', rol: user.rol });
        setMessage(null); // Limpiar mensajes al iniciar edición
        setIsSuccess(null);
    };

    // Cancelar el modo de edición
    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({ username: '', email: '', password: '', rol: 'usuario' });
        setMessage(null); // Limpiar mensajes
        setIsSuccess(null);
    };

    // Guardar los cambios de un usuario editado
    const saveEdit = async () => {
        if (!editingId) return; // Asegurarse de que hay un ID en edición

        setMessage(null);
        setIsSuccess(null);

        // Objeto con los datos a enviar
        const dataToUpdate: { username: string; email: string; password?: string; rol: string } = {
            username: editForm.username,
            email: editForm.email,
            rol: editForm.rol,
        };

        // Solo añadir la contraseña si el campo no está vacío
        if (editForm.password) {
            dataToUpdate.password = editForm.password;
        }

        try {
            const res = await fetch(`/api/users`, { // La API PUT debería manejar el ID en el body o query
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: editingId, ...dataToUpdate }), // Incluimos el ID y los datos
            });
            const data = await res.json();

            if (res.ok) {
                setMessage(data.message || 'Usuario actualizado exitosamente.');
                setIsSuccess(true);
                cancelEdit(); // Salir del modo de edición
                fetchUsers(); // Recargar la lista
            } else {
                setMessage(data.message || 'Error al actualizar usuario.');
                setIsSuccess(false);
            }
        } catch (error) {
            console.error("Error saving edit:", error);
            setMessage('Error de conexión o servidor al actualizar usuario.');
            setIsSuccess(false);
        }
    };

    // Hook para cargar usuarios al inicio
    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Lista de Usuarios</h3>

            {/* Mensajes de éxito/error */}
            {message && (
                <div className={`mb-4 p-3 rounded-md text-center ${isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message}
                </div>
            )}

            <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
                <ul className="space-y-3">
                    {users.length === 0 ? (
                        <p className="text-gray-600">No hay usuarios registrados.</p>
                    ) : (
                        users.map((user) => (
                            <li key={user._id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-3 pt-2 last:border-b-0">
                                {editingId === user._id ? (
                                    // Modo de edición
                                    <div className="flex flex-col gap-3 w-full">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
                                            <label className="sr-only" htmlFor={`edit-username-${user._id}`}>Nombre de usuario</label>
                                            <input
                                                id={`edit-username-${user._id}`}
                                                className="border border-gray-300 px-3 py-2 rounded-md flex-grow focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Nombre de usuario"
                                                value={editForm.username}
                                                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                            />
                                            <label className="sr-only" htmlFor={`edit-email-${user._id}`}>Correo electrónico</label>
                                            <input
                                                id={`edit-email-${user._id}`}
                                                type="email"
                                                className="border border-gray-300 px-3 py-2 rounded-md flex-grow focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Correo electrónico"
                                                value={editForm.email}
                                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
                                            <label className="sr-only" htmlFor={`edit-password-${user._id}`}>Nueva Contraseña</label>
                                            <input
                                                id={`edit-password-${user._id}`}
                                                type="password"
                                                className="border border-gray-300 px-3 py-2 rounded-md flex-grow focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Nueva Contraseña (dejar vacío para no cambiar)"
                                                value={editForm.password}
                                                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                            />
                                            <label className="sr-only" htmlFor={`edit-rol-${user._id}`}>Rol</label>
                                            <select
                                                id={`edit-rol-${user._id}`}
                                                className="border border-gray-300 px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                value={editForm.rol}
                                                onChange={(e) => setEditForm({ ...editForm, rol: e.target.value })}
                                            >
                                                <option value="usuario">Usuario</option>
                                                <option value="admin">Administrador</option>
                                            </select>
                                        </div>
                                        <div className="flex gap-2 justify-end mt-2">
                                            <button onClick={saveEdit} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">Guardar</button>
                                            <button onClick={cancelEdit} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">Cancelar</button>
                                        </div>
                                    </div>
                                ) : (
                                    // Modo de visualización
                                    <div className="flex justify-between w-full items-center">
                                        <div className="flex flex-col text-gray-700">
                                            <span className="font-medium text-lg">{user.username}</span>
                                            <span className="text-sm text-gray-500">{user.email}</span> {/* Mostrar el email */}
                                            <span className="text-sm capitalize text-gray-500">Rol: {user.rol}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => startEdit(user)} className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors">Editar</button>
                                            <button
                                                onClick={() => setShowDeleteConfirm(user._id)} // Abre la confirmación
                                                className="text-red-600 hover:text-red-800 font-medium text-sm transition-colors"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))
                    )}
                </ul>
            </div>

            {/* Modal de Confirmación de Eliminación */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
                        <h4 className="text-lg font-semibold mb-4">Confirmar Eliminación</h4>
                        <p className="mb-6 text-gray-700">¿Estás seguro de que quieres eliminar a este usuario?</p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => handleDeleteUser(showDeleteConfirm)}
                                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md font-medium transition-colors"
                            >
                                Sí, eliminar
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-md font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}