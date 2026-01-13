import { NextResponse } from 'next/server'
import { prisma } from '@lib/db'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const count = await prisma.notification.count({ where: { read: false } })
  return NextResponse.json({ count })
}
