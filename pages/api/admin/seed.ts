import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    res.status(200).json({ ok: true })
    return
  }

  if (req.method === 'POST') {
    try {
      await prisma.siteSetting.upsert({
        where: { id: 1 },
        update: {
          businessName: 'TheHive Cakes',
          primaryColor: '#6B3E2E',
          accentColor: '#EFA86E'
        },
        create: {
          businessName: 'TheHive Cakes',
          location: 'Lagos, Nigeria',
          yearsExperience: 4,
          tagline: 'Satisfying your cravings with every bite and sip.',
          whatsappNumber: '08166017556',
          instagram: 'Kakesnbake_by_Deejah',
          tiktok: 'Kakesnbake_by_Deejah',
          logoUrl: null,
          primaryColor: '#6B3E2E',
          accentColor: '#EFA86E'
        }
      })

      const categories = [
        { name: 'Cakes', slug: 'cakes' },
        { name: 'Pastries', slug: 'pastries' },
        { name: 'Chapman', slug: 'chapman' },
        { name: 'Mocktails', slug: 'mocktails' }
      ]

      for (const c of categories) {
        await prisma.category.upsert({
          where: { slug: c.slug },
          update: {},
          create: c
        })
      }

      const cakes = [
        {
          name: 'Chocolate Celebration Cake',
          description: 'Rich chocolate layers with cocoa buttercream',
          priceNgn: 15000,
          imageUrl: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg'
        },
        {
          name: 'Vanilla Berry Cake',
          description: 'Vanilla sponge with fresh berries',
          priceNgn: 14000,
          imageUrl: 'https://images.pexels.com/photos/102871/pexels-photo-102871.jpeg'
        }
      ]

      const pastries = [
        {
          name: 'Buttery Croissant',
          description: 'Flaky and golden, perfect for mornings',
          priceNgn: 1500,
          imageUrl: 'https://images.pexels.com/photos/159688/pexels-photo-159688.jpeg'
        },
        {
          name: 'Cinnamon Rolls',
          description: 'Warm rolls with cinnamon glaze',
          priceNgn: 2000,
          imageUrl: 'https://images.pexels.com/photos/236370/pexels-photo-236370.jpeg'
        }
      ]

      const drinks = [
        {
          name: 'Chapman Classic',
          description: 'Refreshing Nigerian classic',
          priceNgn: 2500,
          imageUrl: 'https://images.pexels.com/photos/4963303/pexels-photo-4963303.jpeg'
        },
        {
          name: 'Tropical Mocktail',
          description: 'A fruity blend that sparks joy',
          priceNgn: 3000,
          imageUrl: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg'
        }
      ]

			const cats = await prisma.category.findMany()
			const map: Record<string, number> = Object.fromEntries(
				cats.map((c: { slug: string; id: number }) => [c.slug, c.id])
			)

      for (const p of cakes) {
        const exists = await prisma.product.findFirst({ where: { name: p.name } })
        if (!exists) await prisma.product.create({ data: { ...p, categoryId: map['cakes'] } })
      }

      for (const p of pastries) {
        const exists = await prisma.product.findFirst({ where: { name: p.name } })
        if (!exists) await prisma.product.create({ data: { ...p, categoryId: map['pastries'] } })
      }

      for (const p of drinks) {
        const isChapman = p.name.toLowerCase().includes('chapman')
        const exists = await prisma.product.findFirst({ where: { name: p.name } })
        if (!exists) {
          await prisma.product.create({
            data: { ...p, categoryId: map[isChapman ? 'chapman' : 'mocktails'] }
          })
        }
      }

      const slides = [
        {
          imageUrl: 'https://images.pexels.com/photos/853006/pexels-photo-853006.jpeg',
          headline: 'Satisfying your cravings',
          subtext: 'Quality cakes, pastries, Chapman, and mocktails'
        },
        {
          imageUrl: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg',
          headline: 'Freshly baked with love',
          subtext: 'Creativity and personalized orders for every occasion'
        },
        {
          imageUrl: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg',
          headline: 'Joy in every sip',
          subtext: 'Chapman and mocktails that brighten your day'
        }
      ]

      for (const s of slides) {
        const exists = await prisma.slide.findFirst({ where: { headline: s.headline } })
        if (!exists) await prisma.slide.create({ data: s })
      }

      await prisma.slide.updateMany({
        where: { headline: 'Satisfying your cravings' },
        data: { imageUrl: 'https://images.pexels.com/photos/140831/pexels-photo-140831.jpeg' }
      })

      res.status(200).json({ ok: true })
      return
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      res.status(500).json({ error: msg })
      return
    }
  }

  res.setHeader('Allow', ['GET', 'HEAD', 'POST'])
  res.status(405).json({ error: 'Method Not Allowed' })
}
