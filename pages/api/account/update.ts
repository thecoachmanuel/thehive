import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@lib/db'
import { Prisma } from '@prisma/client'
import crypto from 'crypto'
import { isValidPhoneNumber } from '@lib/utils'

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return { salt, hash }
}

function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(':')
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return hash === verifyHash
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    res.status(200).json({ ok: true })
    return
  }

  if (req.method !== 'PUT') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  try {
    const session = req.cookies?.['user_session']
    if (!session) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const userId = parseInt(session)
    const { name, phone, currentPassword, newPassword } = req.body ?? {}

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const updateData: Prisma.UserUpdateInput = {}
    if (typeof name === 'string') updateData.name = name
    if (typeof phone === 'string') {
      const trimmed = phone.trim()
      if (trimmed && !isValidPhoneNumber(trimmed)) {
        res.status(400).json({ error: 'Invalid phone number' })
        return
      }
      updateData.phone = trimmed || null
    }

    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({ error: 'Current password is required to set a new one' })
        return
      }
      if (!user.password) {
        res.status(400).json({ error: 'No password set for this account' })
        return
      }
      const isValid = verifyPassword(currentPassword, user.password)
      if (!isValid) {
        res.status(400).json({ error: 'Incorrect current password' })
        return
      }
      const { salt, hash } = hashPassword(newPassword)
      updateData.password = `${salt}:${hash}`
    }

    await prisma.user.update({ where: { id: userId }, data: updateData })
    res.status(200).json({ success: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    res.status(500).json({ error: msg })
  }
}

