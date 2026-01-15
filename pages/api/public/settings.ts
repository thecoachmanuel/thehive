import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    try {
      const s = await prisma.siteSetting.findFirst()
      res.status(200).json({ businessName: s?.businessName, logoUrl: s?.logoUrl, whatsappNumber: s?.whatsappNumber })
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
    return
  }

  res.setHeader('Allow', ['GET', 'HEAD'])
  res.status(405).json({ error: 'Method Not Allowed' })
}

