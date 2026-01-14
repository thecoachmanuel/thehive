import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    res.status(200).json({ ok: true })
    return
  }

  if (req.method === 'PUT') {
    try {
      const body = (req.body ?? {}) as { id?: unknown; status?: unknown }
      const id = body.id
      const status = body.status

      if (!id || !status) {
        res.status(400).json({ error: 'Missing id or status' })
        return
      }

      const order = await prisma.order.update({
        where: { id: Number(id) },
        data: { status: String(status) }
      })

      res.status(200).json({ ok: true, order })
      return
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to update order'
      res.status(500).json({ error: msg })
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
      await prisma.orderItem.deleteMany({ where: { orderId: id } })
      await prisma.order.delete({ where: { id } })
      res.status(200).json({ success: true })
      return
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to delete order'
      res.status(500).json({ error: msg })
      return
    }
  }

  res.setHeader('Allow', ['GET', 'HEAD', 'PUT', 'DELETE'])
  res.status(405).json({ error: 'Method Not Allowed' })
}

