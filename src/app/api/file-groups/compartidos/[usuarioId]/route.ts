import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import FileGroup from '@/models/FileGroup'

export async function GET(_: Request, { params }: { params: { usuarioId: string } }) {
    await connectDB()

    const grupos = await FileGroup.find({ compartidoCon: params.usuarioId })
    return NextResponse.json(grupos)
}
