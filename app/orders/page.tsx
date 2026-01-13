import Header from '@components/Header'
import Footer from '@components/Footer'
import { prisma } from '@lib/db'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { formatNgn } from '@lib/utils'
import Link from 'next/link'

export default async function MyOrders() {
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
        include: { items: { include: { product: true } } }
      }
    }
  })

  if (!user) {
    redirect('/login')
  }

  return (
    <div>
      <Header />
      <div className="container py-12 min-h-screen">
        <h1 className="text-3xl font-display font-bold text-cocoa mb-8">My Orders</h1>
        
        {user.orders.length === 0 ? (
          <div className="card p-8 text-center max-w-2xl mx-auto">
            <p className="text-cocoa/60 mb-4">You haven&apos;t placed any orders yet.</p>
            <Link href="/shop" className="btn btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
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
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-cocoa/80">{item.quantity}x {item.product.name}</span>
                      <span className="text-cocoa/60">{formatNgn(item.unitPriceNgn * item.quantity)}</span>
                    </div>
                  ))}
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
      <Footer />
    </div>
  )
}
