import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@lib/db'
import { isAdmin } from '@lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'HEAD') {
    res.status(200).end()
    return
  }

  if (req.method === 'GET') {
    if (!isAdmin()) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const [settings, categories, products, slides, orders, messages, notifications, deliverySettings] =
      await Promise.all([
        prisma.siteSetting.findFirst(),
        prisma.category.findMany(),
        prisma.product.findMany(),
        prisma.slide.findMany(),
        prisma.order.findMany({
          orderBy: { createdAt: 'desc' },
          take: 200,
          include: { items: { include: { product: true } } }
        }),
        prisma.message.findMany({ orderBy: { createdAt: 'desc' }, take: 200 }),
        prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 200 }),
        prisma.deliverySetting.findFirst()
      ])

    res.status(200).json({ settings, categories, products, slides, orders, messages, notifications, deliverySettings })
    return
  }

  if (req.method === 'POST') {
    if (!isAdmin()) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    res.status(200).json({ ok: true })
    return
  }

  res.setHeader('Allow', ['GET', 'HEAD', 'POST'])
  res.status(405).json({ error: 'Method Not Allowed' })
}
