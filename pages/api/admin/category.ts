import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    res.status(200).json({ ok: true })
    return
  }

  if (req.method === 'POST') {
    try {
      const { id, name, slug, imageUrl } = (req.body ?? {}) as {
        id?: unknown
        name?: unknown
        slug?: unknown
        imageUrl?: unknown
      }

      const numericId = Number(id || 0)
      const nameStr = String(name || '')
      const slugStr = String(slug || '')
      const imageUrlStr = String(imageUrl || '')

      if (!nameStr || !slugStr) {
        res.status(400).json({ error: 'Missing' })
        return
      }

      if (numericId > 0) {
        const existing = await prisma.category.findFirst({
          where: {
            slug: slugStr,
            id: { not: numericId }
          }
        })

        if (existing) {
          res.status(400).json({ error: 'Category slug already exists. Please choose another.' })
          return
        }

        try {
          await prisma.category.update({
            where: { id: numericId },
            data: { name: nameStr, slug: slugStr, imageUrl: imageUrlStr }
          })
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : 'Failed to update category'
          res.status(500).json({ error: msg })
          return
        }
      } else {
        const existing = await prisma.category.findFirst({
          where: { slug: slugStr }
        })

        if (existing) {
          res.status(400).json({ error: 'Category slug already exists. Please choose another.' })
          return
        }

        try {
          await prisma.category.create({
            data: { name: nameStr, slug: slugStr, imageUrl: imageUrlStr }
          })
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : 'Failed to create category'
          res.status(500).json({ error: msg })
          return
        }
      }

      res.status(200).json({ success: true })
      return
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to save category'
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
      await prisma.category.delete({ where: { id } })
      res.status(200).json({ success: true })
    } catch {
      res.status(500).json({ error: 'Failed to delete. Category might contain products.' })
    }
    return
  }

  res.setHeader('Allow', ['GET', 'HEAD', 'POST', 'DELETE'])
  res.status(405).json({ error: 'Method Not Allowed' })
}

