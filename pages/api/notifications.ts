import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    const list = await prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })
    res.status(200).json(list)
    return
  }

  if (req.method === 'POST') {
    const body = req.body ?? {}
    const id = Number((body as { id?: unknown }).id || 0)
    const read = Boolean((body as { read?: unknown }).read ?? true)
    if (!id) {
      res.status(400).json({ error: 'Missing id' })
      return
    }
    const updated = await prisma.notification.update({ where: { id }, data: { read } })
    res.status(200).json(updated)
    return
  }

  if (req.method === 'PUT') {
    await prisma.notification.updateMany({
      where: { read: false },
      data: { read: true }
    })
    res.status(200).json({ success: true })
    return
  }

  if (req.method === 'DELETE') {
    const idRaw = req.query.id
    const all = req.query.all === 'true'

    if (all) {
      await prisma.notification.deleteMany()
      res.status(200).json({ success: true })
      return
    }

    const id = Array.isArray(idRaw) ? Number(idRaw[0]) : Number(idRaw)

    if (id) {
      await prisma.notification.delete({ where: { id } })
      res.status(200).json({ success: true })
      return
    }

    res.status(400).json({ error: 'Invalid request' })
    return
  }

  res.setHeader('Allow', ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'])
  res.status(405).json({ error: 'Method Not Allowed' })
}

