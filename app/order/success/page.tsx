import Header from '@components/Header'
import Footer from '@components/Footer'
import Image from 'next/image'
import Link from 'next/link'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default function Success() {
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
				<div className="mt-4 card p-6 text-center max-w-2xl mx-auto">
					<p className="text-lg text-cocoa/80">
						Your payment has been received. A confirmation with your order details will be
						sent shortly.
					</p>
					<div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
						<Link href="/track" className="btn btn-secondary inline-block">
							Track Your Order
						</Link>
						<Link href="/shop" className="btn btn-primary inline-block">
							Continue Shopping
						</Link>
					</div>
				</div>
			</section>
			<Footer />
		</div>
	)
}
