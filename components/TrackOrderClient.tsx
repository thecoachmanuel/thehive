"use client"
import { useState } from 'react'
import { formatNgn } from '@lib/utils'

type OrderItem = {
  id: number
  product: { name: string }
  quantity: number
  unitPriceNgn: number
}

type OrderTrackResult = {
  id: number
  trackingCode: string
  createdAt: string
  status: string
  totalAmountNgn: number
  deliveryMethod: 'pickup' | 'delivery'
  deliveryAddress?: string
  items: OrderItem[]
}

function isErrorResponse(x: unknown): x is { error?: string } {
  return typeof x === 'object' && x !== null && 'error' in (x as Record<string, unknown>)
}

export default function TrackOrderClient() {
  const [orderId, setOrderId] = useState('')
  const [email, setEmail] = useState('')
  const [result, setResult] = useState<OrderTrackResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch(`/api/order/track?id=${orderId}&email=${email}`)
      const data: unknown = await res.json()
      if (res.ok) {
        setResult(data as OrderTrackResult)
      } else {
        setError(isErrorResponse(data) ? (data.error || 'Order not found') : 'Order not found')
      }
    } catch {
      setError('Failed to track order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="container py-12 min-h-[60vh]">
      <h1 className="text-3xl font-display font-bold text-cocoa text-center mb-8">Track Your Order</h1>
      <div className="max-w-md mx-auto">
        <form className="card p-6" onSubmit={handleTrack}>
          <div className="space-y-4">
            <input
              required
              placeholder="Order ID or Tracking Code"
              className="input w-full border rounded p-2"
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
            />
            <input
              required
              type="email"
              placeholder="Email Address"
              className="input w-full border rounded p-2"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button disabled={loading} className="btn btn-primary w-full">
              {loading ? 'Tracking...' : 'Track Order'}
            </button>
          </div>
        </form>

        {error && <div className="mt-6 p-4 bg-red-100 text-red-700 rounded text-center">{error}</div>}

        {result && (
          <div className="mt-8 card p-6 border-t-4 border-caramel">
            <h2 className="text-xl font-bold text-cocoa mb-6 text-center">Order Status</h2>
            <div className="relative mb-12 mt-4 px-4">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-cream -translate-y-1/2" />
              <div 
                className="absolute top-1/2 left-0 h-1 bg-caramel -translate-y-1/2 transition-all duration-1000" 
                style={{ 
                  width: result.status === 'Order received' ? '0%' : 
                         result.status === 'Order processing' ? '33%' : 
                         result.status === 'Order in transit' ? '66%' : 
                         result.status === 'Order delivered' ? '100%' : '0%' 
                }} 
              />
              <div className="relative flex justify-between">
                {[
                  { label: 'Received', status: 'Order received' },
                  { label: 'Processing', status: 'Order processing' },
                  { label: 'In Transit', status: 'Order in transit' },
                  { label: 'Delivered', status: 'Order delivered' }
                ].map((step, idx) => {
                  const statuses = ['Order received', 'Order processing', 'Order in transit', 'Order delivered']
                  const currentIdx = statuses.indexOf(result.status)
                  const isActive = currentIdx >= idx
                  return (
                    <div key={step.label} className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors border-2 ${
                        isActive ? 'bg-caramel border-caramel text-white' : 'bg-white border-cream text-cocoa/30'
                      }`}>
                        {idx + 1}
                      </div>
                      <span className={`absolute -bottom-7 text-[10px] md:text-xs font-semibold whitespace-nowrap transition-colors ${
                        isActive ? 'text-cocoa' : 'text-cocoa/30'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="space-y-2 text-cocoa/80 mt-12 pt-6 border-t">
              <p><strong>Status:</strong> <span className="uppercase text-caramel">{result.status}</span></p>
              <p><strong>Order ID:</strong> #{result.id}</p>
              <p><strong>Tracking Code:</strong> {result.trackingCode}</p>
              <p><strong>Date:</strong> {new Date(result.createdAt).toLocaleDateString()}</p>
              <p><strong>Total:</strong> {formatNgn(result.totalAmountNgn)}</p>
              {result.deliveryMethod === 'delivery' && (
                <p><strong>Delivery Address:</strong> {result.deliveryAddress}</p>
              )}
              <div className="mt-4 pt-4 border-t">
                <h3 className="font-bold text-cocoa mb-2">Items</h3>
                {result.items.map((item: OrderItem) => (
                  <div key={item.id} className="flex justify-between text-sm py-1">
                    <span>{item.quantity}x {item.product.name}</span>
                    <span>{formatNgn(item.unitPriceNgn * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
