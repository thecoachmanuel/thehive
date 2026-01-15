import Header from '@components/Header'
import Footer from '@components/Footer'
import CheckoutForm from '@components/CheckoutForm'
import { cookies } from 'next/headers'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default async function CheckoutPage() {
	const cookieStore = cookies()
	const session = cookieStore.get('user_session')

	let user: { name: string | null; email: string; phone: string | null } | null = null
	let settings: { isActive: boolean; method: string; rate: number; freeThreshold: number | null } | null = null

	if (session?.value) {
		const id = Number(session.value)
		if (!Number.isNaN(id) && id > 0) {
			try {
				const { prisma } = await import('@lib/db')
				const dbUser = await prisma.user.findUnique({
					where: { id },
					select: { name: true, email: true, phone: true }
				})
				if (dbUser) {
					user = {
						name: dbUser.name ?? null,
						email: dbUser.email,
						phone: dbUser.phone ?? null
					}
				}
			} catch (error) {
				console.error('Failed to load checkout user:', error)
			}
		}
	}

	try {
		const { prisma } = await import('@lib/db')
		const delivery = await prisma.deliverySetting.findFirst()
		if (delivery) {
			settings = {
				isActive: delivery.isActive,
				method: delivery.method,
				rate: delivery.rate,
				freeThreshold: delivery.freeThreshold ?? null
			}
		}
	} catch (error) {
		console.error('Failed to load delivery settings for checkout:', error)
	}

	return (
    <div>
			<Header />
			<section className="container py-12">
				<h1 className="text-3xl font-display font-bold text-cocoa mb-8">Checkout</h1>
				<CheckoutForm settings={settings} user={user} />
			</section>
      <Footer />
    </div>
  )
}
