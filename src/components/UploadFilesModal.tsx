// src/components/UploadFilesModal.tsx
'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/uploadFilesModal.module.css'; // Importa los nuevos estilos
import { AiOutlineClose } from 'react-icons/ai'; // Para el botón de cerrar

type Usuario = {
    _id: string;
    username: string;
};

interface UploadFilesModalProps {
    onClose: () => void;
}

export default function UploadFilesModal({ onClose }: UploadFilesModalProps) {
    const [files, setFiles] = useState<FileList | null>(null);
    const [nombreGrupo, setNombreGrupo] = useState('');
    const [compartidoConId, setCompartidoConId] = useState(''); // ID del usuario con el que se comparte
    const [compartidoConUsername, setCompartidoConUsername] = useState(''); // Nombre del usuario seleccionado
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [search, setSearch] = useState('');
    const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
    const [message, setMessage] = useState(''); // Para mensajes de éxito/error
    const [isSuccess, setIsSuccess] = useState<boolean | null>(null); // Para el estilo del mensaje

    // Límite de archivos a mostrar
    const FILE_DISPLAY_LIMIT = 5; // Puedes ajustar este número según tus necesidades

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
                u.username.toLowerCase().includes(search.toLowerCase()) && u._id !== compartidoConId // Filtra y no muestra el ya seleccionado
            )
        );
    }, [search, usuarios, compartidoConId]);

    const handleSelectUsuario = (usuario: Usuario) => {
        setCompartidoConId(usuario._id);
        setCompartidoConUsername(usuario.username);
        setSearch(usuario.username); // Para que el input de búsqueda muestre el nombre del usuario seleccionado
        setFilteredUsuarios([]); // Limpiar la lista de resultados de búsqueda
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setIsSuccess(null);

        if (!files || files.length === 0 || !nombreGrupo || !compartidoConId) {
            setMessage('Por favor, selecciona archivos, un nombre de grupo y un usuario.');
            setIsSuccess(false);
            return;
        }

        const formData = new FormData();
        for (const file of Array.from(files)) {
            formData.append('archivos', file);
        }
        formData.append('nombreGrupo', nombreGrupo);
        formData.append('usuarioId', compartidoConId); // Asumiendo que `usuarioId` es el ID del usuario que sube el archivo
        formData.append('compartidoCon', compartidoConId); // Asumiendo que `compartidoCon` es el ID del usuario con quien se comparte

        try {
            const res = await fetch('/api/file-groups/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(data.message || 'Archivos subidos exitosamente.');
                setIsSuccess(true);
                // Limpiar formulario
                setFiles(null);
                setNombreGrupo('');
                setCompartidoConId('');
                setCompartidoConUsername('');
                setSearch('');
                // Opcional: limpiar el input de tipo file
                const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
                if (fileInput) fileInput.value = '';

            } else {
                setMessage(data.message || 'Error al subir archivos.');
                setIsSuccess(false);
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            setMessage('Error de conexión o servidor al subir archivos.');
            setIsSuccess(false);
        }
    };

    return (
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Subir Grupo de Archivos</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                    <label htmlFor="nombreGrupo" className={styles.label}>Nombre del Grupo</label>
                    <input
                        type="text"
                        id="nombreGrupo"
                        placeholder="Ej. Estudio de Rayos X Enero"
                        value={nombreGrupo}
                        onChange={(e) => setNombreGrupo(e.target.value)}
                        className={styles.input}
                        required
                    />
                </div>

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
                        {filteredUsuarios.length > 0 && search.length > 0 && ( // Solo muestra si hay búsqueda y resultados
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
                    <label htmlFor="file-upload-input" className={styles.label}>Seleccionar Archivos</label>
                    <input
                        type="file"
                        id="file-upload-input"
                        multiple
                        onChange={(e) => setFiles(e.target.files)}
                        className={styles.fileInput}
                        required={!files || files.length === 0} // Hace que sea requerido si no hay archivos seleccionados
                    />
                    {files && files.length > 0 && (
                        <div className={styles.filesSelectedContainer}> {/* Nuevo contenedor para la lista de archivos */}
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

                {message && (
                    <p className={isSuccess === true ? styles.successMessage : styles.errorMessage}>
                        {message}
                    </p>
                )}

                <div className={styles.buttonGroup}>
                    <button type="submit" className={styles.submitButton}>
                        Subir Archivos
                    </button>
                    <button type="button" onClick={onClose} className={styles.cancelButton}>
                        Cerrar
                    </button>
                </div>
            </form>
        </div>
    );
}