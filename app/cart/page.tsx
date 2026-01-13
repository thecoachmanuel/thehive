"use client"
import Header from '@components/Header'
import Footer from '@components/Footer'
import { useCart } from '@components/CartProvider'
import { useEffect, useState } from 'react'
import { formatNgn } from '@lib/utils'
import Image from 'next/image'
import Link from 'next/link'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default function CartPage() {
  const { items, setQty, remove, total, count, clear } = useCart()
  const [settings, setSettings] = useState<{ businessName?: string; logoUrl?: string } | null>(null)
  useEffect(() => {
    fetch('/api/public/settings').then((r) => r.json()).then(setSettings).catch(() => setSettings({}))
  }, [])
  return (
    <div>
      <Header name={settings?.businessName} logoUrl={settings?.logoUrl ?? undefined} />
      <section className="container py-8 md:py-12">
        <div className="relative rounded-2xl overflow-hidden h-48 md:h-64 flex flex-col items-center justify-center text-center mb-8">
          <Image
            src="https://images.pexels.com/photos/1854652/pexels-photo-1854652.jpeg"
            alt="Cart Banner"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 text-white p-4">
            <h1 className="text-3xl md:text-5xl font-display font-bold">Your Cart</h1>
            <p className="mt-2 text-white/90 text-lg">Review your selected items.</p>
          </div>
        </div>
        {count === 0 ? (
          <div className="mt-3 flex flex-col items-center">
            <p className="text-cocoa/70">Your cart is empty.</p>
            <Link href="/shop" className="btn btn-primary mt-4 inline-block w-fit">Back to Shop</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
            <div className="md:col-span-2 space-y-4">
              {items.map((i) => (
                <div key={i.productId} className="card p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-cocoa">{i.name}</p>
                    <p className="text-sm text-cocoa/70">{formatNgn(i.priceNgn)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="number" min={1} value={i.quantity} onChange={(e) => setQty(i.productId, Number(e.target.value))} className="w-20 border rounded p-2" />
                    <button className="btn btn-secondary" onClick={() => remove(i.productId)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="card p-4">
              <h2 className="font-bold text-cocoa">Summary</h2>
              <p className="mt-2 text-cocoa/70">Items: {count}</p>
              <p className="mt-1 text-caramel font-semibold">Subtotal: {formatNgn(total)}</p>
              <p className="text-xs text-cocoa/60 mt-2">Delivery calculated at checkout</p>
              <Link href="/checkout" className="btn btn-primary w-full mt-4 block text-center">Proceed to Checkout</Link>
              <button className="btn btn-secondary w-full mt-3" onClick={clear}>Clear Cart</button>
            </div>
          </div>
        )}
      </section>
      <Footer />
    </div>
  )
}
