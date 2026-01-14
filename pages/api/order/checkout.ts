import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@lib/db'
import { initializePayment } from '@lib/paystack'
import { isValidPhoneNumber } from '@lib/utils'
import crypto from 'crypto'

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return { salt, hash }
}

type CheckoutBody = {
  items?: Array<{ productId: number; quantity: number }>
  customerName?: string
  name?: string
  email?: string
  phone?: string
  address?: string
  note?: string
  deliveryMethod?: string
  deliveryFee?: number
  createAccount?: boolean
  password?: string
  confirmPassword?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    res.status(200).json({ ok: true })
    return
  }

  if (req.method === 'POST') {
    try {
      const body = (req.body ?? {}) as CheckoutBody

      const items = Array.isArray(body.items) ? body.items : []
      const customerName = body.customerName || body.name || ''
      const email = body.email || ''
      const phoneRaw = body.phone || ''
      const address = body.address || ''
      const note = body.note || ''
      const deliveryMethod = body.deliveryMethod || ''
      const createAccount = Boolean(body.createAccount)
      const password = body.password || ''
      const confirmPassword = body.confirmPassword || ''

      const phone = String(phoneRaw || '').trim()

      if (!items || items.length === 0) {
        res.status(400).json({ error: 'Cart is empty' })
        return
      }
      if (!customerName || !email || !phone) {
        res.status(400).json({ error: 'Missing contact info' })
        return
      }
      if (!isValidPhoneNumber(phone)) {
        res.status(400).json({ error: 'Invalid phone number' })
        return
      }
      if (deliveryMethod === 'delivery' && !address) {
        res.status(400).json({ error: 'Delivery address required' })
        return
      }

      let subtotal = 0
      const orderItemsData: Array<{ productId: number; quantity: number; unitPriceNgn: number; note: string }> = []

      for (const item of items) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } })
        if (!product) continue
        subtotal += product.priceNgn * item.quantity
        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPriceNgn: product.priceNgn,
          note
        })
      }

      let finalDeliveryFee = 0
      if (deliveryMethod === 'delivery') {
        const settings = await prisma.deliverySetting.findFirst()
        if (settings && settings.isActive) {
          if (settings.freeThreshold && subtotal >= settings.freeThreshold) {
            finalDeliveryFee = 0
          } else if (settings.method === 'percentage') {
            finalDeliveryFee = Math.round(subtotal * (settings.rate / 100))
          } else {
            finalDeliveryFee = settings.rate
          }
        }
      }

      const total = subtotal + finalDeliveryFee

      let userId: number | null = null

      const existingUser = email
        ? await prisma.user.findUnique({ where: { email } })
        : null

      if (createAccount && password) {
        if (!confirmPassword || password !== confirmPassword) {
          res.status(400).json({ error: 'Passwords do not match' })
          return
        }
        if (existingUser) {
          res.status(400).json({ error: 'Account with this email already exists. Please login or continue as guest.' })
          return
        }
        const { salt, hash } = hashPassword(password)
        const user = await prisma.user.create({
          data: {
            email,
            name: customerName,
            phone,
            password: `${salt}:${hash}`,
            role: 'USER'
          }
        })
        userId = user.id
      } else if (existingUser) {
        userId = null
      }

      const order = await prisma.order.create({
        data: {
          userId,
          customerName,
          email,
          phone,
          totalAmountNgn: total,
          status: 'pending',
          deliveryMethod,
          deliveryAddress: deliveryMethod === 'delivery' ? address : null,
          deliveryFee: finalDeliveryFee,
          items: { create: orderItemsData }
        }
      })

      await prisma.notification.create({
        data: {
          type: 'order',
          title: 'New order received',
          body: `Order #${order.id} by ${customerName} (${email}) - ${items.length} items`
        }
      })

      const init = await initializePayment(total, email, { orderId: order.id, customerName })

      await prisma.order.update({
        where: { id: order.id },
        data: { paystackRef: init.data.reference as string }
      })

      res.status(200).json({
        url: init.data.authorization_url as string,
        orderId: order.id,
        trackingCode: order.trackingCode
      })
      return
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Checkout failed'
      console.error(e)
      res.status(500).json({ error: msg })
      return
    }
  }

  res.setHeader('Allow', ['GET', 'HEAD', 'POST'])
  res.status(405).json({ error: 'Method Not Allowed' })
}
