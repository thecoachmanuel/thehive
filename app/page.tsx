import Header from '@components/Header'
import Footer from '@components/Footer'
import HeroSlider from '@components/HeroSlider'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default async function Home() {
	let settings = null
	let slides: any[] = []
	let categories: any[] = []

	try {
		const [s, sl, c] = await Promise.all([
			prisma.siteSetting.findFirst(),
			prisma.slide.findMany({
				where: { active: true },
				orderBy: { id: 'asc' }
			}),
			prisma.category.findMany({
				where: { imageUrl: { not: null } },
				orderBy: { name: 'asc' }
			})
		])
		settings = s
		slides = sl
		categories = c
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

	const visibleCategories = categories.filter((c) => c.imageUrl)

	return (
		<div>
			<Header name={businessName} logoUrl={logoUrl} />
			<HeroSlider slides={sliderData} siteName={businessName} />
			<section className="container py-12">
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
					<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
						{visibleCategories.map((c) => (
							<Link key={c.id} href={`/shop?category=${c.slug}`} className="card overflow-hidden group">
								<div className="relative h-48">
									<Image src={c.imageUrl as string} alt={c.name} fill className="object-cover group-hover:scale-105 transition-transform" />
								</div>
								<div className="p-4">
									<h3 className="font-bold text-cocoa">{c.name}</h3>
									<p className="text-sm text-cocoa/70">Explore delicious {c.name.toLowerCase()} made with love.</p>
								</div>
							</Link>
						))}
					</div>
				)}
			</section>
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
			<Footer />
		</div>
	)
}
