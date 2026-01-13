/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@lib/db'

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const id = Number(form.get('id') || 0)
  const name = String(form.get('name') || '')
  const slug = String(form.get('slug') || '')
  const imageUrl = String(form.get('imageUrl') || '')
  if (!name || !slug) return NextResponse.json({ error: 'Missing' }, { status: 400 })
  
  if (id > 0) {
    // Check for duplicate slug excluding current category
    const existing = await prisma.category.findFirst({
      where: { 
        slug, 
        id: { not: id } 
      }
    })
    if (existing) {
      return NextResponse.json({ error: 'Category slug already exists. Please choose another.' }, { status: 400 })
    }

    try {
      await prisma.category.update({ where: { id }, data: { name, slug, imageUrl } })
    } catch (e: any) {
      console.error(e)
      return NextResponse.json({ error: e.message || 'Failed to update category' }, { status: 500 })
    }
  } else {
    // Check for duplicate slug
    const existing = await prisma.category.findFirst({
      where: { slug }
    })
    if (existing) {
      return NextResponse.json({ error: 'Category slug already exists. Please choose another.' }, { status: 400 })
    }

    try {
      await prisma.category.create({ data: { name, slug, imageUrl } })
    } catch (e: any) {
      console.error(e)
      return NextResponse.json({ error: e.message || 'Failed to create category' }, { status: 500 })
    }
  }
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = Number(searchParams.get('id'))
  if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })
  try {
    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete. Category might contain products.' }, { status: 500 })
  }
}
