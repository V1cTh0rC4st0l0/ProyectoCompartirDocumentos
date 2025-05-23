// src/components/ImageCollage.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import styles from '@/styles/imageCollage.module.css';
import Image from 'next/image';
import { AiOutlinePlus, AiOutlineClose } from 'react-icons/ai';
import { useDropzone } from 'react-dropzone';

interface ImageCollageProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const ImageCollage: React.FC<ImageCollageProps> = ({ isOpen, onClose }) => {
    const [images, setImages] = useState<string[]>([]);

    useEffect(() => {
        const fetchCollage = async () => {
            try {
                const response = await fetch('/api/get-collage');
                if (response.ok) {
                    const data = await response.json();
                    setImages(data.imageUrls);
                } else {
                    console.error('Error al obtener el collage');
                }
            } catch (error) {
                console.error('Error al obtener el collage:', error);
            }
        };

        fetchCollage();
    }, []);

    useEffect(() => {
        if (isOpen && onClose) {
            return () => {
                const saveCollage = async () => {
                    try {
                        const response = await fetch('/api/save-collage', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ imageUrls: images }),
                        });
                        if (response.ok) {
                            console.log('Collage guardado exitosamente en la base de datos.');
                        } else {
                            console.error('Error al guardar el collage en la base de datos.');
                        }
                    } catch (error) {
                        console.error('Error al guardar el collage en la base de datos:', error);
                    }
                };
                saveCollage();
            };
        }
    }, [isOpen, onClose, images]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        acceptedFiles.map((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    setImages((prevImages) => [...prevImages, e.target.result as string]);
                }
            };
            reader.readAsDataURL(file);
        });
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const handleAddImage = () => {
        const input = document.getElementById('image-upload-input');
        if (input) {
            input.click();
        }
    };

    const handleDeleteImage = (indexToRemove: number) => {
        setImages((prevImages) => prevImages.filter((_, index) => index !== indexToRemove));
    };

    if (isOpen) {
        return (
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.modalTitle}>Administrador de Collage</h2>
                <div className={styles.imageTimeline}>
                    {images.map((src, index) => (
                        <div key={index} className={styles.timelineItem}>
                            <div className={styles.imageContainer}>
                                <Image src={src} alt={`Imagen ${index + 1}`} width={150} height={100} style={{ objectFit: 'cover' }} />
                                <button className={styles.deleteButton} onClick={() => handleDeleteImage(index)}>
                                    <AiOutlineClose />
                                </button>
                            </div>
                        </div>
                    ))}
                    <div className={styles.addImageContainer} {...getRootProps()}>
                        <input {...getInputProps()} id="image-upload-input" multiple />
                        <button className={styles.addButton} onClick={handleAddImage}>
                            <AiOutlinePlus />
                        </button>
                        {isDragActive && <p className={styles.dropText}>Suelta aquí las imágenes...</p>}
                        {!isDragActive && images.length === 0 && <p className={styles.dropText}>Arrastra y suelta o haz clic para agregar imágenes</p>}
                        {!isDragActive && images.length > 0 && <p className={styles.dropText}>Arrastra y suelta o haz clic para agregar más</p>}
                    </div>
                </div>
                <button onClick={onClose} className={styles.closeButton}>
                    Cerrar
                </button>
            </div>
        );
    }

    return (
        <div className={`${styles.imageCollage} ${images.length > 1 ? styles.animate : ''}`}>
            <div className={styles.imageTimeline}>
                {images.map((src, index) => (
                    <div key={index} className={styles.timelineItem}>
                        <div className={styles.imageContainer}>
                            <Image src={src} alt={`Imagen ${index + 1}`} width={150} height={110} style={{ objectFit: 'cover' }} />
                        </div>
                    </div>
                ))}
                {images.length === 0 && <p className={styles.emptyCollageText}>No hay imágenes en el collage.</p>}
            </div>
        </div>
    );
};

export default ImageCollage;