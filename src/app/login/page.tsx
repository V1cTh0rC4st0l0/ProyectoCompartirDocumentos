// src/app/login/page.tsx
'use client'
import { useState } from 'react'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const handleLogin = async () => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            headers: { 'Content-Type': 'application/json' },
        })

        if (res.ok) {
            const data = await res.json()
            if (data.rol === 'admin') {
                window.location.href = '/admin'
            } else {
                window.location.href = '/dashboard'
            }
        } else {
            alert('Credenciales inválidas')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="p-8 bg-white rounded shadow-md w-full max-w-sm">
                <h1 className="text-xl font-bold mb-4">Iniciar sesión</h1>
                <input
                    type="text"
                    placeholder="Usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full mb-2 px-3 py-2 border rounded"
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mb-4 px-3 py-2 border rounded"
                />
                <button
                    onClick={handleLogin}
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                    Entrar
                </button>
            </div>
        </div>
    )
}
