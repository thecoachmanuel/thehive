import Header from '@components/Header'
import Footer from '@components/Footer'
import AdminDashboard from '@components/AdminDashboard'
import { isAdmin } from '@lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default async function Admin({ searchParams }: { searchParams: { tab?: string } }) {
  if (!isAdmin()) redirect('/admin/login')

  let data = {
    settings: null,
    categories: [],
    products: [],
    slides: [],
    orders: [],
    messages: [],
    notifications: [],
    deliverySettings: null
  }

  try {
    const [settings, categories, products, slides, orders, messages, notifications, deliverySettings] = await Promise.all([
      prisma.siteSetting.findFirst(),
      prisma.category.findMany(),
      prisma.product.findMany(),
      prisma.slide.findMany(),
      prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 200, include: { items: { include: { product: true } } } }),
      prisma.message.findMany({ orderBy: { createdAt: 'desc' }, take: 200 }),
      prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 200 }),
      prisma.deliverySetting.findFirst()
    ])
    // @ts-ignore - Ignoring strict type checks for quick fix
    data = { settings, categories, products, slides, orders, messages, notifications, deliverySettings }
  } catch (e) {
    console.error('Failed to fetch admin data:', e)
  }

  return (
    <div>
      <Header />
      <section className="container py-12 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-display font-bold text-cocoa">Admin Dashboard</h1>
          <form action="/api/admin/logout" method="POST">
             <button className="text-sm text-red-600 hover:underline">Logout</button>
          </form>
        </div>
        <AdminDashboard
          settings={data.settings}
          categories={data.categories}
          products={data.products}
          slides={data.slides}
          orders={data.orders}
          messages={data.messages}
          notifications={data.notifications}
          deliverySettings={data.deliverySettings}
          initialTab={searchParams.tab}
        />
      </section>
      <Footer />
    </div>
  )
}
