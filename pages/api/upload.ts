import type { NextApiRequest, NextApiResponse } from 'next'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export const config = {
  api: {
    bodyParser: false
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    res.status(200).json({ ok: true })
    return
  }

  if (req.method === 'POST') {
    try {
      if (!req.headers['content-type']?.includes('multipart/form-data')) {
        res.status(400).json({ error: 'Invalid content type' })
        return
      }

      const chunks: Buffer[] = []

      req.on('data', (chunk) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
      })

      req.on('end', async () => {
        const buffer = Buffer.concat(chunks)

        const match = req.headers['content-type']?.match(/boundary=(.*)$/)
        const boundary = match?.[1]

        if (!boundary) {
          res.status(400).json({ error: 'Missing boundary' })
          return
        }

        const parts = buffer.toString('binary').split(`--${boundary}`)
        const filePart = parts.find((part) => part.includes('name="file"'))

        if (!filePart) {
          res.status(400).json({ error: 'No file uploaded' })
          return
        }

        const headerEndIndex = filePart.indexOf('\r\n\r\n')
        const headerSection = filePart.substring(0, headerEndIndex)
        const contentSection = filePart.substring(headerEndIndex + 4, filePart.lastIndexOf('\r\n'))

        const filenameMatch = headerSection.match(/filename="(.+?)"/)
        const filenameOriginal = filenameMatch?.[1] || 'upload'
        const ext = filenameOriginal.includes('.') ? filenameOriginal.split('.').pop() : 'bin'

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        const filename = `image-${uniqueSuffix}.${ext}`

        const uploadDir = join(process.cwd(), 'public', 'uploads')
        await mkdir(uploadDir, { recursive: true })

        const filepath = join(uploadDir, filename)
        await writeFile(filepath, Buffer.from(contentSection, 'binary'))

        const url = `/uploads/${filename}`
        res.status(200).json({ url })
      })

      return
    } catch (error) {
      console.error('Upload error:', error)
      res.status(500).json({ error: 'Upload failed' })
      return
    }
  }

  res.setHeader('Allow', ['GET', 'HEAD', 'POST'])
  res.status(405).json({ error: 'Method Not Allowed' })
}

