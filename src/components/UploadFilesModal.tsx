// src/components/UploadFilesModal.tsx
'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/uploadFilesModal.module.css';
import { AiOutlineClose } from 'react-icons/ai';
import { FaRegClock } from "react-icons/fa";
import axios from 'axios';
import Image from 'next/image';

type Usuario = {
    _id: string;
    username: string;
};

interface UploadFilesModalProps {
    onClose: () => void;
}

interface GrupoApi {
    _id: string;
    nombreGrupo: string;
}

export default function UploadFilesModal({ onClose }: UploadFilesModalProps) {
    const [files, setFiles] = useState<FileList | null>(null);
    const [nombreGrupo, setNombreGrupo] = useState('');
    const [compartidoConId, setCompartidoConId] = useState('');
    const [compartidoConUsername, setCompartidoConUsername] = useState('');
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [search, setSearch] = useState('');
    const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [gruposExistentes, setGruposExistentes] = useState<string[]>([]);
    const [grupoSuggestions, setGrupoSuggestions] = useState<string[]>([]);

    const FILE_DISPLAY_LIMIT = 5;

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const res = await fetch('/api/users');
                const data = await res.json();
                setUsuarios(data.users);
            } catch (err) {
                console.error('Error al cargar usuarios:', err);
            }
        };

        fetchUsuarios();
    }, []);

    useEffect(() => {
        setFilteredUsuarios(
            usuarios.filter((u) =>
                u.username.toLowerCase().includes(search.toLowerCase()) && u._id !== compartidoConId
            )
        );
    }, [search, usuarios, compartidoConId]);

    const handleSelectUsuario = async (usuario: Usuario) => {
        setCompartidoConId(usuario._id);
        setCompartidoConUsername(usuario.username);
        setSearch(usuario.username);
        setFilteredUsuarios([]);

        try {
            const res = await fetch(`/api/file-groups/by-user/${usuario._id}`);
            const data = await res.json();
            const nombresDeGrupos = data.grupos
                .filter((grupo: GrupoApi) => grupo && typeof grupo.nombreGrupo === 'string')
                .map((grupo: GrupoApi) => grupo.nombreGrupo);
            setGruposExistentes(nombresDeGrupos);
        } catch (error) {
            console.error('Error al obtener grupos existentes:', error);
            setGruposExistentes([]);
        }
    };
    useEffect(() => {
        if (!nombreGrupo || gruposExistentes.length === 0) {
            setGrupoSuggestions([]);
            return;
        }

        const coincidencias = gruposExistentes.filter((grupo) =>
            grupo.toLowerCase().includes(nombreGrupo.toLowerCase())
        );
        setGrupoSuggestions(coincidencias);
    }, [nombreGrupo, gruposExistentes]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setIsSuccess(null);
        setIsLoading(true);
        setUploadProgress(0);

        if (!files || files.length === 0 || !nombreGrupo || !compartidoConId) {
            setMessage('Por favor, selecciona archivos, un nombre de grupo y un usuario.');
            setIsSuccess(false);
            setIsLoading(false);
            setUploadProgress(0);
            setTimeout(() => {
                onClose();
            }, 3000);
            return;
        }

        const formData = new FormData();
        for (const file of Array.from(files)) {
            formData.append('archivos', file);
        }
        formData.append('nombreGrupo', nombreGrupo);
        formData.append('usuarioId', compartidoConId);
        formData.append('compartidoCon', compartidoConId);

        try {
            const res = await axios.post('/api/file-groups/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(percentCompleted);
                    }
                },
            });

            const data = await res.data;

            if (res.status >= 200 && res.status < 300) {
                setMessage(data.message || 'Archivos subidos exitosamente.');
                setIsSuccess(true);
                setFiles(null);
                setNombreGrupo('');
                setCompartidoConId('');
                setCompartidoConUsername('');
                setSearch('');
                const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            } else {
                setMessage(data.message || 'Error al subir archivos.');
                setIsSuccess(false);
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            let errorMessage = 'Error de conexión o servidor al subir archivos.';
            if (axios.isAxiosError(error) && error.response) {
                errorMessage = error.response.data.message || errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            setMessage(errorMessage);
            setIsSuccess(false);
        } finally {
            setIsLoading(false);
            setUploadProgress(0);
            setTimeout(() => {
                onClose();
            }, 3000);
        }
    };

    return (
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Subir Archivos</h2>
            {isSuccess === true && !isLoading ? (
                <div className={styles.fullScreenSuccessContainer}>
                    <Image
                        src="/images/success-icon.png"
                        alt="Subida Exitosa"
                        layout="fill"
                        objectFit="cover"
                        className={styles.successBackgroundImage}
                    />
                    <div className={styles.successContentOverlay}>
                        <p className={styles.successMessageText}>{message}</p>
                    </div>
                </div>
            ) : isLoading ? (<div className={styles.loadingContainer}>
                <div className={styles.loaderCircle}>
                    <FaRegClock className={styles.loaderIcon} />
                    <div className={styles.progressBar} style={{ width: `${uploadProgress}%` }}></div>

                </div>
                <p className={styles.loadingText}>Subiendo: <span className={styles.progressText}>{uploadProgress}%</span></p>
            </div>
            ) : (
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="searchUser" className={styles.label}>Compartir con Usuario</label>
                        <div className={styles.relativeContainer}>
                            <input
                                type="text"
                                id="searchUser"
                                placeholder="Buscar usuario para compartir"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={styles.input}
                            />
                            {filteredUsuarios.length > 0 && search.length > 0 && (
                                <ul className={styles.userDropdown}>
                                    {filteredUsuarios.map((usuario) => (
                                        <li
                                            key={usuario._id}
                                            onClick={() => handleSelectUsuario(usuario)}
                                            className={styles.dropdownItem}
                                        >
                                            {usuario.username}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {compartidoConUsername && (
                        <p className={styles.selectedUser}>
                            Compartiendo con: <span className={styles.selectedUsername}>{compartidoConUsername}</span>
                            <button type="button" className={styles.clearSelectionButton} onClick={() => {
                                setCompartidoConId('');
                                setCompartidoConUsername('');
                                setSearch('');
                            }}>
                                <AiOutlineClose />
                            </button>
                        </p>
                    )}
                    <div className={styles.inputGroup}>
                        <label htmlFor="nombreGrupo" className={styles.label}>Nombre del Grupo</label>
                        <div className={styles.relativeContainer}>
                            <input
                                type="text"
                                id="nombreGrupo"
                                placeholder="Ej. Estudio de Rayos X Enero"
                                value={nombreGrupo}
                                onChange={(e) => setNombreGrupo(e.target.value)}
                                className={styles.input}
                                required
                                autoComplete="off"
                            />
                            {grupoSuggestions.length > 0 && (
                                <ul className={styles.userDropdown}>
                                    {grupoSuggestions.map((grupo, index) => (
                                        <li
                                            key={index}
                                            onClick={() => {
                                                setNombreGrupo(grupo);
                                                setGrupoSuggestions([]);
                                            }}
                                            className={styles.dropdownItem}
                                        >
                                            {grupo}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="file-upload-input" className={styles.label}>Seleccionar Archivos</label>
                        <input
                            type="file"
                            id="file-upload-input"
                            multiple
                            onChange={(e) => setFiles(e.target.files)}
                            className={styles.fileInput}
                            required={!files || files.length === 0}
                        />
                        {files && files.length > 0 && (
                            <div className={styles.filesSelectedContainer}>
                                <p className={styles.filesSelectedText}>Archivos seleccionados:</p>
                                <ul className={styles.fileList}>
                                    {Array.from(files).slice(0, FILE_DISPLAY_LIMIT).map((f, index) => (
                                        <li key={index} className={styles.fileListItem}>{f.name}</li>
                                    ))}
                                    {files.length > FILE_DISPLAY_LIMIT && (
                                        <li className={styles.fileListItem}>
                                            Y {files.length - FILE_DISPLAY_LIMIT} archivo(s) más...
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                    {message && isSuccess === false && (
                        <p className={styles.errorMessage}>
                            {message}
                        </p>
                    )}
                    <div className={styles.buttonGroup}>
                        <button type="submit" className={styles.submitButton} disabled={isLoading}>
                            Subir Archivos
                        </button>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>
                            Cerrar
                        </button>
                    </div>
                </form>
            )}
            {!isLoading && message && isSuccess !== null && (
                <p className={isSuccess === true ? styles.successMessage : styles.errorMessage}>
                    {message}
                </p>
            )}
        </div>
    );
}