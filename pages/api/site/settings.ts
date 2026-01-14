import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    const s = await prisma.siteSetting.findFirst()
    res.status(200).json(s ?? {})
    return
  }

  res.setHeader('Allow', ['GET', 'HEAD'])
  res.status(405).json({ error: 'Method Not Allowed' })
}

