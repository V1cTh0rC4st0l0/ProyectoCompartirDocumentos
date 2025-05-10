'use client'
import { useEffect, useState } from 'react'

interface User {
    _id: string
    username: string
    rol: string
}

export default function UserList() {
    const [users, setUsers] = useState<User[]>([])
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState<{ username: string; rol: string }>({
        username: '',
        rol: 'usuario'
    })

    const fetchUsers = async () => {
        const res = await fetch('/api/users')
        const data = await res.json()
        setUsers(data.users || [])
    }

    const deleteUser = async (id: string) => {
        if (confirm('¿Estás seguro de eliminar este usuario?')) {
            await fetch(`/api/users?id=${id}`, { method: 'DELETE' })
            fetchUsers()
        }
    }

    const startEdit = (user: User) => {
        setEditingId(user._id)
        setEditForm({ username: user.username, rol: user.rol })
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditForm({ username: '', rol: 'usuario' })
    }

    const saveEdit = async () => {
        await fetch(`/api/users`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: editingId, ...editForm })
        })
        cancelEdit()
        fetchUsers()
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    return (
        <div className="p-4 border rounded shadow-md space-y-2">
            <h2 className="text-xl font-bold">Usuarios registrados</h2>
            <ul className="space-y-1">
                {users.map((user) => (
                    <li key={user._id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b py-2">
                        {editingId === user._id ? (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
                                <input
                                    className="border px-2 py-1 rounded"
                                    value={editForm.username}
                                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                />
                                <select
                                    className="border px-2 py-1 rounded"
                                    value={editForm.rol}
                                    onChange={(e) => setEditForm({ ...editForm, rol: e.target.value })}
                                >
                                    <option value="usuario">usuario</option>
                                    <option value="admin">admin</option>
                                </select>
                                <div className="flex gap-2">
                                    <button onClick={saveEdit} className="bg-green-600 text-white px-2 py-1 rounded">Guardar</button>
                                    <button onClick={cancelEdit} className="bg-gray-500 text-white px-2 py-1 rounded">Cancelar</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between w-full items-center">
                                <span>{user.username} ({user.rol})</span>
                                <div className="flex gap-2">
                                    <button onClick={() => startEdit(user)} className="text-blue-600 hover:underline">Editar</button>
                                    <button onClick={() => deleteUser(user._id)} className="text-red-600 hover:underline">Eliminar</button>
                                </div>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    )
}
