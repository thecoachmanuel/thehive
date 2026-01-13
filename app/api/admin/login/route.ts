import { NextRequest, NextResponse } from 'next/server'
import { setAdminSession } from '@lib/auth'
import { cookies } from 'next/headers'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const u = String(body.username || '')
  const p = String(body.password || '')
  const U = process.env.ADMIN_USERNAME || 'admin'
  const P = process.env.ADMIN_PASSWORD || 'admin123'

  const hasUserSession = !!cookies().get('user_session')?.value
  if (hasUserSession) {
    return NextResponse.json({ error: 'Please log out of your user account before logging in as admin.' }, { status: 409 })
  }

  if (u === U && p === P) {
    await setAdminSession()
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
}
