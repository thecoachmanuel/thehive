import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@lib/db'
import { Prisma } from '@prisma/client'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import { isValidPhoneNumber } from '@lib/utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
export const preferredRegion = 'home'

export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
}

export async function HEAD() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
}

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

export async function PUT(req: NextRequest) {
  const cookieStore = cookies()
  const session = cookieStore.get('user_session')
  if (!session?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = parseInt(session.value)
  const body = await req.json()
  const { name, phone, currentPassword, newPassword } = body

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const updateData: Prisma.UserUpdateInput = {}
  if (typeof name === 'string') updateData.name = name
  if (typeof phone === 'string') {
    const trimmed = phone.trim()
    if (trimmed && !isValidPhoneNumber(trimmed)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }
    updateData.phone = trimmed || null
  }

  if (newPassword) {
    if (!currentPassword) {
       return NextResponse.json({ error: 'Current password is required to set a new one' }, { status: 400 })
    }
    
    // Check if user has a password (they might have registered via social or something else if implemented later)
    if (!user.password) {
        return NextResponse.json({ error: 'No password set for this account' }, { status: 400 })
    }
    
    const isValid = verifyPassword(currentPassword, user.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 })
    }

    const { salt, hash } = hashPassword(newPassword)
    updateData.password = `${salt}:${hash}`
  }

  await prisma.user.update({
    where: { id: userId },
    data: updateData
  })

  return NextResponse.json({ success: true })
}
