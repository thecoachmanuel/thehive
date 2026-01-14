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
      imageUrl?: unknown
      headline?: unknown
      subtext?: unknown
      ctaText?: unknown
      ctaLink?: unknown
    }

    const id = Number(body.id || 0)
    const imageUrl = String(body.imageUrl || '')
    const headline = String(body.headline || '')
    const subtext = String(body.subtext || '')
    const ctaText = String(body.ctaText || '')
    const ctaLink = String(body.ctaLink || '')

    if (!imageUrl || !headline || !subtext) {
      res.status(400).json({ error: 'Missing' })
      return
    }

    const data = {
      imageUrl,
      headline,
      subtext,
      ctaText: ctaText || null,
      ctaLink: ctaLink || null
    }

    if (id > 0) {
      await prisma.slide.update({ where: { id }, data })
    } else {
      await prisma.slide.create({ data })
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

    await prisma.slide.delete({ where: { id } })
    res.status(200).json({ success: true })
    return
  }

  res.setHeader('Allow', ['GET', 'HEAD', 'POST', 'DELETE'])
  res.status(405).json({ error: 'Method Not Allowed' })
}

