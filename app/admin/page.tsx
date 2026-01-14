import Header from '@components/Header'
import Footer from '@components/Footer'
import AdminDashboard from '@components/AdminDashboard'
import { isAdmin } from '@lib/auth'
import { redirect } from 'next/navigation'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default async function Admin({ searchParams }: { searchParams: { tab?: string } }) {
  if (!isAdmin()) redirect('/admin/login')

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
          settings={null}
          categories={[]}
          products={[]}
          slides={[]}
          orders={[]}
          messages={[]}
          notifications={[]}
          deliverySettings={null}
          initialTab={searchParams.tab}
        />
      </section>
      <Footer />
    </div>
  )
}
