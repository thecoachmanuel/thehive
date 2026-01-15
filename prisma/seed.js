import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
	await prisma.orderItem.deleteMany()
	await prisma.order.deleteMany()
	await prisma.product.deleteMany()
	await prisma.category.deleteMany()
	await prisma.slide.deleteMany()
	await prisma.deliverySetting.deleteMany()
	await prisma.siteSetting.deleteMany()
	await prisma.user.deleteMany()
	await prisma.notification.deleteMany()
	await prisma.message.deleteMany()

	const site = await prisma.siteSetting.create({
		data: {
			businessName: 'TheHive Cakes',
			location: 'Lagos, Nigeria',
			yearsExperience: 5,
			tagline: 'Satisfying your cravings with every bite and sip.',
			whatsappNumber: '08012345678',
			instagram: '@thehivecakes',
			tiktok: '@thehivecakes',
			logoUrl: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg',
			primaryColor: '#6B3E2E',
			accentColor: '#EFA86E',
			creamColor: '#F5E9DA',
			peachColor: '#F8D4C2',
			blushColor: '#F4B6C2'
		}
	})

	const cakes = await prisma.category.create({
		data: {
			name: 'Cakes',
			slug: 'cakes',
			imageUrl: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg'
		}
	})

	const pastries = await prisma.category.create({
		data: {
			name: 'Pastries',
			slug: 'pastries',
			imageUrl: 'https://images.pexels.com/photos/159688/pexels-photo-159688.jpeg'
		}
	})

	const drinks = await prisma.category.create({
		data: {
			name: 'Chapman & Mocktails',
			slug: 'drinks',
			imageUrl: 'https://images.pexels.com/photos/4963303/pexels-photo-4963303.jpeg'
		}
	})

	await prisma.product.createMany({
		data: [
			{
				name: 'Chocolate Celebration Cake',
				description: 'Rich chocolate sponge layered with silky chocolate buttercream, perfect for birthdays and celebrations.',
				priceNgn: 22000,
				imageUrl: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg',
				categoryId: cakes.id,
				active: true
			},
			{
				name: 'Vanilla Berry Cake',
				description: 'Vanilla sponge filled with whipped cream and fresh mixed berries.',
				priceNgn: 20000,
				imageUrl: 'https://images.pexels.com/photos/102871/pexels-photo-102871.jpeg',
				categoryId: cakes.id,
				active: true
			},
			{
				name: 'Buttery Croissant',
				description: 'Flaky, buttery croissants baked fresh every morning.',
				priceNgn: 1200,
				imageUrl: 'https://images.pexels.com/photos/159688/pexels-photo-159688.jpeg',
				categoryId: pastries.id,
				active: true
			},
			{
				name: 'Cinnamon Rolls',
				description: 'Soft rolls swirled with cinnamon sugar and topped with vanilla glaze.',
				priceNgn: 1500,
				imageUrl: 'https://images.pexels.com/photos/236370/pexels-photo-236370.jpeg',
				categoryId: pastries.id,
				active: true
			},
			{
				name: 'Chapman Classic',
				description: 'Signature Nigerian Chapman mocktail with citrus, bitters, and a fruity twist.',
				priceNgn: 2500,
				imageUrl: 'https://images.pexels.com/photos/4963303/pexels-photo-4963303.jpeg',
				categoryId: drinks.id,
				active: true
			},
			{
				name: 'Tropical Mocktail',
				description: 'Refreshing blend of pineapple, orange, and passion fruit, served over ice.',
				priceNgn: 2800,
				imageUrl: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg',
				categoryId: drinks.id,
				active: true
			}
		]
	})

	await prisma.slide.createMany({
		data: [
			{
				imageUrl: 'https://images.pexels.com/photos/302680/pexels-photo-302680.jpeg',
				headline: 'Satisfying your cravings',
				subtext: 'From celebration cakes to every day treats, baked fresh in Lagos.',
				ctaText: 'Shop Cakes',
				ctaLink: '/shop',
				active: true
			},
			{
				imageUrl: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg',
				headline: 'Freshly baked with love',
				subtext: 'Quality ingredients, beautiful designs, and reliable delivery.',
				ctaText: 'View Menu',
				ctaLink: '/menu',
				active: true
			},
			{
				imageUrl: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg',
				headline: 'Joy in every sip',
				subtext: 'Chapman and mocktails to pair with your favourite treats.',
				ctaText: 'Order Drinks',
				ctaLink: '/shop',
				active: true
			}
		]
	})

	await prisma.deliverySetting.upsert({
		where: { id: 1 },
		update: {},
		create: {
			id: 1,
			isActive: true,
			method: 'flat',
			rate: 2000,
			freeThreshold: 50000
		}
	})
}

main()
	.then(async () => {
		await prisma.$disconnect()
	})
	.catch(async (e) => {
		console.error(e)
		await prisma.$disconnect()
		process.exit(1)
	})

