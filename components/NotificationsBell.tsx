"use client"
import { useEffect, useState } from 'react'

type Notification = { id: number; title: string; body: string; createdAt: string; read: boolean }

export default function NotificationsBell() {
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(0)
  const [items, setItems] = useState<Notification[]>([])

  async function load() {
    try {
      const cRes = await fetch('/api/notifications/unread')
      const cData = await cRes.json()
      setCount(Number(cData?.count || 0))
      const listRes = await fetch('/api/notifications')
      const list = await listRes.json()
      setItems(list)
    } catch {}
  }

  useEffect(() => {
    load()
    const id = setInterval(load, 15000)
    return () => clearInterval(id)
  }, [])

  async function markRead(id: number) {
    await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, read: true }) })
    load()
  }

  return (
    <div className="relative">
      <button className="relative" onClick={() => setOpen((v) => !v)} aria-label="Notifications">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 text-cocoa">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 21 11.25v-.7a8.969 8.969 0 0 0-7.02-8.716 1.5 1.5 0 0 0-2.96 0A8.969 8.969 0 0 0 4 10.55v.7c0 1.97-.28 3.9-.689 5.523a24.255 24.255 0 0 0 5.546 1.309M9 18.75a3 3 0 0 0 6 0" />
        </svg>
        {count > 0 && <span className="absolute -top-1 -right-1 bg-caramel text-white text-xs rounded-full px-1.5 py-0.5">{count}</span>}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-auto bg-white border border-cream rounded shadow-lg z-50">
          <div className="p-3 border-b border-cream flex justify-between items-center">
            <span className="font-semibold text-cocoa">Notifications</span>
            <button className="text-xs text-caramel" onClick={load}>Refresh</button>
          </div>
          <div className="divide-y">
            {items.length === 0 ? (
              <div className="p-4 text-sm text-cocoa/60">No notifications</div>
            ) : (
              items.map(n => (
                <div key={n.id} className="p-3 flex gap-3 items-start">
                  <div className={`w-2 h-2 rounded-full mt-1 ${n.read ? 'bg-cream' : 'bg-caramel'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-cocoa">{n.title}</p>
                    <p className="text-xs text-cocoa/70">{n.body}</p>
                    <div className="mt-1 flex justify-between items-center">
                      <span className="text-[10px] text-cocoa/50">{new Date(n.createdAt).toLocaleString()}</span>
                      {!n.read && <button onClick={() => markRead(n.id)} className="text-[10px] text-caramel">Mark as read</button>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
