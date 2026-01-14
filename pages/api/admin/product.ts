import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    res.status(200).json({ ok: true })
    return
  }

  if (req.method === 'POST') {
    const body = (req.body ?? {}) as {
      id?: unknown
      name?: unknown
      description?: unknown
      priceNgn?: unknown
      imageUrl?: unknown
      categoryId?: unknown
    }

    const id = Number(body.id || 0)
    const name = String(body.name || '')
    const description = String(body.description || '')
    const priceNgn = Number(body.priceNgn || 0)
    const imageUrl = String(body.imageUrl || '')
    const categoryId = Number(body.categoryId || 0)

    if (!name || !priceNgn || !imageUrl || !categoryId) {
      res.status(400).json({ error: 'Missing' })
      return
    }

    if (id > 0) {
      await prisma.product.update({
        where: { id },
        data: { name, description, priceNgn, imageUrl, categoryId }
      })
    } else {
      await prisma.product.create({ data: { name, description, priceNgn, imageUrl, categoryId } })
    }

    res.status(200).json({ success: true })
    return
  }

  if (req.method === 'DELETE') {
    const idRaw = req.query.id
    const id = Array.isArray(idRaw) ? Number(idRaw[0]) : Number(idRaw)
    if (!id) {
      res.status(400).json({ error: 'Missing ID' })
      return
    }

    await prisma.product.delete({ where: { id } })
    res.status(200).json({ success: true })
    return
  }

  res.setHeader('Allow', ['GET', 'HEAD', 'POST', 'DELETE'])
  res.status(405).json({ error: 'Method Not Allowed' })
}

