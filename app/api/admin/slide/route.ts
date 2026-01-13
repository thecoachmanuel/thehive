import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@lib/db'

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const id = Number(form.get('id') || 0)
  const imageUrl = String(form.get('imageUrl') || '')
  const headline = String(form.get('headline') || '')
  const subtext = String(form.get('subtext') || '')
  const ctaText = String(form.get('ctaText') || '')
  const ctaLink = String(form.get('ctaLink') || '')

  if (!imageUrl || !headline || !subtext) return NextResponse.json({ error: 'Missing' }, { status: 400 })

  const data = { imageUrl, headline, subtext, ctaText: ctaText || null, ctaLink: ctaLink || null }

  if (id > 0) {
    await prisma.slide.update({ where: { id }, data })
  } else {
    await prisma.slide.create({ data })
  }
  return NextResponse.redirect(new URL('/admin?tab=slides', req.url))
}
