import { NextResponse } from 'next/server'
import { IncomingForm } from 'formidable'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import { connectDB } from '@/lib/mongodb'
import FileGroup from '@/models/FileGroup'

export const config = {
    api: {
        bodyParser: false,
    },
}

const uploadDir = path.join(process.cwd(), 'public', 'uploads')
fs.mkdirSync(uploadDir, { recursive: true })

export async function POST(req: Request) {
    await connectDB()

    const form = new IncomingForm({ multiples: true, uploadDir, keepExtensions: true })

    const parseForm = () =>
        new Promise((resolve, reject) => {
            form.parse(req as any, (err, fields, files) => {
                if (err) reject(err)
                else resolve({ fields, files })
            })
        })

    const { fields, files }: any = await parseForm()
    const nombreGrupo = fields.nombreGrupo?.[0]
    const usuarioId = fields.usuarioId?.[0] || null // lo puedes pasar si quieres guardar quién sube

    if (!nombreGrupo || !files.archivos) {
        return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    const archivos = Array.isArray(files.archivos) ? files.archivos : [files.archivos]

    const fileDocs = archivos.map((file) => ({
        nombreArchivo: file.originalFilename,
        tipoArchivo: file.mimetype,
        ruta: `/uploads/${path.basename(file.filepath)}`,
    }))

    const nuevoGrupo = await FileGroup.create({
        nombreGrupo,
        archivos: fileDocs,
        creadoPor: usuarioId,
    })

    return NextResponse.json({ success: true, grupo: nuevoGrupo })
}
