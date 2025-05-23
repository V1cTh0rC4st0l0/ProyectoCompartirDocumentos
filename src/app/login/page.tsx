// src/app/login/page.tsx
'use client'
import { useState } from 'react'
import styles from '@/styles/login.module.css'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import Image from 'next/image';
import ImageCollage from '@/components/ImageCollage';

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
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
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className={styles.loginPageContainer}>
            <div className={styles.loginFormSection}>
                <div className={styles.loginCard}>
                    <div className={styles.logoContainer}>
                        <div className={styles.logo}>
                            <Image
                                src="/images/Raxvel_log.png"
                                alt="Logo de Doctor"
                                width={80}
                                height={80}
                                className={styles.logoImage}
                            />
                        </div>
                        <h2 className={styles.helloText}>Hola Doctor!</h2>
                        <p className={styles.secondaryText}>Inicia sesión para continuar.</p>
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="username" className={styles.label}>Usuario</label>
                        <input
                            type="text"
                            id="username"
                            placeholder="Ingresa tu usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>Password</label>
                        <div className={styles.passwordInputContainer}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                placeholder="Ingresa tu contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`${styles.input} ${styles.passwordInput}`}
                            />
                            <span className={styles.passwordToggle} onClick={togglePasswordVisibility}>
                                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                            </span>
                        </div>
                    </div>
                    <button onClick={handleLogin} className={styles.loginButton}>
                        Login
                    </button>
                </div>
            </div>
            <div className={styles.imageCollageSection}>
                <ImageCollage />
            </div>
        </div>
    )
}