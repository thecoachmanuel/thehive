import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@lib/db'
import { initializePayment } from '@lib/paystack'
import { isValidPhoneNumber } from '@lib/utils'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const productId = Number(form.get('productId') || 0)
  const quantity = Number(form.get('quantity') || 0)
  const customerName = String(form.get('customerName') || '')
  const email = String(form.get('email') || '')
  const phone = String(form.get('phone') || '').trim()
  const note = String(form.get('note') || '')

  if (!productId || quantity < 1 || !customerName || !email || !phone) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  if (!isValidPhoneNumber(phone)) return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product || !product.active) return NextResponse.json({ error: 'Product unavailable' }, { status: 404 })

  const total = product.priceNgn * quantity
  const order = await prisma.order.create({
    data: {
      customerName,
      email,
      phone,
      totalAmountNgn: total,
      status: 'pending',
      items: {
        create: [{ productId, quantity, unitPriceNgn: product.priceNgn, note }]
      }
    }
  })
  await prisma.notification.create({
    data: {
      type: 'order',
      title: 'New order received',
      body: `Order #${order.id} by ${customerName} (${email})`
    }
  })

  const init = await initializePayment(total, email, { orderId: order.id, productId, quantity, customerName, phone })
  const url = init.data.authorization_url as string
  const ref = init.data.reference as string
  await prisma.order.update({ where: { id: order.id }, data: { paystackRef: ref } })
  return NextResponse.redirect(url)
}
