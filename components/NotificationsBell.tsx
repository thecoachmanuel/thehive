"use client"
import { useEffect, useRef, useState } from 'react'

type Notification = { id: number; title: string; body: string; createdAt: string; read: boolean }

export default function NotificationsBell() {
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(0)
  const [items, setItems] = useState<Notification[]>([])
  const [popup, setPopup] = useState<Notification | null>(null)
  const latestSeenIdRef = useRef<number | null>(null)
  const popupTimeoutRef = useRef<number | null>(null)

  async function load(allowPopup: boolean) {
    try {
      const cRes = await fetch('/api/notifications/unread')
      const cData = await cRes.json()
      setCount(Number(cData?.count || 0))
      const listRes = await fetch('/api/notifications')
      const list: Notification[] = await listRes.json()
      setItems(list)

      if (list.length > 0) {
        const maxId = list.reduce((m, n) => (n.id > m ? n.id : m), list[0].id)
        if (latestSeenIdRef.current === null) {
          latestSeenIdRef.current = maxId
        } else if (allowPopup && maxId > (latestSeenIdRef.current ?? 0)) {
          const threshold = latestSeenIdRef.current ?? 0
          const newest = list.find((n) => n.id > threshold) || list[0]
          latestSeenIdRef.current = maxId
          setPopup(newest)
          if (popupTimeoutRef.current) {
            window.clearTimeout(popupTimeoutRef.current)
          }
          popupTimeoutRef.current = window.setTimeout(() => {
            setPopup(null)
          }, 6000)
        }
      }
    } catch {}
  }

  useEffect(() => {
    load(false)
    const id = window.setInterval(() => load(true), 15000)
    return () => {
      window.clearInterval(id)
      if (popupTimeoutRef.current) {
        window.clearTimeout(popupTimeoutRef.current)
      }
    }
  }, [])

  async function markRead(id: number) {
    await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, read: true }) })
    load(false)
  }

  const hasUnread = count > 0

  return (
    <>
      <div className="relative">
        <button
          className={`relative inline-flex items-center justify-center w-10 h-10 rounded-full border transition-colors ${
            hasUnread ? 'border-caramel bg-caramel/10 hover:bg-caramel/20' : 'border-cream bg-cream/40 hover:bg-cream/70'
          }`}
          onClick={() => setOpen((v) => !v)}
          aria-label="Notifications"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className={`w-5 h-5 ${hasUnread ? 'text-caramel' : 'text-cocoa/70'}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 21 11.25v-.7a8.969 8.969 0 0 0-7.02-8.716 1.5 1.5 0 0 0-2.96 0A8.969 8.969 0 0 0 4 10.55v.7c0 1.97-.28 3.9-.689 5.523a24.255 24.255 0 0 0 5.546 1.309M9 18.75a3 3 0 0 0 6 0"
            />
          </svg>
          {hasUnread && (
            <>
              <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-caramel text-[10px] font-semibold text-white px-1.5">
                {count > 99 ? '99+' : count}
              </span>
              <span className="absolute -top-0.5 -right-0.5 inline-flex h-5 w-5 rounded-full bg-caramel/60 opacity-60 animate-ping" />
            </>
          )}
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-auto bg-white border border-cream rounded-2xl shadow-xl z-50">
            <div className="p-3 border-b border-cream flex justify-between items-center">
              <span className="font-semibold text-cocoa text-sm">Notifications</span>
              <button className="text-xs text-caramel" onClick={() => load(false)}>
                Refresh
              </button>
            </div>
            <div className="divide-y">
              {items.length === 0 ? (
                <div className="p-4 text-sm text-cocoa/60">No notifications</div>
              ) : (
                items.map((n) => (
                  <div key={n.id} className="p-3 flex gap-3 items-start">
                    <div className={`w-2 h-2 rounded-full mt-1 ${n.read ? 'bg-cream' : 'bg-caramel'}`} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-cocoa">{n.title}</p>
                      <p className="text-xs text-cocoa/70">{n.body}</p>
                      <div className="mt-1 flex justify-between items-center">
                        <span className="text-[10px] text-cocoa/50">{new Date(n.createdAt).toLocaleString()}</span>
                        {!n.read && (
                          <button onClick={() => markRead(n.id)} className="text-[10px] text-caramel">
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {popup && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm w-[320px]">
          <div className="card p-4 bg-white shadow-xl border border-cream">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-caramel/10 text-caramel">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 21 11.25v-.7a8.969 8.969 0 0 0-7.02-8.716 1.5 1.5 0 0 0-2.96 0A8.969 8.969 0 0 0 4 10.55v.7c0 1.97-.28 3.9-.689 5.523a24.255 24.255 0 0 0 5.546 1.309M9 18.75a3 3 0 0 0 6 0"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-caramel">New notification</p>
                <p className="mt-1 text-sm font-semibold text-cocoa">{popup.title}</p>
                <p className="mt-0.5 text-xs text-cocoa/70">{popup.body}</p>
                <button
                  className="mt-2 text-xs font-semibold text-caramel hover:text-cocoa"
                  onClick={() => {
                    setOpen(true)
                    setPopup(null)
                  }}
                >
                  View in panel
                </button>
              </div>
              <button
                className="ml-2 text-xs text-cocoa/40 hover:text-cocoa"
                onClick={() => setPopup(null)}
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
