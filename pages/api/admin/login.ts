import type { NextApiRequest, NextApiResponse } from 'next'
import { setAdminSession } from '@lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    res.status(200).json({ ok: true })
    return
  }

  if (req.method === 'POST') {
    const body = req.body ?? {}
    const usernameRaw = (body as { username?: unknown }).username
    const passwordRaw = (body as { password?: unknown }).password

    const u = String(usernameRaw || '')
    const p = String(passwordRaw || '')
    const U = process.env.ADMIN_USERNAME || 'admin'
    const P = process.env.ADMIN_PASSWORD || 'admin123'

    const hasUserSession = Boolean(req.cookies?.['user_session'])
    if (hasUserSession) {
      res.status(409).json({ error: 'Please log out of your user account before logging in as admin.' })
      return
    }

    if (u === U && p === P) {
      const token = await setAdminSession()

      if (token) {
        const cookie = [
          `admin_session=${token}`,
          'HttpOnly',
          'Path=/',
          'Max-Age=14400',
          process.env.NODE_ENV === 'production' ? 'Secure' : ''
        ]
          .filter(Boolean)
          .join('; ')

        res.setHeader('Set-Cookie', cookie)
      }

      res.status(200).json({ ok: true })
      return
    }

    res.status(401).json({ error: 'Invalid credentials' })
    return
  }

  res.setHeader('Allow', ['GET', 'HEAD', 'POST'])
  res.status(405).json({ error: 'Method Not Allowed' })
}
