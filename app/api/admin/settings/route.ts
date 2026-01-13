import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@lib/db'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const data = {
    businessName: String(form.get('businessName') || ''),
    location: String(form.get('location') || ''),
    yearsExperience: Number(form.get('yearsExperience') || 0),
    tagline: String(form.get('tagline') || ''),
    whatsappNumber: String(form.get('whatsappNumber') || ''),
    instagram: String(form.get('instagram') || ''),
    tiktok: String(form.get('tiktok') || ''),
    logoUrl: String(form.get('logoUrl') || ''),
    primaryColor: String(form.get('primaryColor') || ''),
    accentColor: String(form.get('accentColor') || ''),
    creamColor: String(form.get('creamColor') || ''),
    peachColor: String(form.get('peachColor') || ''),
    blushColor: String(form.get('blushColor') || '')
  }
  await prisma.siteSetting.upsert({ where: { id: 1 }, update: data, create: data })
  revalidatePath('/', 'layout')
  return NextResponse.redirect(new URL('/admin?tab=settings', req.url))
}
