import Header from '@components/Header'
import Footer from '@components/Footer'
import CheckoutForm from '@components/CheckoutForm'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default async function CheckoutPage() {
  return (
    <div>
      <Header />
      <section className="container py-12">
        <h1 className="text-3xl font-display font-bold text-cocoa mb-8">Checkout</h1>
        <CheckoutForm settings={null} user={null} />
      </section>
      <Footer />
    </div>
  )
}
