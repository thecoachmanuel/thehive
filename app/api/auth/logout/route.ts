import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  cookies().delete('user_session')
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))
}
