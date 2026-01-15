"use client"
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type CartItem = { productId: number; name: string; priceNgn: number; imageUrl: string; quantity: number }
type CartContextType = {
  items: CartItem[]
  add: (item: Omit<CartItem, 'quantity'>, qty?: number) => void
  remove: (productId: number) => void
  setQty: (productId: number, qty: number) => void
  clear: () => void
  count: number
  total: number
  lastUpdatedAt: number | null
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null)
  useEffect(() => {
    const raw = localStorage.getItem('cart')
    if (raw) setItems(JSON.parse(raw))
    const tsRaw = localStorage.getItem('cart_last_updated')
    if (tsRaw) setLastUpdatedAt(Number(tsRaw) || null)
  }, [])
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
    if (items.length === 0) {
      localStorage.removeItem('cart_last_updated')
      setLastUpdatedAt(null)
    }
  }, [items])
  useEffect(() => {
    if (lastUpdatedAt) {
      localStorage.setItem('cart_last_updated', String(lastUpdatedAt))
    }
  }, [lastUpdatedAt])
  const api = useMemo<CartContextType>(() => {
    return {
      items,
      add: (item, qty = 1) => {
        setItems((prev) => {
          const i = prev.find((p) => p.productId === item.productId)
          if (i) return prev.map((p) => (p.productId === item.productId ? { ...p, quantity: p.quantity + qty } : p))
          return [...prev, { ...item, quantity: qty }]
        })
        setLastUpdatedAt(Date.now())
      },
      remove: (productId) => {
        setItems((prev) => prev.filter((p) => p.productId !== productId))
        setLastUpdatedAt(Date.now())
      },
      setQty: (productId, qty) => {
        setItems((prev) => prev.map((p) => (p.productId === productId ? { ...p, quantity: Math.max(1, qty) } : p)))
        setLastUpdatedAt(Date.now())
      },
      clear: () => {
        setItems([])
        setLastUpdatedAt(null)
      },
      count: items.reduce((s, i) => s + i.quantity, 0),
      total: items.reduce((s, i) => s + i.priceNgn * i.quantity, 0),
      lastUpdatedAt
    }
  }, [items, lastUpdatedAt])
  return <CartContext.Provider value={api}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('Cart not ready')
  return ctx
}
