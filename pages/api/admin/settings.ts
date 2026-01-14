import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@lib/db'
import { revalidatePath } from 'next/cache'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    res.status(200).json({ ok: true })
    return
  }

  if (req.method === 'POST') {
    const body = (req.body ?? {}) as Record<string, unknown>

    const data = {
      businessName: String(body.businessName ?? ''),
      location: String(body.location ?? ''),
      yearsExperience: Number(body.yearsExperience ?? 0),
      tagline: String(body.tagline ?? ''),
      whatsappNumber: String(body.whatsappNumber ?? ''),
      instagram: String(body.instagram ?? ''),
      tiktok: String(body.tiktok ?? ''),
      logoUrl: String(body.logoUrl ?? ''),
      primaryColor: String(body.primaryColor ?? ''),
      accentColor: String(body.accentColor ?? ''),
      creamColor: String(body.creamColor ?? ''),
      peachColor: String(body.peachColor ?? ''),
      blushColor: String(body.blushColor ?? '')
    }

    await prisma.siteSetting.upsert({ where: { id: 1 }, update: data, create: data })
    try {
      revalidatePath('/', 'layout')
    } catch {
      // revalidatePath is best-effort in this context
    }

    res.status(200).json({ success: true })
    return
  }

  res.setHeader('Allow', ['GET', 'HEAD', 'POST'])
  res.status(405).json({ error: 'Method Not Allowed' })
}

