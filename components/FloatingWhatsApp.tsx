"use client"
import { useEffect, useState } from 'react'

export default function FloatingWhatsApp() {
  const [link, setLink] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/site/settings')
        const data = await res.json()
        const number = String(data?.whatsappNumber || '08166017556')
        const intl = number.replace(/\D/g, '').replace(/^0/, '234')
        setLink(`https://wa.me/${intl}`)
      } catch {}
    }
    load()
  }, [])

  if (!link) return null

  return (
    <a href={link} target="_blank" aria-label="WhatsApp chat"
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-green-500 shadow-lg flex items-center justify-center hover:bg-green-600">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
        <path d="M.057 24l1.687-6.163a10.004 10.004 0 1 1 3.71 3.71L.057 24zM12 3.1A8.9 8.9 0 0 0 3.1 12c0 1.54.39 3.02 1.12 4.34l-.73 2.67 2.74-.72A8.9 8.9 0 1 0 12 3.1zm5.14 11.04c-.28-.14-1.64-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.12-.12.28-.32.42-.48.14-.16.18-.28.28-.46.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.83-2-.22-.53-.44-.46-.61-.46-.16 0-.34 0-.52 0-.18 0-.48.07-.73.34-.25.28-.96.94-.96 2.28s.98 2.64 1.12 2.82c.14.18 1.93 2.95 4.68 4.14.65.28 1.16.45 1.55.57.65.2 1.24.17 1.71.1.52-.08 1.64-.67 1.87-1.32.23-.65.23-1.21.16-1.32-.07-.11-.25-.18-.53-.32z" />
      </svg>
    </a>
  )
}
