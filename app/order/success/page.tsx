import Header from '@components/Header'
import Footer from '@components/Footer'
import Image from 'next/image'
import Link from 'next/link'
import { formatNgn } from '@lib/utils'
import type { Order, OrderItem, Product } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type SuccessProps = {
	searchParams: { id?: string; code?: string; reference?: string; trxref?: string }
}

type OrderWithItems = Order & { items: (OrderItem & { product: Product })[] }
type PaystackVerification = { data?: { metadata?: { orderId?: number } } }

function buildWhatsAppLink(whatsappNumber: string | null, order: OrderWithItems | null) {
	const fallback = '08166017556'
	const raw = whatsappNumber && whatsappNumber.trim() ? whatsappNumber.trim() : fallback
	const intl = raw.replace(/\D/g, '').replace(/^0/, '234')

	if (!order) {
		const text = encodeURIComponent(
			'Thank you for your purchase from TheHive Cakes. Please confirm my order and share next steps.'
		)
		return `https://wa.me/${intl}?text=${text}`
	}

	const lines: string[] = []
	lines.push('New order from TheHive Cakes')
	lines.push(`Order ID: #${order.id}`)
	lines.push(`Tracking Code: ${order.trackingCode}`)
	lines.push(`Customer: ${order.customerName}`)
	if (order.phone) lines.push(`Phone: ${order.phone}`)
	if (order.email) lines.push(`Email: ${order.email}`)
	lines.push('')
	lines.push('Items:')
	for (const item of order.items) {
		lines.push(`${item.quantity}x ${item.product.name} - ${formatNgn(item.unitPriceNgn * item.quantity)}`)
	}
	lines.push('')
	lines.push(`Total Paid: ${formatNgn(order.totalAmountNgn)}`)
	if (order.deliveryMethod === 'delivery' && order.deliveryAddress) {
		lines.push(`Delivery Address: ${order.deliveryAddress}`)
	}

	const text = encodeURIComponent(lines.join('\n'))
	return `https://wa.me/${intl}?text=${text}`
}

export default async function Success({ searchParams }: SuccessProps) {
	const reference = searchParams.reference || searchParams.trxref
	const idParam = searchParams.id
	const codeParam = searchParams.code

	let whatsappNumber: string | null = null
	let order: OrderWithItems | null = null

	try {
		const { prisma } = await import('@lib/db')
		const settings = await prisma.siteSetting.findFirst()
		whatsappNumber = settings?.whatsappNumber ?? null

		if (idParam) {
			const id = Number(idParam)
			if (!Number.isNaN(id) && id > 0) {
				order = (await prisma.order.findFirst({
					where: { id },
					include: { items: { include: { product: true } } }
				})) as OrderWithItems | null
			}
		} else if (codeParam) {
			order = (await prisma.order.findFirst({
				where: { trackingCode: codeParam },
				include: { items: { include: { product: true } } }
			})) as OrderWithItems | null
		} else if (reference) {
			try {
				const { verifyPayment } = await import('@lib/paystack')
				const verification = (await verifyPayment(reference)) as PaystackVerification
				const metaOrderId = verification.data?.metadata?.orderId
				if (metaOrderId) {
					order = (await prisma.order.findFirst({
						where: { id: Number(metaOrderId) },
						include: { items: { include: { product: true } } }
					})) as OrderWithItems | null
				}
			} catch (err) {
				console.error('Failed to verify payment for success page:', err)
			}
		}
	} catch (error) {
		console.error('Failed to load success page data:', error)
	}

	const whatsappLink = buildWhatsAppLink(whatsappNumber, order)

	return (
		<div>
			<Header />
			<section className="container py-8 md:py-12">
				<div className="relative rounded-2xl overflow-hidden h-48 md:h-64 flex flex-col items-center justify-center text-center mb-8">
					<Image
						src="https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg"
						alt="Celebration cake"
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
