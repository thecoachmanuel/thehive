import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@lib/db'
import { initializePayment } from '@lib/paystack'
import { isValidPhoneNumber } from '@lib/utils'

type InputItem = { productId: unknown; quantity?: unknown }
type Item = { productId: number; quantity: number }

export async function POST(req: NextRequest) {
  const body = await req.json()
  const customerName = String(body.customerName || '')
  const email = String(body.email || '')
  const phone = String(body.phone || '').trim()
  const note = String(body.note || '')
  const rawItems: unknown[] = Array.isArray(body.items) ? body.items : []
  const items: Item[] = rawItems
    .filter((x: unknown): x is InputItem => typeof x === 'object' && x !== null && 'productId' in (x as Record<string, unknown>))
    .map((i: InputItem) => ({ productId: Number(i.productId), quantity: Math.max(1, Number(i.quantity ?? 1)) }))
  if (!customerName || !email || !phone || items.length === 0) return NextResponse.json({ error: 'Missing' }, { status: 400 })
  if (!isValidPhoneNumber(phone)) return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })

  const ids = items.map((i: Item) => i.productId)
  const dbProducts = await prisma.product.findMany({ where: { id: { in: ids }, active: true } })
  const lineItems = items.map((i: Item) => {
    const p = dbProducts.find((d) => d.id === i.productId)
    return p ? { productId: p.id, quantity: i.quantity ?? 1, unitPriceNgn: p.priceNgn } : null
  }).filter((v): v is { productId: number; quantity: number; unitPriceNgn: number } => v !== null)
  if (lineItems.length === 0) return NextResponse.json({ error: 'Empty' }, { status: 400 })

  const total = lineItems.reduce((s: number, i: { unitPriceNgn: number; quantity: number }) => s + i.unitPriceNgn * i.quantity, 0)
  const order = await prisma.order.create({ data: { customerName, email, phone, totalAmountNgn: total, status: 'pending', items: { create: lineItems.map((i: { productId: number; quantity: number; unitPriceNgn: number }) => ({ ...i, note })) } } })
  await prisma.notification.create({
    data: {
      type: 'order',
      title: 'New order received',
      body: `Order #${order.id} by ${customerName} (${email})`
    }
  })
  const init = await initializePayment(total, email, { orderId: order.id, customerName, phone })
  const url = init.data.authorization_url as string
  const ref = init.data.reference as string
  await prisma.order.update({ where: { id: order.id }, data: { paystackRef: ref } })
  return NextResponse.redirect(url)
}
