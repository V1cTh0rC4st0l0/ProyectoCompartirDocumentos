'use client'
import { useState } from 'react'
import styles from '@/styles/login.module.css'
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineArrowRight, AiOutlinePhone, AiOutlineWhatsApp, AiOutlineMail, AiOutlineEnvironment } from 'react-icons/ai';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Lista de imágenes para el collage
    const imagenesCollage = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png'];

    const scrollToLogin = () => {
        document.getElementById('login')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleLogin = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                router.push(data.rol === 'admin' ? '/admin' : '/dashboard');
            } else {
                const errorData = await res.json();
                setError(errorData.message || 'Credenciales inválidas');
            }
        } catch (err) {
            console.error(err);
            setError('Ocurrió un error inesperado');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.mainWrapper}>
            <header className={styles.header}>
                <nav className={styles.navLeft}>
                    <a href="#">Inicio</a>
                    <a href="#footerContent">Nosotros</a>
                    {/*<a href="#">Servicios</a>*/}
                </nav>

                <div className={styles.logoCentral}>
                    <div className={styles.logoCircle}>
                        <Image
                            src="/images/Raxvel_log.png"
                            alt="Raxvel Logo"
                            width={120}
                            height={120}
                            priority
                        />
                    </div>
                </div>

                <nav className={styles.navRight}>
                    {/*<a href="#">Estudios</a>*/}
                    {/*<a href="#">Galería</a>*/}
                    <button onClick={scrollToLogin} className={styles.contactBtn}>
                        Acceso Doctores <AiOutlineArrowRight />
                    </button>
                </nav>
            </header>

            {/* HERO SECTION CON COLLAGE CAÓTICO MULTI-TRACK */}
            <section className={styles.heroSection}>
                <div className={styles.collageContainer}>
                    {/* TRACK 1 (Arriba, Lento) */}
                    <div className={`${styles.collageTrack} ${styles.track1}`}>
                        {[...imagenesCollage, ...imagenesCollage].map((img, index) => (
                            <div key={`t1-${index}`} className={`${styles.collageItem} ${styles.itemSmall} ${styles.alignTop}`}>
                                <Image src={`/images/collage/${img}`} alt="Radiografía" fill className={styles.imgCollage} />
                            </div>
                        ))}
                    </div>

                    {/* TRACK 2 (Centro, Rápido, Grande) */}
                    <div className={`${styles.collageTrack} ${styles.track2}`}>
                        {[...imagenesCollage, ...imagenesCollage].reverse().map((img, index) => (
                            <div key={`t2-${index}`} className={`${styles.collageItem} ${styles.itemBig} ${styles.alignCenter}`}>
                                <Image src={`/images/collage/${img}`} alt="Tecnología Dental" fill className={styles.imgCollage} />
                            </div>
                        ))}
                    </div>

                    {/* TRACK 3 (Abajo, Medio, Pequeño) */}
                    <div className={`${styles.collageTrack} ${styles.track3}`}>
                        {[...imagenesCollage, ...imagenesCollage].map((img, index) => (
                            <div key={`t3-${index}`} className={`${styles.collageItem} ${styles.itemSmall} ${styles.alignBottom}`}>
                                <Image src={`/images/collage/${img}`} alt="Paciente Raxvel" fill className={styles.imgCollage} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.heroOverlay}>
                    <div className={styles.heroContent}>
                        <span className={styles.subTitle}>Tomografía y Radiología Dental</span>
                        <h1 className={styles.mainTitle}>
                            CENTRO RADIOLÓGICO <span>DENTAL</span>
                        </h1>
                        <p className={styles.description}>
                            No solo tomamos imágenes; capturamos los detalles que tu
                            odontólogo necesita para cuidar de ti. Con tecnología de vanguardia
                            y un equipo que te acompaña en cada paso, tu salud está en las mejores manos.
                        </p>

                        <div className={styles.heroActions}>
                            {/* Enlace de WhatsApp */}
                            <a
                                href="https://wa.me/522231124828?text=Hola%20Raxvel%20Digital,%20me%20gustaría%20agendar%20una%20cita."
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.primaryBtnLink}
                            >
                                <button className={styles.primaryBtn}>
                                    <AiOutlineWhatsApp className={styles.waIcon} /> Agendar Cita
                                </button>
                            </a>

                            <div className={styles.phoneBox}>
                                <div className={styles.iconCircle}><AiOutlinePhone /></div>
                                <div>
                                    <span>Llámanos ahora:</span>
                                    <strong>+52 223 112 4828</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.waveContainer}>
                    <svg viewBox="0 0 1130 310" xmlns="http://www.w3.org/2000/svg">
                        <path
                            fill="#f9f9f9"
                            fillOpacity="1"
                            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z">
                        </path>
                    </svg>
                </div>
            </section>

            {/* SECCIÓN DE LOGIN */}
            <section id="login" className={styles.loginWrapper}>
                <div className={styles.loginCard}>
                    <div className={styles.logoContainer}>
                        <div className={styles.logo}>
                            <Image
                                src="/images/Raxvel_log.png"
                                alt="Logo Raxvel"
                                width={120}
                                height={120}
                                className={styles.logoImage}
                            />
                        </div>
                        <h2 className={styles.helloText}>¡Hola Doctor!</h2>
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
                        <label htmlFor="password" className={styles.label}>Contraseña</label>
                        <div className={styles.passwordInputContainer}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                placeholder="Ingresa tu contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`${styles.input} ${styles.passwordInput}`}
                            />
                            <span className={styles.passwordToggle} onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                            </span>
                        </div>
                    </div>

                    {error && <p className={styles.errorMessage}>{error}</p>}

                    <button onClick={handleLogin} className={styles.loginButton} disabled={isLoading}>
                        {isLoading ? 'Iniciando sesión...' : 'Entrar'}
                    </button>
                </div>
            </section>
            {/* NUEVO FOOTER INTEGRADO */}
            <footer className={styles.footer}>
                {/* La curva superior para que encaje con el diseño */}
                <div className={styles.footerWave}>
                    <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg">
                        <path
                            fill="#f9f9f9"
                            d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,80C1120,85,1280,75,1360,69.3L1440,64L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z">
                        </path>
                    </svg>
                </div>

                <div id="footerContent" className={styles.footerContainer}>
                    {/* Parte de Contacto */}
                    <div className={styles.footerContact}>
                        <h3 className={styles.footerTitle}>Contáctanos</h3>

                        <div className={styles.contactItem}>
                            <div className={styles.contactIcon}><AiOutlinePhone /></div>
                            <div className={styles.contactText}>
                                <span>¿Preguntas? Llámanos</span>
                                <strong>+52 223 112 4828</strong>
                            </div>
                        </div>

                        <div className={styles.contactItem}>
                            <div className={styles.contactIcon}><AiOutlineMail /></div>
                            <div className={styles.contactText}>
                                <span>Escríbenos</span>
                                <strong>contacto@raxvel.com</strong>
                            </div>
                        </div>
                        <div className={styles.footerAddress}>
                            <h3 className={styles.footerTitle}>Visítanos</h3>
                            <div className={styles.contactItem}>
                                <div className={styles.contactIcon}><AiOutlineEnvironment /></div>
                                <div className={styles.contactText}>
                                    <span>Nuestra Ubicación</span>
                                    <strong>Calle Francisco I. Madero #115</strong>
                                    <strong>Col. Centro, Tepeaca, Puebla</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Logo Central o Espaciador para mantener el estilo */}
                    <div className={styles.footerLogo}>
                        <Image src="/images/Raxvel_log.png" alt="Raxvel" width={80} height={80} />
                        <p>Innovación en Tomografía Dental</p>
                    </div>
                </div>

                {/* Línea de Copyright */}
                <div className={styles.copyrightBar}>
                    <p>© {new Date().getFullYear()} Raxvel Centro Radiológico. Todos los derechos reservados.</p>
                    <div className={styles.legalLinks}>
                        <a href="#">Privacidad</a>
                        <a href="#">Términos</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}