"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCart } from './CartProvider'

const REMINDER_DELAY_MS = 3 * 60 * 1000

export default function CartReminder() {
	const { count, lastUpdatedAt } = useCart()
	const [visible, setVisible] = useState(false)
	const [hasInteracted, setHasInteracted] = useState(false)

	useEffect(() => {
		if (!lastUpdatedAt || count === 0) {
			setVisible(false)
			return
		}
		if (hasInteracted) return
		const now = Date.now()
		const elapsed = now - lastUpdatedAt
		if (elapsed >= REMINDER_DELAY_MS) {
			setVisible(true)
			return
		}
		const remaining = REMINDER_DELAY_MS - elapsed
		const id = window.setTimeout(() => {
			setVisible(true)
		}, remaining)
		return () => {
			window.clearTimeout(id)
		}
	}, [lastUpdatedAt, count, hasInteracted])

	useEffect(() => {
		if (typeof window === 'undefined') return
		const handleActivity = () => {
			setHasInteracted(true)
			setVisible(false)
		}
		window.addEventListener('visibilitychange', () => {
			if (document.visibilityState === 'visible') handleActivity()
		})
		window.addEventListener('focus', handleActivity)
		return () => {
			window.removeEventListener('focus', handleActivity)
		}
	}, [])

	if (!visible || count === 0) return null

	return (
		<div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-md w-[90%]">
			<div className="card px-4 py-3 flex items-center justify-between gap-3 shadow-lg bg-white/95 border border-cream">
				<div className="flex flex-col text-sm text-cocoa/90">
					<span className="font-semibold">You still have items in your cart</span>
					<span className="text-xs text-cocoa/70">Complete your order before your favourites sell out.</span>
				</div>
				<div className="flex items-center gap-2">
					<Link
						href="/cart"
						className="btn btn-primary btn-sm text-xs px-3"
						onClick={() => setHasInteracted(true)}
					>
						View cart ({count})
					</Link>
					<button
						type="button"
						className="text-xs text-cocoa/60 hover:text-cocoa/90"
						onClick={() => {
							setHasInteracted(true)
							setVisible(false)
						}}
					>
						Not now
					</button>
				</div>
			</div>
		</div>
	)
}
