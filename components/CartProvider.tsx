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
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  useEffect(() => {
    const raw = localStorage.getItem('cart')
    if (raw) setItems(JSON.parse(raw))
  }, [])
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])
  const api = useMemo<CartContextType>(() => {
    return {
      items,
      add: (item, qty = 1) => {
        setItems((prev) => {
          const i = prev.find((p) => p.productId === item.productId)
          if (i) return prev.map((p) => (p.productId === item.productId ? { ...p, quantity: p.quantity + qty } : p))
          return [...prev, { ...item, quantity: qty }]
        })
      },
      remove: (productId) => setItems((prev) => prev.filter((p) => p.productId !== productId)),
      setQty: (productId, qty) => setItems((prev) => prev.map((p) => (p.productId === productId ? { ...p, quantity: Math.max(1, qty) } : p))),
      clear: () => setItems([]),
      count: items.reduce((s, i) => s + i.quantity, 0),
      total: items.reduce((s, i) => s + i.priceNgn * i.quantity, 0)
    }
  }, [items])
  return <CartContext.Provider value={api}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('Cart not ready')
  return ctx
}
