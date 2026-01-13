import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@lib/db'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const id = Number(form.get('id') || 0)
  const name = String(form.get('name') || '')
  const description = String(form.get('description') || '')
  const priceNgn = Number(form.get('priceNgn') || 0)
  const imageUrl = String(form.get('imageUrl') || '')
  const categoryId = Number(form.get('categoryId') || 0)

  if (!name || !priceNgn || !imageUrl || !categoryId) {
    return NextResponse.json({ error: 'Missing' }, { status: 400 })
  }

  if (id > 0) {
    await prisma.product.update({
      where: { id },
      data: { name, description, priceNgn, imageUrl, categoryId }
    })
  } else {
    await prisma.product.create({ data: { name, description, priceNgn, imageUrl, categoryId } })
  }
  
  return NextResponse.redirect(new URL('/admin?tab=products', req.url))
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = Number(searchParams.get('id'))
  if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })
  await prisma.product.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
