import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@lib/db'
import crypto from 'crypto'

function verifyPassword(password: string, storedValue: string) {
	if (!storedValue) return false

	const parts = storedValue.split(':')
	if (parts.length === 2 && parts[0] && parts[1]) {
		const [salt, hash] = parts
		const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
		return hash === verifyHash
	}

	return storedValue === password
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    res.status(200).json({ ok: true })
    return
  }

	if (req.method === 'OPTIONS') {
		res.setHeader('Allow', ['GET', 'HEAD', 'POST'])
		res.status(204).end()
		return
	}

  if (req.method === 'POST') {
    try {
      const body = req.body ?? {}
      const email = (body as { email?: unknown }).email
      const password = (body as { password?: unknown }).password

      const emailStr = typeof email === 'string' ? email.trim() : ''
      const passwordStr = typeof password === 'string' ? password : ''

      if (!emailStr || !passwordStr) {
        res.status(400).json({ error: 'Missing credentials' })
        return
      }

      const user = await prisma.user.findUnique({ where: { email: emailStr } })

      if (!user || !user.password || !verifyPassword(passwordStr, user.password)) {
        res.status(401).json({ error: 'Invalid email or password' })
        return
      }

      const userId = String(user.id)

      const userCookieParts = [
        `user_session=${encodeURIComponent(userId)}`,
        'HttpOnly',
        'Path=/',
        `Max-Age=${60 * 60 * 24 * 7}`,
        process.env.NODE_ENV === 'production' ? 'Secure' : '',
        'SameSite=Lax'
      ].filter(Boolean)

      const clearAdminCookieParts = [
        'admin_session=',
        'HttpOnly',
        'Path=/',
        'Max-Age=0',
        process.env.NODE_ENV === 'production' ? 'Secure' : '',
        'SameSite=Lax'
      ].filter(Boolean)

      res.setHeader('Set-Cookie', [userCookieParts.join('; '), clearAdminCookieParts.join('; ')])

      res.status(200).json({ success: true, user: { id: user.id, name: user.name, email: user.email } })
      return
    } catch (error) {
      console.error('Login error:', error)
      res.status(500).json({ error: 'Internal server error' })
      return
    }
  }

  res.setHeader('Allow', ['GET', 'HEAD', 'POST'])
  res.status(405).json({ error: 'Method Not Allowed' })
}
