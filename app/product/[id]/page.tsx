import Header from '@components/Header'
import Footer from '@components/Footer'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatNgn } from '@lib/utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default async function ProductPage({ params }: { params: { id: string } }) {
	const id = Number(params.id)
	if (!id || Number.isNaN(id)) notFound()

	let product = null
	try {
		const { prisma } = await import('@lib/db')
		product = await prisma.product.findUnique({
			where: { id },
			include: { category: true }
		})
	} catch (error) {
		console.error(`Failed to fetch product ${id}:`, error)
		// If DB fails, we probably want to show 404 or error page, but to avoid build crash:
		// returning null here will trigger the notFound() below
	}

	if (!product || !product.active) notFound()

	return (
		<div>
			<Header />
			<section className="container py-8 md:py-12">
				<Link href="/shop" className="inline-block mb-6 text-sm text-cocoa hover:text-caramel">
					← Back to Shop
				</Link>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					<div className="card overflow-hidden">
						<div className="relative h-64 md:h-96">
							<Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
						</div>
					</div>
					<div className="card p-6">
						<h1 className="text-2xl md:text-3xl font-display font-bold text-cocoa">{product.name}</h1>
						{product.category && (
							<p className="text-sm text-cocoa/70 mb-1">{product.category.name}</p>
						)}
						<p className="mt-2 text-cocoa/80">{product.description}</p>
						<p className="mt-4 text-caramel font-semibold text-xl">{formatNgn(product.priceNgn)}</p>
						<div className="mt-6 grid grid-cols-1 gap-3">
							<p className="text-cocoa/70 text-sm">
								To place an order for this item or something similar, please browse our catalog or reach out via WhatsApp from the homepage.
							</p>
							<Link href="/shop" className="btn btn-primary w-full">
								Browse Shop
							</Link>
						</div>
					</div>
				</div>
			</section>
			<Footer />
		</div>
	)
}
