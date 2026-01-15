import Header from '@components/Header'
import Footer from '@components/Footer'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ProfileEditForm from '@components/ProfileEditForm'
import type { User } from '@prisma/client'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default async function Account() {
	const cookieStore = cookies()
	const session = cookieStore.get('user_session')

	if (!session?.value) {
		redirect('/login')
	}

	let user: Pick<User, 'name' | 'email' | 'phone'> | null = null

	try {
		const id = Number(session.value)
		if (!Number.isNaN(id) && id > 0) {
			const { prisma } = await import('@lib/db')
			user = await prisma.user.findUnique({
				where: { id },
				select: { name: true, email: true, phone: true }
			})
		}
	} catch (error) {
		console.error('Failed to load account user:', error)
	}

	const safeUser = {
		name: user?.name ?? null,
		email: user?.email ?? '',
		phone: user?.phone ?? null
	}

  return (
    <div>
      <Header />
      <div className="container py-12 min-h-screen">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-cocoa">My Account</h1>
            <p className="text-cocoa/70 mt-1">Manage your profile and recent activity.</p>
          </div>
          <div className="flex gap-4">
            <form action="/api/auth/logout" method="POST">
               <button className="btn btn-outline text-sm">Sign Out</button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <ProfileEditForm user={safeUser} />
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="card p-8 text-center">
              <h2 className="text-xl font-bold text-cocoa mb-2">Recent Orders</h2>
              <p className="text-cocoa/60 mb-4">View your complete order history on the orders page.</p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link href="/orders" className="btn btn-primary">View All Orders</Link>
                <Link href="/shop" className="btn btn-outline">Start Shopping</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
