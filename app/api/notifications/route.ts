import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@lib/db'

export async function GET() {
  const list = await prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })
  return NextResponse.json(list)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const id = Number(body.id || 0)
  const read = Boolean(body.read ?? true)
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const updated = await prisma.notification.update({ where: { id }, data: { read } })
  return NextResponse.json(updated)
}

export async function PUT() {
  await prisma.notification.updateMany({
    where: { read: false },
    data: { read: true }
  })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = Number(searchParams.get('id'))
  const all = searchParams.get('all') === 'true'

  if (all) {
    await prisma.notification.deleteMany()
    return NextResponse.json({ success: true })
  }

  if (id) {
    await prisma.notification.delete({ where: { id } })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}
