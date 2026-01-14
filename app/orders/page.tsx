import Header from '@components/Header'
import Footer from '@components/Footer'
import Link from 'next/link'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default function MyOrders() {
	return (
		<div>
			<Header />
			<div className="container py-12 min-h-screen">
				<h1 className="text-3xl font-display font-bold text-cocoa mb-8">My Orders</h1>
				<div className="card p-8 text-center max-w-2xl mx-auto space-y-4">
					<p className="text-cocoa/70">
						Sign in to view your complete order history and track your purchases.
					</p>
					<div className="flex flex-wrap gap-3 justify-center">
						<Link href="/login" className="btn btn-primary">
							Sign In
						</Link>
						<Link href="/track" className="btn btn-outline">
							Track an Order
						</Link>
						<Link href="/shop" className="btn btn-outline">
							Start Shopping
						</Link>
					</div>
				</div>
			</div>
			<Footer />
		</div>
	)
}
