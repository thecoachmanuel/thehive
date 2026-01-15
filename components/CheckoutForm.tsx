"use client"
import { useCart } from './CartProvider'
import { useState, useMemo } from 'react'
import { formatNgn, isValidPhoneNumber } from '@lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type DeliverySetting = {
  isActive: boolean
  method: string
  rate: number
  freeThreshold: number | null
}

type User = {
  name: string | null
  email: string
  phone: string | null
}

export default function CheckoutForm({ settings, user }: { settings: DeliverySetting | null, user: User | null }) {
	const { items, total, clear } = useCart()
  const router = useRouter()
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup')
  const [createAccount, setCreateAccount] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    password: '',
    confirmPassword: '',
    note: ''
  })

  // Calculate delivery fee
  const deliveryFee = useMemo(() => {
    if (deliveryMethod === 'pickup' || !settings || !settings.isActive) return 0
    if (settings.freeThreshold && total >= settings.freeThreshold) return 0
    if (settings.method === 'percentage') return Math.round(total * (settings.rate / 100))
    return settings.rate
  }, [deliveryMethod, settings, total])

  const finalTotal = total + deliveryFee

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()

    if (!isValidPhoneNumber(formData.phone)) {
      alert('Please enter a valid phone number')
      return
    }

    if (!user && createAccount) {
      if (!formData.password || !formData.confirmPassword) {
        alert('Please enter and confirm your password')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match')
        return
      }
    }

    setLoading(true)
    try {
			const res = await fetch('/api/order/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
          deliveryMethod,
          deliveryFee,
          createAccount: user ? false : createAccount // Don't create account if user is logged in
        })
      })
			const data = await res.json()
			if (data.url) {
				clear()
				window.location.href = data.url
			} else if (data.orderId) {
				clear()
				router.push(`/order/success?id=${data.orderId}&code=${data.trackingCode}`)
			} else {
        alert(data.error || 'Something went wrong')
      }
    } catch {
      alert('Failed to process order')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-cocoa/70">Your cart is empty.</p>
        <Link href="/shop" className="btn btn-primary mt-4 inline-block">Back to Shop</Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="card p-6">
          <h2 className="text-xl font-bold text-cocoa mb-4">Contact Information</h2>
          <div className="space-y-3">
            <input
              required
              placeholder="Full Name"
              className="input w-full border rounded p-2"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              required
              type="email"
              placeholder="Email"
              className="input w-full border rounded p-2"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
            <input
              required
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="Phone Number"
              className="input w-full border rounded p-2"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />
            
            {!user && (
              <>
                <label className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={createAccount}
                    onChange={e => setCreateAccount(e.target.checked)}
                  />
                  <span className="text-sm text-cocoa">Create an account for faster checkout next time</span>
                </label>
                {createAccount && (
                  <>
                    <input
                      required
                      type="password"
                      placeholder="Choose a Password"
                      className="input w-full border rounded p-2"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                    <input
                      required
                      type="password"
                      placeholder="Confirm Password"
                      className="input w-full border rounded p-2"
                      value={formData.confirmPassword}
                      onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                  </>
                )}
              </>
            )}
          </div>
		</div>

			{!user && (
				<div className="card p-4 mt-4 text-sm text-cocoa/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
					<p>Already have an account?</p>
					<Link href="/login?redirect=/checkout" className="btn btn-outline text-sm">
						Sign in and continue checkout
					</Link>
				</div>
			)}

        <div className="card p-6">
          <h2 className="text-xl font-bold text-cocoa mb-4">Delivery Method</h2>
          <div className="flex gap-4 mb-4">
            <label className={`flex-1 border rounded p-4 cursor-pointer transition ${deliveryMethod === 'pickup' ? 'border-caramel bg-cream' : 'border-gray-200'}`}>
              <input
                type="radio"
                name="delivery"
                value="pickup"
                className="hidden"
                checked={deliveryMethod === 'pickup'}
                onChange={() => setDeliveryMethod('pickup')}
              />
              <div className="font-bold text-cocoa">Pickup</div>
              <div className="text-sm text-cocoa/70">Free</div>
            </label>
            {settings?.isActive && (
              <label className={`flex-1 border rounded p-4 cursor-pointer transition ${deliveryMethod === 'delivery' ? 'border-caramel bg-cream' : 'border-gray-200'}`}>
                <input
                  type="radio"
                  name="delivery"
                  value="delivery"
                  className="hidden"
                  checked={deliveryMethod === 'delivery'}
                  onChange={() => setDeliveryMethod('delivery')}
                />
                <div className="font-bold text-cocoa">Delivery</div>
                <div className="text-sm text-cocoa/70">
                  {settings.method === 'percentage' ? `${settings.rate}%` : formatNgn(settings.rate)}
                </div>
              </label>
            )}
          </div>

          {deliveryMethod === 'delivery' && (
            <textarea
              required
              placeholder="Delivery Address"
              className="input w-full border rounded p-2 h-24"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
            />
          )}
          
          <textarea
            placeholder="Order Notes (Optional)"
            className="input w-full border rounded p-2 mt-3 h-20"
            value={formData.note}
            onChange={e => setFormData({ ...formData, note: e.target.value })}
          />
        </div>
      </div>

      <div>
        <div className="card p-6 sticky top-24">
          <h2 className="text-xl font-bold text-cocoa mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
            {items.map(item => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span>{item.quantity}x Product #{item.productId}</span>
                <span>{formatNgn(item.priceNgn * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-cocoa">
              <span>Subtotal</span>
              <span>{formatNgn(total)}</span>
            </div>
            <div className="flex justify-between text-cocoa">
              <span>Delivery</span>
              <span>{deliveryFee === 0 ? 'Free' : formatNgn(deliveryFee)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-caramel pt-2 border-t">
              <span>Total</span>
              <span>{formatNgn(finalTotal)}</span>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn btn-primary w-full mt-6 py-3 text-lg"
          >
            {loading ? 'Processing...' : 'Place Order'}
          </button>
          <p className="text-center text-xs text-cocoa/60 mt-4">
            Secure checkout powered by Paystack
          </p>
        </div>
      </div>
    </div>
  )
}
