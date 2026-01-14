import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@lib/db'
import crypto from 'crypto'
import { isValidPhoneNumber } from '@lib/utils'

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return { salt, hash }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    res.status(200).json({ ok: true })
    return
  }

  if (req.method === 'POST') {
    try {
      const body = req.body ?? {}

      const name = (body as { name?: unknown }).name
      const email = (body as { email?: unknown }).email
      const password = (body as { password?: unknown }).password
      const confirmPassword = (body as { confirmPassword?: unknown }).confirmPassword
      const phone = (body as { phone?: unknown }).phone

      const nameStr = typeof name === 'string' ? name.trim() : ''
      const emailStr = typeof email === 'string' ? email.trim() : ''
      const passwordStr = typeof password === 'string' ? password : ''
      const confirmPasswordStr = typeof confirmPassword === 'string' ? confirmPassword : ''
      const phoneStrRaw = typeof phone === 'string' ? phone : ''

      if (!nameStr || !emailStr || !passwordStr || !confirmPasswordStr) {
        res.status(400).json({ error: 'Missing required fields' })
        return
      }

      if (passwordStr !== confirmPasswordStr) {
        res.status(400).json({ error: 'Passwords do not match' })
        return
      }

      const phoneTrimmed = phoneStrRaw.trim()
      if (phoneTrimmed && !isValidPhoneNumber(phoneTrimmed)) {
        res.status(400).json({ error: 'Invalid phone number' })
        return
      }

      const existingUser = await prisma.user.findUnique({ where: { email: emailStr } })
      if (existingUser) {
        res.status(400).json({ error: 'Email already registered' })
        return
      }

      const { salt, hash } = hashPassword(passwordStr)

      const user = await prisma.user.create({
        data: {
          name: nameStr,
          email: emailStr,
          phone: phoneTrimmed || null,
          password: `${salt}:${hash}`
        }
      })

      await prisma.notification.create({
        data: {
          type: 'user',
          title: 'New user registration',
          body: `User ${nameStr} (${emailStr}) just signed up.`
        }
      })

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
      console.error('Registration error:', error)
      res.status(500).json({ error: 'Internal server error' })
      return
    }
  }

  res.setHeader('Allow', ['GET', 'HEAD', 'POST'])
  res.status(405).json({ error: 'Method Not Allowed' })
}

