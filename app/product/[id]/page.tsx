import Header from '@components/Header'
import Footer from '@components/Footer'
import { prisma } from '@lib/db'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatNgn } from '@lib/utils'

export default async function ProductPage({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  const settings = await prisma.siteSetting.findFirst()
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product || !product.active) notFound()
  return (
    <div>
      <Header name={settings?.businessName} logoUrl={settings?.logoUrl ?? undefined} />
      <section className="container py-8 md:py-12">
        <Link href="/shop" className="inline-block mb-6 text-sm text-cocoa hover:text-caramel">
          ← Back to Shop
        </Link>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card overflow-hidden">
            <div className="relative h-64 md:h-96">
              <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
            </div>
          </div>
          <div className="card p-6">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-cocoa">{product.name}</h1>
            <p className="mt-2 text-cocoa/80">{product.description}</p>
            <p className="mt-4 text-caramel font-semibold text-xl">{formatNgn(product.priceNgn)}</p>
            <form action="/api/order/checkout-single" method="POST" className="mt-6 grid grid-cols-1 gap-3">
              <input type="hidden" name="productId" value={product.id} />
              <div className="flex flex-col">
                <label className="text-sm text-cocoa/70 mb-1">Quantity</label>
                <input type="number" name="quantity" min={1} defaultValue={1} className="border rounded p-2 w-full" />
              </div>
              <input name="customerName" placeholder="Full Name" required className="border rounded p-2 w-full" />
              <input name="email" type="email" placeholder="Email" required className="border rounded p-2 w-full" />
              <input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="Phone" required className="border rounded p-2 w-full" />
              <textarea name="note" placeholder="Notes (custom requests)" className="border rounded p-2 w-full" />
              <button className="btn btn-primary w-full">Checkout with Paystack</button>
              <p className="text-xs text-cocoa/60 text-center">Currency: NGN. One-time payments.</p>
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
