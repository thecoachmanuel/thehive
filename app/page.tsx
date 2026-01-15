import Header from '@components/Header'
import Footer from '@components/Footer'
import HeroSlider from '@components/HeroSlider'
import ProductCard from '@components/ProductCard'
import InstallPromptBanner from '@components/InstallPromptBanner'
import Link from 'next/link'
import Image from 'next/image'
import { SiteSetting, Slide, Category, Product } from '@prisma/client'

export const runtime = 'nodejs'
	export const dynamic = 'force-dynamic'

	export default async function Home() {
		let settings: SiteSetting | null = null
		let slides: Slide[] = []
		let categories: Category[] = []
		let featuredProducts: Product[] = []

		try {
			const { prisma } = await import('@lib/db')
			const [s, sl, c, fp] = await Promise.all([
				prisma.siteSetting.findFirst(),
				prisma.slide.findMany({
					where: { active: true },
					orderBy: { id: 'asc' }
				}),
				prisma.category.findMany({
					orderBy: { name: 'asc' }
				}),
				prisma.product.findMany({
					where: { active: true },
					orderBy: { id: 'desc' },
					take: 6
				})
			])
			settings = s
			slides = sl
			categories = c
			featuredProducts = fp
		} catch (error) {
			console.error('Failed to fetch home data:', error)
		}

	const businessName = settings?.businessName ?? 'TheHive Cakes'
	const logoUrl = settings?.logoUrl ?? undefined
	const sliderData = slides.length
		? slides.map((s) => ({
				id: String(s.id),
				imageUrl: s.imageUrl,
				headline: s.headline,
				subtext: s.subtext,
				ctaText: s.ctaText ?? undefined,
				ctaLink: s.ctaLink ?? undefined
			}))
		: undefined

		const visibleCategories = categories

		return (
			<div>
				<Header name={businessName} logoUrl={logoUrl} />
				<HeroSlider slides={sliderData} siteName={businessName} />
				<section className="container py-10">
					{visibleCategories.length === 0 ? (
						<div className="card p-8 text-center max-w-2xl mx-auto">
							<p className="text-cocoa/70 mb-4">
								Our curated categories are being updated. Browse all products in the shop.
							</p>
							<Link href="/shop" className="btn btn-primary">
								Visit Shop
							</Link>
						</div>
					) : (
						<div className="space-y-4">
							<div className="flex items-baseline justify-between gap-4">
								<h2 className="text-xl md:text-2xl font-display font-bold text-cocoa">
									Shop by category
								</h2>
								<Link href="/shop" className="hidden md:inline-flex text-sm text-primary hover:text-caramel font-medium">
									View all
								</Link>
							</div>
							<div className="overflow-x-auto no-scrollbar -mx-4 px-4">
								<div className="flex gap-5">
									{visibleCategories.map((c) => (
										<Link
											key={c.id}
											href={`/shop?category=${c.slug}`}
											className="flex flex-col items-center text-center min-w-[80px] flex-shrink-0"
										>
											<div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-cream border border-caramel flex items-center justify-center overflow-hidden shadow-sm">
												{c.imageUrl && c.imageUrl.trim() ? (
													<Image
														src={c.imageUrl}
														alt={c.name}
														width={80}
														height={80}
														className="w-full h-full object-cover"
													/>
												) : (
													<span className="text-sm font-semibold text-cocoa">
														{c.name.charAt(0)}
													</span>
												)}
											</div>
											<span className="mt-2 text-xs md:text-sm font-medium text-cocoa max-w-[96px] truncate">
												{c.name}
											</span>
										</Link>
									))}
								</div>
							</div>
						</div>
					)}
				</section>
				{featuredProducts.length > 0 && (
					<section className="container py-6 md:py-10">
						<div className="flex items-center justify-between mb-6 gap-4">
							<div>
								<h2 className="text-2xl md:text-3xl font-display font-bold text-cocoa">Featured products</h2>
								<p className="text-sm md:text-base text-cocoa/70 mt-1">
									Handpicked favourites customers love to order again and again.
								</p>
							</div>
							<Link href="/shop" className="hidden md:inline-flex btn btn-outline text-sm">
								View all products
							</Link>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{featuredProducts.map((p) => (
								<ProductCard key={p.id} product={p} />
							))}
						</div>
						<div className="mt-6 md:hidden text-center">
							<Link href="/shop" className="btn btn-outline w-full text-sm">
								View all products
							</Link>
						</div>
					</section>
				)}
				<section className="bg-cream text-center">
				<div className="container py-12 md:py-16 flex flex-col items-center">
					<h2 className="text-2xl md:text-3xl font-display font-bold text-cocoa">Trusted by Lagos for 4 years</h2>
					<p className="mt-3 text-cocoa/80 max-w-2xl mx-auto">
						We bring warmth, quality, and joyful experiences to every bite and sip. Personalized orders crafted to
						satisfy your cravings.
					</p>
					<div className="mt-6">
						<Link href="/shop" className="btn btn-primary">
							Shop Now
						</Link>
					</div>
				</div>
			</section>
			<InstallPromptBanner />
			<Footer />
		</div>
	)
}
