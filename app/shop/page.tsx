import Header from '@components/Header'
import Footer from '@components/Footer'
import ShopGrid from '@components/ShopGrid'
import Image from 'next/image'
import { prisma } from '@lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default async function Shop() {
	let categories: any[] = []

	try {
		categories = await prisma.category.findMany({
			orderBy: { name: 'asc' },
			include: {
				items: {
					where: { active: true },
					orderBy: { name: 'asc' }
				}
			}
		})
	} catch (error) {
		console.error('Failed to fetch shop data:', error)
	}

	const categoriesWithItems = categories.filter((c) => c.items.length > 0)

	return (
		<div>
			<Header />
			<section className="container py-8 md:py-12">
				<div className="relative rounded-2xl overflow-hidden h-48 md:h-64 flex flex-col items-center justify-center text-center">
					<Image
						src="https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg"
						alt="Shop Banner"
						fill
						className="object-cover"
					/>
					<div className="absolute inset-0 bg-black/50" />
					<div className="relative z-10 text-white p-4">
						<h1 className="text-3xl md:text-5xl font-display font-bold">Shop</h1>
						<p className="mt-2 text-white/90 text-lg">Discover delicious cakes, pastries, Chapman, and mocktails.</p>
					</div>
				</div>
				{categoriesWithItems.length === 0 ? (
					<div className="mt-8 card p-8 text-center max-w-2xl mx-auto">
						<p className="text-cocoa/70 mb-4">
							Our full catalog is being updated. You can still place custom orders via WhatsApp from the homepage.
						</p>
					</div>
				) : (
					<ShopGrid categories={categoriesWithItems} />
				)}
			</section>
			<Footer />
		</div>
	)
}
