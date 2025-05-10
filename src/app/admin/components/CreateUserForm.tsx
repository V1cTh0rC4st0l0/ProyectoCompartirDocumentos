'use client'
import { useState } from 'react'

export default function CreateUserForm() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [rol, setRol] = useState('usuario')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, rol }),
        })
        const data = await res.json()
        alert(data.message || 'Usuario creado')
    }

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded shadow-md space-y-4">
            <h2 className="text-xl font-bold">Crear Usuario</h2>
            <input
                type="text"
                placeholder="Nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border p-2 w-full"
                required
            />
            <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2 w-full"
                required
            />
            <select value={rol} onChange={(e) => setRol(e.target.value)} className="border p-2 w-full">
                <option value="usuario">Usuario</option>
                <option value="admin">Administrador</option>
            </select>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                Crear
            </button>
        </form>
    )
}
