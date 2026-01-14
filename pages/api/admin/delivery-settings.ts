import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@lib/db'

type DeliverySettingsBody = {
  isActive?: string | boolean
  method?: string
  rate?: string | number
  freeThreshold?: string | number | null
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    res.status(200).json({ ok: true })
    return
  }

  if (req.method === 'POST') {
    try {
      const body = (req.body ?? {}) as DeliverySettingsBody
      const isActive = body.isActive === true || body.isActive === 'true' || body.isActive === 'on'
      const method = body.method && `${body.method}` ? String(body.method) : 'flat'
      const rate = body.rate !== undefined && body.rate !== null && `${body.rate}` !== ''
        ? Number(body.rate)
        : 1000
      const freeThresholdRaw = body.freeThreshold
      const freeThreshold = freeThresholdRaw !== undefined && freeThresholdRaw !== null && `${freeThresholdRaw}` !== ''
        ? Number(freeThresholdRaw)
        : null

      await prisma.deliverySetting.upsert({
        where: { id: 1 },
        update: { isActive, method, rate, freeThreshold },
        create: { id: 1, isActive, method, rate, freeThreshold }
      })

      res.status(200).json({ success: true })
      return
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save delivery settings'
      res.status(500).json({ error: msg })
      return
    }
  }

  res.setHeader('Allow', ['GET', 'HEAD', 'POST'])
  res.status(405).json({ error: 'Method Not Allowed' })
}
