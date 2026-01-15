import Header from '@components/Header'
import Footer from '@components/Footer'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { formatNgn } from '@lib/utils'
import type { Order, OrderItem, Product, User } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type OrderWithItems = Order & { items: (OrderItem & { product: Product })[] }

function getStatusClasses(status: string) {
	if (status === 'Order delivered') {
		return 'bg-green-100 text-green-700 border-green-200'
	}
	if (status === 'Cancelled') {
		return 'bg-red-100 text-red-700 border-red-200'
	}
	return 'bg-yellow-100 text-yellow-700 border-yellow-200'
}

export default async function MyOrders() {
	const cookieStore = cookies()
	const session = cookieStore.get('user_session')

	if (!session?.value) {
		redirect('/login')
	}

	const id = Number(session.value)
	if (Number.isNaN(id) || id <= 0) {
		redirect('/login')
	}

	let user: Pick<User, 'email' | 'name'> | null = null
	let orders: OrderWithItems[] = []

	try {
		const { prisma } = await import('@lib/db')

		user = await prisma.user.findUnique({
			where: { id },
			select: { email: true, name: true }
		})

		const email = user?.email ?? null
		const where = email
			? {
					OR: [{ userId: id }, { email }]
			  }
			: { userId: id }

		orders = await prisma.order.findMany({
			where,
			include: {
				items: { include: { product: true } }
			},
			orderBy: { createdAt: 'desc' }
		})
	} catch (error) {
		console.error('Failed to load orders for user:', error)
	}

	const firstName = (user?.name || '').split(' ')[0] || 'Guest'

	return (
		<div>
			<Header />
			<div className="container py-12 min-h-screen">
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
					<div>
						<h1 className="text-3xl font-display font-bold text-cocoa">My Orders</h1>
						<p className="text-cocoa/70 mt-1">
							Review your completed orders, see their status and track deliveries.
						</p>
					</div>
					<div className="flex flex-wrap gap-3">
						<Link href="/track" className="btn btn-outline text-sm">
							Track with Tracking Code
						</Link>
						<Link href="/shop" className="btn btn-outline text-sm">
							Start a New Order
						</Link>
					</div>
				</div>

				{orders.length === 0 ? (
					<div className="card p-8 text-center max-w-2xl mx-auto space-y-4">
						<p className="text-cocoa/70">
							Hi {firstName}, you do not have any orders yet.
						</p>
						<p className="text-cocoa/60 text-sm">
							When you place an order, it will appear here with its tracking code and
								status.
						</p>
						<div className="flex flex-wrap gap-3 justify-center">
							<Link href="/shop" className="btn btn-primary">
								Start Shopping
							</Link>
							<Link href="/track" className="btn btn-outline">
								Track an Order
							</Link>
						</div>
					</div>
				) : (
					<div className="card p-6 md:p-8 space-y-6">
						<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
							<div>
								<p className="text-sm text-cocoa/70">
									Showing {orders.length} order{orders.length === 1 ? '' : 's'} for {firstName}
								</p>
							</div>
							<div className="text-xs text-cocoa/50">
								Each order has a unique tracking code you can use on the Track page.
							</div>
						</div>

						<div className="space-y-4">
							{orders.map(order => {
								const createdAt = new Date(order.createdAt)
								const itemsPreview = order.items.slice(0, 3)
								const remainingCount = order.items.length - itemsPreview.length
								return (
									<div
										key={order.id}
										className="border border-cream rounded-lg bg-cream/40 p-4 md:p-5 space-y-3"
									>
										<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
											<div>
												<p className="text-sm font-semibold text-cocoa">
													Order #{order.id}
												</p>
												<p className="text-xs text-cocoa/60">
													Placed on {createdAt.toLocaleDateString()} at{' '}
													{createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
												</p>
												<p className="text-xs font-mono text-cocoa/70 mt-1">
													Tracking Code: {order.trackingCode}
												</p>
											</div>
											<div className="flex flex-col items-start md:items-end gap-2">
												<span
													className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wide ${getStatusClasses(
														order.status
													)}`}
												>
													{order.status}
												</span>
												<p className="text-sm font-bold text-cocoa">
													{formatNgn(order.totalAmountNgn)}
												</p>
											</div>
										</div>

										<div className="pt-3 border-t border-cream/70">
											<p className="text-xs font-semibold text-cocoa/60 mb-1 uppercase">
												Items
											</p>
											<div className="space-y-1 text-sm text-cocoa/80">
												{itemsPreview.map(item => (
													<div key={item.id} className="flex justify-between gap-4">
														<span>
															{item.quantity}x {item.product.name}
														</span>
														<span className="font-medium">
															{formatNgn(item.unitPriceNgn * item.quantity)}
														</span>
													</div>
												))}
												{remainingCount > 0 && (
													<p className="text-xs text-cocoa/60">
														+ {remainingCount} more item{remainingCount === 1 ? '' : 's'} in this order
													</p>
												)}
											</div>
										</div>
									</div>
								)
							})}
						</div>
					</div>
				)}
			</div>
			<Footer />
		</div>
	)
}
