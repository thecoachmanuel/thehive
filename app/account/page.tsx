import Header from '@components/Header'
import Footer from '@components/Footer'
import { prisma } from '@lib/db'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatNgn } from '@lib/utils'
import ProfileEditForm from '@components/ProfileEditForm'

export default async function Account() {
  const cookieStore = cookies()
  const session = cookieStore.get('user_session')

  if (!session?.value) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.value) },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { items: { include: { product: true } } }
      }
    }
  })

  if (!user) {
    redirect('/login')
  }

  const safeUser = {
    name: user.name,
    email: user.email,
    phone: user.phone
  }

  return (
    <div>
      <Header />
      <div className="container py-12 min-h-screen">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-cocoa">My Account</h1>
            <p className="text-cocoa/70 mt-1">Welcome back, {user.name}</p>
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
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-cocoa">Recent Orders</h2>
              <Link href="/orders" className="text-sm text-primary hover:underline">View All Orders</Link>
            </div>

            {user.orders.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-cocoa/60 mb-4">You haven&apos;t placed any orders yet.</p>
                <Link href="/shop" className="btn btn-primary">Start Shopping</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {user.orders.map(order => (
                  <div key={order.id} className="card p-6 border border-cream hover:border-caramel/30 transition-colors">
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4 pb-4 border-b border-cream">
                      <div>
                        <p className="font-bold text-cocoa">Order #{order.id}</p>
                        <p className="text-xs text-cocoa/60">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-caramel">{formatNgn(order.totalAmountNgn)}</p>
                        <span className={`text-xs px-2 py-1 rounded ${order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {order.items.slice(0, 3).map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-cocoa/80">{item.quantity}x {item.product.name}</span>
                          <span className="text-cocoa/60">{formatNgn(item.unitPriceNgn * item.quantity)}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-xs text-cocoa/50 italic">+ {order.items.length - 3} more items</p>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-cream flex justify-between items-center">
                       {order.trackingCode && (
                          <div className="text-xs">
                             <span className="text-cocoa/60">Tracking Code: </span>
                             <span className="font-mono bg-cream px-1 rounded">{order.trackingCode}</span>
                          </div>
                       )}
                       <Link href={`/track?id=${order.id}&email=${user.email}`} className="text-sm text-caramel hover:underline">
                         Track Order
                       </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
