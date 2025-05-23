'use client'
import { useEffect, useState } from 'react'

interface Archivo {
    _id: string
    nombreArchivo: string
    tipoArchivo: string
    ruta: string
}

interface Grupo {
    _id: string
    nombreGrupo: string
    archivos: Archivo[]
    creadoEn: string
}

export default function UserFileGroups({ usuarioId }: { usuarioId: string }) {
    const [grupos, setGrupos] = useState<Grupo[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchGrupos = async () => {
            const res = await fetch(`/api/file-groups/compartidos/${usuarioId}`)
            const data = await res.json()
            setGrupos(data)
            setLoading(false)
        }
        fetchGrupos()
    }, [usuarioId])

    if (loading) return <p>Cargando grupos...</p>

    if (!grupos.length) return <p>No hay archivos compartidos contigo.</p>

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Archivos Compartidos</h2>
            {grupos.map((grupo) => (
                <div key={grupo._id} className="border p-4 rounded">
                    <h3 className="text-lg font-semibold">{grupo.nombreGrupo}</h3>
                    <p className="text-sm text-gray-500">Creado el {new Date(grupo.creadoEn).toLocaleDateString()}</p>
                    <ul className="mt-2 space-y-2">
                        {grupo.archivos.map((archivo) => (
                            <li key={archivo._id} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded">
                                <span>{archivo.nombreArchivo}</span>
                                <a
                                    href={archivo.ruta}
                                    target="_blank"
                                    download
                                    className="text-blue-600 hover:underline"
                                >
                                    Descargar
                                </a>
                            </li>
                        ))}
                    </ul>

                </div>
            ))}
        </div>
    )
}
