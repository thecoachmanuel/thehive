import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    const count = await prisma.notification.count({ where: { read: false } })
    res.status(200).json({ count })
    return
  }

  res.setHeader('Allow', ['GET', 'HEAD'])
  res.status(405).json({ error: 'Method Not Allowed' })
}

