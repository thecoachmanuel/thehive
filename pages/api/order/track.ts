import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    const id = typeof req.query.id === 'string' ? req.query.id : Array.isArray(req.query.id) ? req.query.id[0] : undefined
    const emailRaw = typeof req.query.email === 'string' ? req.query.email : Array.isArray(req.query.email) ? req.query.email[0] : undefined
    const email = emailRaw && emailRaw.trim() ? emailRaw.trim() : undefined

    if (!id) {
      res.status(400).json({ error: 'Missing ID or Tracking Code' })
      return
    }

    const isNumeric = /^\d+$/.test(id)
    let order

    if (email) {
      order = await prisma.order.findFirst({
        where: {
          AND: [
            { email },
            {
              OR: [
                isNumeric ? { id: Number(id) } : {},
                { trackingCode: id }
              ]
            }
          ]
        },
        include: {
          items: {
            include: { product: true }
          }
        }
      })
    } else {
      order = await prisma.order.findFirst({
        where: isNumeric ? { id: Number(id) } : { trackingCode: id },
        include: {
          items: {
            include: { product: true }
          }
        }
      })
    }

    if (!order) {
      res.status(404).json({ error: 'Order not found' })
      return
    }

    res.status(200).json(order)
    return
  }

  res.setHeader('Allow', ['GET', 'HEAD'])
  res.status(405).json({ error: 'Method Not Allowed' })
}
