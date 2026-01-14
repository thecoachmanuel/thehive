import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@lib/db'
import { isValidPhoneNumber } from '@lib/utils'

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
        const text = buffer.toString('utf8')

        const nameMatch = text.match(/name\"\r\n\r\n([^\r\n]+)/)
        const emailMatch = text.match(/email\"\r\n\r\n([^\r\n]+)/)
        const phoneMatch = text.match(/phone\"\r\n\r\n([^\r\n]+)/)
        const messageMatch = text.match(/message\"\r\n\r\n([\s\S]*)/)

        const name = nameMatch?.[1]?.trim() ?? ''
        const email = emailMatch?.[1]?.trim() ?? ''
        const phone = phoneMatch?.[1]?.trim() ?? ''
        const message = messageMatch?.[1]?.trim() ?? ''

        if (!name || !email || !message) {
          res.status(400).json({ error: 'Missing fields' })
          return
        }

        if (phone && !isValidPhoneNumber(phone)) {
          res.status(400).json({ error: 'Invalid phone number' })
          return
        }

        await prisma.message.create({
          data: {
            name,
            email,
            phone: phone || null,
            message
          }
        })

        await prisma.notification.create({
          data: {
            type: 'contact',
            title: 'New contact message',
            body: `${name} (${email}) sent a message: ${message.slice(0, 120)}${message.length > 120 ? '…' : ''}`
          }
        })

        const settings = await prisma.siteSetting.findFirst()
        const number = settings?.whatsappNumber ?? '08166017556'
        const intl = number.replace(/\D/g, '').replace(/^0/, '234')
        const textMsg = encodeURIComponent(
          `Contact message from ${name}\nEmail/Phone: ${email}${phone ? ' / ' + phone : ''}\n\n${message}`
        )
        const url = `https://wa.me/${intl}?text=${textMsg}`

        res.writeHead(302, { Location: url })
        res.end()
      })

      return
    } catch {
      res.status(500).json({ error: 'Failed to submit message' })
      return
    }
  }

  if (req.method === 'DELETE') {
    const idRaw = req.query.id
    const id = Array.isArray(idRaw) ? Number(idRaw[0]) : Number(idRaw)

    if (!id) {
      res.status(400).json({ error: 'Missing ID' })
      return
    }

    try {
      await prisma.message.delete({ where: { id } })
      res.status(200).json({ success: true })
      return
    } catch {
      res.status(500).json({ error: 'Failed to delete message' })
      return
    }
  }

  res.setHeader('Allow', ['GET', 'HEAD', 'POST', 'DELETE'])
  res.status(405).json({ error: 'Method Not Allowed' })
}
