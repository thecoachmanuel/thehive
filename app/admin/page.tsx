import Header from '@components/Header'
import Footer from '@components/Footer'
import AdminDashboard from '@components/AdminDashboard'
import { prisma } from '@lib/db'
import { isAdmin } from '@lib/auth'
import { redirect } from 'next/navigation'

export default async function Admin({ searchParams }: { searchParams: { tab?: string } }) {
  if (!isAdmin()) redirect('/admin/login')
  const settings = await prisma.siteSetting.findFirst()
  const categories = await prisma.category.findMany()
  const products = await prisma.product.findMany({ include: { category: true } })
  const slides = await prisma.slide.findMany()
  const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 200, include: { items: { include: { product: true } } } })
  const messages = await prisma.message.findMany({ orderBy: { createdAt: 'desc' }, take: 200 })
  const notifications = await prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 200 })
  const deliverySettings = await prisma.deliverySetting.findFirst()

  return (
    <div>
      <Header name={settings?.businessName} logoUrl={settings?.logoUrl ?? undefined} />
      <section className="container py-12 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-display font-bold text-cocoa">Admin Dashboard</h1>
          <form action="/api/admin/logout" method="POST">
             <button className="text-sm text-red-600 hover:underline">Logout</button>
          </form>
        </div>
        <AdminDashboard
          settings={settings}
          categories={categories}
          products={products}
          slides={slides}
          orders={orders}
          messages={messages}
          notifications={notifications}
          deliverySettings={deliverySettings}
          initialTab={searchParams.tab}
        />
      </section>
      <Footer />
    </div>
  )
}
