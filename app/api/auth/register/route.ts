import { NextResponse } from 'next/server'
import { prisma } from '@lib/db'
import crypto from 'crypto'
import { cookies } from 'next/headers'
import { isValidPhoneNumber } from '@lib/utils'

export const runtime = 'nodejs'

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return { salt, hash }
}

export async function POST(request: Request) {
  try {
    const { name, email, password, confirmPassword, phone } = await request.json()

    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 })
    }

    const phoneTrimmed = typeof phone === 'string' ? phone.trim() : ''
    if (phoneTrimmed && !isValidPhoneNumber(phoneTrimmed)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    const { salt, hash } = hashPassword(password)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phoneTrimmed || null,
        password: `${salt}:${hash}`
      }
    })

    await prisma.notification.create({
      data: {
        type: 'user',
        title: 'New user registration',
        body: `User ${name} (${email}) just signed up.`
      }
    })

    cookies().set('user_session', user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
    
    // Ensure no admin session is active
    cookies().delete('admin_session')

    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
