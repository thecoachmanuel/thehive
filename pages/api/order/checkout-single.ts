import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@lib/db'
import { initializePayment } from '@lib/paystack'
import { isValidPhoneNumber } from '@lib/utils'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    res.status(200).json({ ok: true })
    return
  }

  if (req.method === 'POST') {
    const productId = Number((req.body as { productId?: unknown }).productId || 0)
    const quantity = Number((req.body as { quantity?: unknown }).quantity || 0)
    const customerName = String((req.body as { customerName?: unknown }).customerName || '')
    const email = String((req.body as { email?: unknown }).email || '')
    const phone = String((req.body as { phone?: unknown }).phone || '').trim()
    const note = String((req.body as { note?: unknown }).note || '')

    if (!productId || quantity < 1 || !customerName || !email || !phone) {
      res.status(400).json({ error: 'Missing fields' })
      return
    }

    if (!isValidPhoneNumber(phone)) {
      res.status(400).json({ error: 'Invalid phone number' })
      return
    }

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product || !product.active) {
      res.status(404).json({ error: 'Product unavailable' })
      return
    }

    const total = product.priceNgn * quantity
    const order = await prisma.order.create({
      data: {
        customerName,
        email,
        phone,
        totalAmountNgn: total,
        status: 'Order received',
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

    res.writeHead(302, { Location: url })
    res.end()
    return
  }

  res.setHeader('Allow', ['GET', 'HEAD', 'POST'])
  res.status(405).json({ error: 'Method Not Allowed' })
}
