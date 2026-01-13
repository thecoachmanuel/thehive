import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
export const runtime = 'nodejs'

export async function POST() {
  cookies().delete('admin_session')
  cookies().delete('user_session')
  return NextResponse.redirect(new URL('/admin/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))
}
