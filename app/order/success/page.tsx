import Header from '@components/Header'
import Footer from '@components/Footer'
import { prisma } from '@lib/db'
import { verifyPayment } from '@lib/paystack'
import { buildWhatsappMessage, formatNgn } from '@lib/utils'
import Image from 'next/image'
import Link from 'next/link'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default async function Success({ searchParams }: { searchParams: { reference?: string } }) {
  const ref = searchParams.reference
  let status = 'unknown'
  let orderId: number | null = null
  let trackingCode: string | null = null
  let whatsappUrl: string | null = null
  let totalPaid = 0
  const settings = await prisma.siteSetting.findFirst()

  if (ref) {
    const verification = await verifyPayment(ref)
    status = verification.data.status
    totalPaid = Number(verification?.data?.amount || 0) / 100
    const order = await prisma.order.findFirst({ where: { paystackRef: ref }, include: { items: { include: { product: true } } } })
    if (order && status === 'success') {
      await prisma.order.update({ where: { id: order.id }, data: { status: 'paid', paidAt: new Date() } })
      orderId = order.id
      trackingCode = order.trackingCode
      const items = order.items.map((i) => ({ name: i.product.name, qty: i.quantity, price: i.unitPriceNgn }))
      whatsappUrl = buildWhatsappMessage({
        businessNumber: settings?.whatsappNumber ?? '08166017556',
        customerName: order.customerName,
        orderId: order.id,
        total: order.totalAmountNgn,
        items
      })
    }
  }

  return (
    <div>
      <Header name={settings?.businessName} logoUrl={settings?.logoUrl ?? undefined} />
      <section className="container py-8 md:py-12">
        <div className="relative rounded-2xl overflow-hidden h-48 md:h-64 flex flex-col items-center justify-center text-center mb-8">
          <Image
            src="https://images.pexels.com/photos/227349/pexels-photo-227349.jpeg"
            alt="Success Banner"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 text-white p-4">
            <h1 className="text-3xl md:text-5xl font-display font-bold">Order Confirmed!</h1>
            <p className="mt-2 text-white/90 text-lg">Thank you for your purchase.</p>
          </div>
        </div>
        
        {orderId ? (
          <div className="mt-4 card p-6 text-center max-w-2xl mx-auto">
            <p className="text-xl text-cocoa">Order #{orderId} confirmed.</p>
            <p className="text-lg font-semibold text-caramel mt-2">Total paid: {formatNgn(totalPaid)}</p>
            {trackingCode && (
              <div className="mt-4 p-4 bg-cream rounded">
                <p className="text-sm text-cocoa/80">Your Tracking Code:</p>
                <p className="text-xl font-bold font-mono text-cocoa select-all">{trackingCode}</p>
                <p className="text-xs text-cocoa/60 mt-1">Keep this code to track your order status.</p>
              </div>
            )}
            {whatsappUrl && (
              <a href={whatsappUrl} target="_blank" className="btn btn-primary mt-6 inline-block">
                Notify Business on WhatsApp
              </a>
            )}
            <div className="mt-6">
              <Link href="/shop" className="text-cocoa hover:text-caramel underline">Continue Shopping</Link>
            </div>
          </div>
        ) : (
          <div className="text-center mt-12">
             <p className="text-cocoa/70">Verifying your payment...</p>
          </div>
        )}
      </section>
      <Footer />
    </div>
  )
}
