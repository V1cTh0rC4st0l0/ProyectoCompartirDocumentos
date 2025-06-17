// src/app/login/page.tsx
'use client'
import { useState } from 'react'
import styles from '@/styles/login.module.css'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        setIsLoading(true);
        setError(null);

        const res = await fetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        })

        if (res.ok) {
            const data = await res.json()
            if (data.rol === 'admin') {
                router.push('/admin');
            } else {
                router.push('/dashboard');
            }
        } else {
            const errorData = await res.json();
            setError(errorData.message || 'Credenciales inválidas');
        }
        setIsLoading(false);
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className={styles.loginPageContainer}>
            <video autoPlay loop muted className={styles.backgroundVideo}>
                <source src="/videos/fondo_tomografia_video.mp4" type="video/mp4" />
                Tu navegador no soporta el tag de video.
            </video>
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
                        <label htmlFor="email" className={styles.label}>Correo Electrónico</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Ingresa tu correo electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                    {error && <p className={styles.errorMessage}>{error}</p>}
                    <button onClick={handleLogin} className={styles.loginButton} disabled={isLoading}>
                        {isLoading ? 'Iniciando sesión...' : 'Login'}
                    </button>
                </div>
            </div>
        </div>
    )
};