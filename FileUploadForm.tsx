'use client'
import { useState } from 'react'

export default function FileUploadForm() {
    const [nombreGrupo, setNombreGrupo] = useState('')
    const [archivos, setArchivos] = useState<FileList | null>(null)
    const [mensaje, setMensaje] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!nombreGrupo || !archivos) {
            setMensaje('Completa todos los campos.')
            return
        }

        const formData = new FormData()
        formData.append('nombreGrupo', nombreGrupo)
        // Opcionalmente añade el ID del admin logueado
        // formData.append('usuarioId', '123')

        for (let i = 0; i < archivos.length; i++) {
            formData.append('archivos', archivos[i])
        }

        const res = await fetch('/api/file-groups', {
            method: 'POST',
            body: formData,
        })

        if (res.ok) {
            setMensaje('Grupo subido correctamente.')
            setNombreGrupo('')
            setArchivos(null)
        } else {
            setMensaje('Error al subir los archivos.')
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded">
            <h2 className="text-xl font-bold">Subir grupo de archivos</h2>
            <input
                type="text"
                placeholder="Nombre del grupo"
                className="w-full border px-3 py-2 rounded"
                value={nombreGrupo}
                onChange={(e) => setNombreGrupo(e.target.value)}
            />
            <input
                type="file"
                multiple
                onChange={(e) => setArchivos(e.target.files)}
                className="w-full"
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Subir</button>
            {mensaje && <p className="text-sm text-green-600">{mensaje}</p>}
        </form>
    )
}
