import { NextResponse } from 'next/server'
import { prisma } from '@lib/db'

export async function GET() {
  const count = await prisma.notification.count({ where: { read: false } })
  return NextResponse.json({ count })
}
