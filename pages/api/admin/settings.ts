import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@lib/db'
import { revalidatePath } from 'next/cache'
import { verifyAdminToken } from '@lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    res.status(200).json({ ok: true })
    return
  }

	if (req.method === 'POST') {
		const token = req.cookies?.['admin_session']
		if (!verifyAdminToken(token)) {
			res.status(401).json({ error: 'Unauthorized' })
			return
		}

		try {
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
				blushColor: String(body.blushColor ?? ''),
				buttonTextColor: String(body.buttonTextColor ?? '')
			}

			await prisma.siteSetting.upsert({ where: { id: 1 }, update: data, create: data })
			try {
				revalidatePath('/', 'layout')
			} catch {
			}

			res.status(200).json({ success: true })
			return
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : 'Failed to save settings'
			res.status(500).json({ error: msg })
			return
		}
	}

  res.setHeader('Allow', ['GET', 'HEAD', 'POST'])
  res.status(405).json({ error: 'Method Not Allowed' })
}
