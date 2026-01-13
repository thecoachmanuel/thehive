import Header from '@components/Header'
import Footer from '@components/Footer'
import CheckoutForm from '@components/CheckoutForm'
import { prisma } from '@lib/db'
import { cookies } from 'next/headers'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default async function CheckoutPage() {
  const settings = await prisma.siteSetting.findFirst()
  const deliverySettings = await prisma.deliverySetting.findFirst()

  const cookieStore = cookies()
  const session = cookieStore.get('user_session')
  let user = null

  if (session?.value) {
    user = await prisma.user.findUnique({
      where: { id: parseInt(session.value) },
      select: { name: true, email: true, phone: true }
    })
  }

  return (
    <div>
      <Header name={settings?.businessName} logoUrl={settings?.logoUrl ?? undefined} />
      <section className="container py-12">
        <h1 className="text-3xl font-display font-bold text-cocoa mb-8">Checkout</h1>
        <CheckoutForm settings={deliverySettings} user={user} />
      </section>
      <Footer />
    </div>
  )
}
