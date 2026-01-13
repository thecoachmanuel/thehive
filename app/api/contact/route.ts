/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@lib/db'
import { isValidPhoneNumber } from '@lib/utils'

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const name = String(form.get('name') || '')
  const email = String(form.get('email') || '')
  const phone = String(form.get('phone') || '')
  const message = String(form.get('message') || '')
  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  if (phone && !isValidPhoneNumber(phone)) {
    return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
  }
  // Save message to database
  const saved = await prisma.message.create({ data: { name, email, phone: phone || null, message } })
  // Create notification for admin
  await prisma.notification.create({
    data: {
      type: 'contact',
      title: 'New contact message',
      body: `${name} (${email}) sent a message: ${message.slice(0, 120)}${message.length > 120 ? '…' : ''}`
    }
  })
  const settings = await prisma.siteSetting.findFirst()
  const number = settings?.whatsappNumber ?? '08166017556'
  const intl = number.replace(/\D/g, '').replace(/^0/, '234')
  const text = encodeURIComponent(`Contact message from ${name}\nEmail/Phone: ${email}${phone ? ' / ' + phone : ''}\n\n${message}`)
  const url = `https://wa.me/${intl}?text=${text}`
  return NextResponse.redirect(url)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = Number(searchParams.get('id'))
  if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })
  try {
    await prisma.message.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
  }
}
