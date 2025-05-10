// src/app/usuario/grupos/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Archivo {
  _id: string;
  nombreArchivo: string;
  tipoArchivo: string;
}

interface Grupo {
  _id: string;
  nombreGrupo: string;
  archivos: Archivo[];
}

export default function GruposCompartidos() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const usuarioId = 'TU_ID_DE_USUARIO'; // Esto debes reemplazarlo dinámicamente

  useEffect(() => {
    const fetchGrupos = async () => {
      const res = await fetch(`/api/file-groups/compartidos/${usuarioId}`);
      const data = await res.json();
      setGrupos(data.fileGroups);
    };
    fetchGrupos();
  }, []);

  const obtenerIcono = (tipo: string) => {
    if (tipo.startsWith('image')) return null;
    if (tipo === 'application/pdf') return '/icons/pdf-icon.png';
    if (tipo === 'application/zip') return '/icons/zip-icon.png';
    return '/icons/file-icon.png';
  };

  const descargarArchivo = (fileId: string, nombreArchivo: string) => {
    const link = document.createElement('a');
    link.href = `/api/files/${fileId}`;
    link.download = nombreArchivo;
    link.click();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Grupos de Archivos Compartidos</h1>
      {grupos.map((grupo) => (
        <div key={grupo._id} className="border rounded-lg p-4 shadow-md">
          <h2 className="text-xl font-semibold mb-4">{grupo.nombreGrupo}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {grupo.archivos.map((archivo) => (
              <div
                key={archivo._id}
                className="flex flex-col items-center space-y-2"
              >
                {archivo.tipoArchivo.startsWith('image') ? (
                  <Image
                    src={`/api/files/${archivo._id}`}
                    alt={archivo.nombreArchivo}
                    width={100}
                    height={100}
                    className="rounded"
                  />
                ) : (
                  <Image
                    src={obtenerIcono(archivo.tipoArchivo)!}
                    alt="Icono"
                    width={60}
                    height={60}
                  />
                )}
                <p className="text-sm text-center">{archivo.nombreArchivo}</p>
                <button
                  className="text-blue-500 underline"
                  onClick={() =>
                    descargarArchivo(archivo._id, archivo.nombreArchivo)
                  }
                >
                  Descargar
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
