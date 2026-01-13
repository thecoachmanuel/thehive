"use client"
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useCart } from './CartProvider'
import { useAuth } from './AuthProvider'
import NotificationsBell from './NotificationsBell'

type PublicSettings = { businessName?: string | null; logoUrl?: string | null }

export default function Header({ name, logoUrl }: { name?: string; logoUrl?: string }) {
  const [open, setOpen] = useState(false)
  const [site, setSite] = useState<PublicSettings | null>(null)
  const { count } = useCart()
  const { isLoggedIn, isAdmin } = useAuth()

  useEffect(() => {
    if (name || logoUrl) return
    let active = true
    ;(async () => {
      try {
        const res = await fetch('/api/public/settings')
        if (res.ok) {
          const json = await res.json()
          if (active) setSite(json)
        }
      } catch {}
    })()
    return () => { active = false }
  }, [name, logoUrl])

  const displayName = name ?? site?.businessName ?? undefined
  const displayLogo = logoUrl ?? site?.logoUrl ?? undefined

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-cream">
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3">
          {displayLogo && (
            <Image src={displayLogo} alt="Logo" width={40} height={40} className="rounded-full" />
          )}
          {displayName && (
            <span className="font-display text-lg md:text-xl font-bold text-cocoa">{displayName}</span>
          )}
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/about" className="hover:text-caramel">About</Link>
          <Link href="/shop" className="hover:text-caramel">Shop</Link>
          <Link href="/contact" className="hover:text-caramel">Contact</Link>
          {isLoggedIn && !isAdmin && (
            <>
              <Link href="/track" className="hover:text-caramel">Track Order</Link>
              <Link href="/orders" className="hover:text-caramel">My Orders</Link>
            </>
          )}
          {isAdmin && <NotificationsBell />}
          <Link href={isAdmin ? '/admin' : '/account'} className="hover:text-caramel flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              <span>Account</span>
            </Link>
          <Link href="/cart" className="relative">
            <span className="inline-flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-cocoa">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
              <span className="text-sm">Cart</span>
            </span>
            {count > 0 && <span className="absolute -top-2 -right-2 bg-caramel text-white text-xs rounded-full px-2 py-0.5">{count}</span>}
          </Link>
        </nav>
        <div className="md:hidden flex items-center gap-3">
          <Link href="/cart" className="relative">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-cream">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-cocoa">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
            </span>
            {count > 0 && <span className="absolute -top-2 -right-2 bg-caramel text-white text-xs rounded-full px-2 py-0.5">{count}</span>}
          </Link>
          <button className="btn btn-secondary p-2" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-cream">
          <div className="container py-3 flex flex-col gap-2">
            <Link href="/about" className="hover:text-caramel" onClick={() => setOpen(false)}>About</Link>
            <Link href="/shop" className="hover:text-caramel" onClick={() => setOpen(false)}>Shop</Link>
            <Link href="/contact" className="hover:text-caramel" onClick={() => setOpen(false)}>Contact</Link>
            {isLoggedIn && !isAdmin && (
              <>
                <Link href="/track" className="hover:text-caramel" onClick={() => setOpen(false)}>Track Order</Link>
                <Link href="/orders" className="hover:text-caramel" onClick={() => setOpen(false)}>My Orders</Link>
              </>
            )}
            <Link href={isAdmin ? '/admin' : '/account'} className="hover:text-caramel" onClick={() => setOpen(false)}>My Account</Link>
            <Link href="/cart" className="hover:text-caramel" onClick={() => setOpen(false)}>Cart{count > 0 ? ` (${count})` : ''}</Link>
          </div>
        </div>
      )}
    </header>
  )
}
