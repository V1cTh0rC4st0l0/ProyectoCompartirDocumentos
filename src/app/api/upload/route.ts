// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectGridFS } from '@/lib/gridfs';
import { Readable } from 'stream';
import multer from 'multer';
import { promisify } from 'util';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const runMiddleware = promisify(upload.single('file'));

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const gfs = await connectGridFS();
    const filename = file.name;
    const contentType = file.type;

    const stream = gfs.openUploadStream(filename, { contentType });
    Readable.from(buffer).pipe(stream);

    return new Promise((resolve, reject) => {
        stream.on('finish', () => {
            resolve(NextResponse.json({ ok: true, fileId: stream.id }));
        });
        stream.on('error', (err) => {
            reject(NextResponse.json({ ok: false, error: err.message }));
        });
    });
}
