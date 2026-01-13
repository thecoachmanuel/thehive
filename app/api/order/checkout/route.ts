/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@lib/db'
import { initializePayment } from '@lib/paystack'
import { isValidPhoneNumber } from '@lib/utils'
import crypto from 'crypto'
import { cookies } from 'next/headers'

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return { salt, hash }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    let { items, customerName, name, email, phone, address, note, deliveryMethod, deliveryFee, createAccount, password, confirmPassword } = body

    customerName = customerName || name

    const phoneTrimmed = String(phone || '').trim()

    if (!items || items.length === 0) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    if (!customerName || !email || !phoneTrimmed) return NextResponse.json({ error: 'Missing contact info' }, { status: 400 })
    if (!isValidPhoneNumber(phoneTrimmed)) return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    if (deliveryMethod === 'delivery' && !address) return NextResponse.json({ error: 'Delivery address required' }, { status: 400 })

    // 1. Calculate Total (Server-side validation)
    let subtotal = 0
    const orderItemsData = []

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } })
      if (!product) continue // or error
      subtotal += product.priceNgn * item.quantity
      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPriceNgn: product.priceNgn,
        note
      })
    }

    // Recalculate delivery fee to be safe
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

    // 2. Handle User
    let userId: number | null = null
    const cookieStore = cookies()
    const session = cookieStore.get('user_session')

    if (session?.value) {
      userId = parseInt(session.value)
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (createAccount && password) {
      if (!confirmPassword || password !== confirmPassword) {
        return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 })
      }
      if (existingUser) {
        return NextResponse.json({ error: 'Account with this email already exists. Please login or continue as guest.' }, { status: 400 })
      }
      // Create User
      const { salt, hash } = hashPassword(password)
      const user = await prisma.user.create({
        data: {
          email,
          name: customerName,
          phone: phoneTrimmed,
          password: `${salt}:${hash}`,
          role: 'USER'
        }
      })
      userId = user.id
    } else if (existingUser && !userId) {
      // If user exists but didn't ask to create account AND is not logged in, 
      // we DO NOT link them automatically for security.
      userId = null 
    }

    // 3. Create Order
    const order = await prisma.order.create({
      data: {
        userId,
        customerName,
        email,
        phone: phoneTrimmed,
        totalAmountNgn: total,
        status: 'pending',
        deliveryMethod,
        deliveryAddress: deliveryMethod === 'delivery' ? address : null,
        deliveryFee: finalDeliveryFee,
        items: {
          create: orderItemsData
        }
      }
    })

    // 4. Create Notification
    await prisma.notification.create({
      data: {
        type: 'order',
        title: 'New order received',
        body: `Order #${order.id} by ${customerName} (${email}) - ${items.length} items`
      }
    })

    // 5. Payment
    const init = await initializePayment(total, email, { orderId: order.id, customerName })
    
    await prisma.order.update({
      where: { id: order.id },
      data: { paystackRef: init.data.reference }
    })

    return NextResponse.json({ 
      url: init.data.authorization_url,
      orderId: order.id,
      trackingCode: order.trackingCode
    })

  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e.message || 'Checkout failed' }, { status: 500 })
  }
}
