import Header from '@components/Header'
import Footer from '@components/Footer'
import Image from 'next/image'
import Link from 'next/link'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type SuccessProps = {
	searchParams: { id?: string; code?: string }
}

function buildWhatsAppLink(whatsappNumber: string | null, orderId?: string, trackingCode?: string) {
	const fallback = '08166017556'
	const raw = whatsappNumber && whatsappNumber.trim() ? whatsappNumber.trim() : fallback
	const intl = raw.replace(/\D/g, '').replace(/^0/, '234')

	const parts = [
		'Thank you for your purchase from TheHive Cakes.',
		orderId ? `Order ID: #${orderId}` : null,
		trackingCode ? `Tracking Code: ${trackingCode}` : null,
		'Please confirm my order and share next steps.'
	].filter(Boolean) as string[]

	const text = encodeURIComponent(parts.join('\n'))
	return `https://wa.me/${intl}?text=${text}`
}

export default async function Success({ searchParams }: SuccessProps) {
	const orderId = searchParams.id
	const trackingCode = searchParams.code

	let whatsappNumber: string | null = null

	try {
		const { prisma } = await import('@lib/db')
		const settings = await prisma.siteSetting.findFirst()
		whatsappNumber = settings?.whatsappNumber ?? null
	} catch (error) {
		console.error('Failed to load WhatsApp number for success page:', error)
	}

	const whatsappLink = buildWhatsAppLink(whatsappNumber, orderId, trackingCode)

	return (
		<div>
			<Header />
			<section className="container py-8 md:py-12">
				<div className="relative rounded-2xl overflow-hidden h-48 md:h-64 flex flex-col items-center justify-center text-center mb-8">
					<Image
						src="https://images.pexels.com/photos/227349/pexels-photo-227349.jpeg"
						alt="Success Banner"
						fill
						className="object-cover"
					/>
					<div className="absolute inset-0 bg-black/50" />
					<div className="relative z-10 text-white p-4">
						<h1 className="text-3xl md:text-5xl font-display font-bold">Order Confirmed!</h1>
						<p className="mt-2 text-white/90 text-lg">Thank you for your purchase.</p>
					</div>
				</div>
				<div className="mt-4 card p-6 text-center max-w-2xl mx-auto space-y-4">
					<p className="text-lg text-cocoa/80">
						Your payment has been received. A confirmation with your order details will be sent shortly.
					</p>
					<div className="mt-2 inline-flex flex-col gap-2 items-center">
						<a
							href={whatsappLink}
							target="_blank"
							rel="noopener noreferrer"
							className="btn btn-secondary inline-flex items-center gap-2"
						>
							<span>Send order to WhatsApp</span>
						</a>
						<p className="text-xs text-cocoa/60">
							We will receive your order details on WhatsApp for faster confirmation.
						</p>
					</div>
					<div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
						<Link href="/orders" className="btn btn-primary inline-block">
							Go to My Orders
						</Link>
						<Link href="/track" className="btn btn-secondary inline-block">
							Track an Order
						</Link>
						<Link href="/shop" className="btn btn-outline inline-block">
							Continue Shopping
						</Link>
					</div>
				</div>
			</section>
			<Footer />
		</div>
	)
}
