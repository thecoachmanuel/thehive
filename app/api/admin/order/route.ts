import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@lib/db'
export const runtime = 'nodejs'

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, status } = body
    
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 })
    }

    const order = await prisma.order.update({
      where: { id: Number(id) },
      data: { status }
    })

    return NextResponse.json({ ok: true, order })
  } catch (error) {
    console.error('Update order error', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = Number(searchParams.get('id'))
  if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

  try {
    // Delete order items first (cascade usually handles this but explicit is safer if not set)
    await prisma.orderItem.deleteMany({ where: { orderId: id } })
    await prisma.order.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete order error', error)
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
  }
}
