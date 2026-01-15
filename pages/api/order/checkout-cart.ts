import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@lib/db'
import { initializePayment } from '@lib/paystack'
import { isValidPhoneNumber } from '@lib/utils'

type InputItem = { productId: unknown; quantity?: unknown }
type Item = { productId: number; quantity: number }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    res.status(200).json({ ok: true })
    return
  }

  if (req.method === 'POST') {
    const body = req.body ?? {}
    const customerName = String((body as { customerName?: unknown }).customerName || '')
    const email = String((body as { email?: unknown }).email || '')
    const phone = String((body as { phone?: unknown }).phone || '').trim()
    const note = String((body as { note?: unknown }).note || '')
    const rawItems: unknown[] = Array.isArray((body as { items?: unknown[] }).items)
      ? ((body as { items?: unknown[] }).items as unknown[])
      : []

    const items: Item[] = rawItems
      .filter((x: unknown): x is InputItem => typeof x === 'object' && x !== null && 'productId' in (x as Record<string, unknown>))
      .map((i: InputItem) => ({ productId: Number(i.productId), quantity: Math.max(1, Number(i.quantity ?? 1)) }))

    if (!customerName || !email || !phone || items.length === 0) {
      res.status(400).json({ error: 'Missing' })
      return
    }

    if (!isValidPhoneNumber(phone)) {
      res.status(400).json({ error: 'Invalid phone number' })
      return
    }

    const ids = items.map((i: Item) => i.productId)
    const dbProducts = await prisma.product.findMany({ where: { id: { in: ids }, active: true } })
		const lineItems = items
			.map((i: Item) => {
				const p = dbProducts.find((d: { id: number }) => d.id === i.productId)
				return p ? { productId: p.id, quantity: i.quantity ?? 1, unitPriceNgn: p.priceNgn } : null
			})
      .filter((v): v is { productId: number; quantity: number; unitPriceNgn: number } => v !== null)

    if (lineItems.length === 0) {
      res.status(400).json({ error: 'Empty' })
      return
    }

    const total = lineItems.reduce(
      (s: number, i: { unitPriceNgn: number; quantity: number }) => s + i.unitPriceNgn * i.quantity,
      0
    )

    const order = await prisma.order.create({
      data: {
        customerName,
        email,
        phone,
        totalAmountNgn: total,
        status: 'Order received',
        items: {
          create: lineItems.map((i: { productId: number; quantity: number; unitPriceNgn: number }) => ({ ...i, note }))
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

    const init = await initializePayment(total, email, { orderId: order.id, customerName, phone })
    const url = init.data.authorization_url as string
    const ref = init.data.reference as string
    await prisma.order.update({ where: { id: order.id }, data: { paystackRef: ref } })

    res.writeHead(302, { Location: url })
    res.end()
    return
  }

  res.setHeader('Allow', ['GET', 'HEAD', 'POST'])
  res.status(405).json({ error: 'Method Not Allowed' })
}
