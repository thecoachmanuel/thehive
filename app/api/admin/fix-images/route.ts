import { NextResponse } from 'next/server'
import { prisma } from '@lib/db'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  const replacements: Record<string, string> = {
    'Chocolate Celebration Cake': 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg',
    'Vanilla Berry Cake': 'https://images.pexels.com/photos/102871/pexels-photo-102871.jpeg',
    'Buttery Croissant': 'https://images.pexels.com/photos/159688/pexels-photo-159688.jpeg',
    'Cinnamon Rolls': 'https://images.pexels.com/photos/236370/pexels-photo-236370.jpeg',
    'Chapman Classic': 'https://images.pexels.com/photos/4963303/pexels-photo-4963303.jpeg',
    'Tropical Mocktail': 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg'
  }
  for (const [name, url] of Object.entries(replacements)) {
    await prisma.product.updateMany({ where: { name }, data: { imageUrl: url } })
  }
  const slideReplacements = [
    {
      headline: 'Satisfying your cravings',
      imageUrl: 'https://images.pexels.com/photos/302680/pexels-photo-302680.jpeg'
    },
    {
      headline: 'Freshly baked with love',
      imageUrl: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg'
    },
    {
      headline: 'Joy in every sip',
      imageUrl: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg'
    }
  ]
  for (const s of slideReplacements) {
    await prisma.slide.updateMany({ where: { headline: s.headline }, data: { imageUrl: s.imageUrl } })
  }
  await prisma.siteSetting.updateMany({ where: {}, data: { logoUrl: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg' } })
  return NextResponse.json({ ok: true })
}
