import Header from '@components/Header'
import Footer from '@components/Footer'
import ProductCard from '@components/ProductCard'
import Image from 'next/image'
import { prisma } from '@lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default async function Menu() {
	const [settings, categories] = await Promise.all([
		prisma.siteSetting.findFirst(),
		prisma.category.findMany({
			orderBy: { name: 'asc' },
			include: {
				items: {
					where: { active: true },
					orderBy: { priceNgn: 'asc' }
				}
			}
		})
	])

	const businessName = settings?.businessName ?? 'TheHive Cakes'
	const logoUrl = settings?.logoUrl ?? undefined
	const categoriesWithItems = categories.filter((cat) => cat.items.length > 0)

	return (
		<div>
			<Header name={businessName} logoUrl={logoUrl} />
			<section className="container py-8 md:py-12">
				<div className="relative rounded-2xl overflow-hidden h-48 md:h-64 flex flex-col items-center justify-center text-center mb-8">
					<Image
						src="https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg"
						alt="Menu Banner"
						fill
						className="object-cover"
					/>
					<div className="absolute inset-0 bg-black/50" />
					<div className="relative z-10 text-white p-4">
						<h1 className="text-3xl md:text-5xl font-display font-bold">Our Menu</h1>
						<p className="mt-2 text-white/90 text-lg">Explore our delicious selection. Prices in ₦ NGN.</p>
					</div>
				</div>
				{categoriesWithItems.length === 0 ? (
					<p className="text-center text-cocoa/70">
						Our menu is being updated. Please check back soon.
					</p>
				) : (
					<div className="space-y-10">
						{categoriesWithItems.map((cat) => (
							<div key={cat.id} id={cat.slug}>
								<h2 className="text-2xl font-bold text-cocoa">{cat.name}</h2>
								<div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
									{cat.items.map((p) => (
										<ProductCard key={p.id} product={p} />
									))}
								</div>
							</div>
						))}
					</div>
				)}
			</section>
			<Footer />
		</div>
	)
}
