import { NextResponse } from 'next/server'
import { prisma } from '@lib/db'
import { isAdmin } from '@lib/auth'
export const runtime = 'nodejs'

export async function GET() {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [orders, messages, notifications] = await Promise.all([
    prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 200, include: { items: { include: { product: true } } } }),
    prisma.message.findMany({ orderBy: { createdAt: 'desc' }, take: 200 }),
    prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 200 })
  ])

  return NextResponse.json({
    orders,
    messages,
    notifications
  })
}
