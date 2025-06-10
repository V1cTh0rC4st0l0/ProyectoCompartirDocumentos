// src/components/CreateUserModal.tsx
'use client'
import { useState } from 'react'
import styles from '@/styles/createUserModal.module.css'

interface CreateUserModalProps {
    onClose: () => void;
}

export default function CreateUserModal({ onClose }: CreateUserModalProps) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState('usuario');
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setIsSuccess(null);

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, rol }),
            });
            const data = await res.json();

            if (res.ok) {
                setMessage(data.message || 'Usuario creado exitosamente.');
                setIsSuccess(true);
                setUsername('');
                setEmail('');
                setPassword('');
                setRol('usuario');
            } else {
                setMessage(data.message || 'Error al crear usuario.');
                setIsSuccess(false);
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
            setMessage('Error de conexión o servidor.');
            setIsSuccess(false);
        }
    };

    return (
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Crear Nuevo Usuario</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                    <label htmlFor="username" className={styles.label}>Nombre de usuario</label>
                    <input
                        type="text"
                        id="username"
                        placeholder="Ingresa el nombre de usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={styles.input}
                        required
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="email" className={styles.label}>Correo Electrónico</label>
                    <input
                        type="email"
                        id="email"
                        placeholder="Ingresa el correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.input}
                        required
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="password" className={styles.label}>Contraseña</label>
                    <input
                        type="password"
                        id="password"
                        placeholder="Ingresa la contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.input}
                        required
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="rol" className={styles.label}>Rol</label>
                    <select
                        id="rol"
                        value={rol}
                        onChange={(e) => setRol(e.target.value)}
                        className={styles.select}
                    >
                        <option value="usuario">Usuario</option>
                        <option value="admin">Administrador</option>
                    </select>
                </div>
                {message && (
                    <p className={isSuccess === true ? styles.successMessage : styles.errorMessage}>
                        {message}
                    </p>
                )}
                <div className={styles.buttonGroup}>
                    <button type="submit" className={styles.submitButton}>
                        Crear Usuario
                    </button>
                    <button type="button" onClick={onClose} className={styles.cancelButton}>
                        Cerrar
                    </button>
                </div>
            </form>
        </div>
    )
}