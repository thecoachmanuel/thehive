import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@lib/db'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const email = searchParams.get('email')

  if (!id || !email) return NextResponse.json({ error: 'Missing ID or Email' }, { status: 400 })

  // Try finding by ID (if numeric) or Tracking Code
  const isNumeric = /^\d+$/.test(id)
  
  const order = await prisma.order.findFirst({
    where: {
      AND: [
        { email },
        {
          OR: [
            isNumeric ? { id: Number(id) } : {},
            { trackingCode: id }
          ]
        }
      ]
    },
    include: {
      items: {
        include: { product: true }
      }
    }
  })

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  return NextResponse.json(order)
}
