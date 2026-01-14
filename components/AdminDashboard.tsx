/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client"
import { useState, useEffect } from 'react'
import { formatNgn } from '@lib/utils'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

function ImageUploader({ name, defaultValue, placeholder, required }: { name: string, defaultValue?: string, placeholder?: string, required?: boolean }) {
  const [url, setUrl] = useState(defaultValue || '')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    setUrl(defaultValue || '')
  }, [defaultValue])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      if (data.url) setUrl(data.url)
    } catch (err) {
      console.error(err)
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <input 
        name={name} 
        value={url} 
        onChange={(e) => setUrl(e.target.value)}
        className="input w-full border rounded p-2" 
        placeholder={placeholder || "https://... or upload"}
        required={required}
      />
      <label className="btn btn-outline whitespace-nowrap cursor-pointer px-3 py-2 h-auto flex items-center">
        {uploading ? '...' : 'Upload'}
        <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
      </label>
    </div>
  )
}

function ColorField({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  const [hex, setHex] = useState<string>(defaultValue || '#000000')
  useEffect(() => { setHex(defaultValue || '#000000') }, [defaultValue])
  const onHexChange = (v: string) => {
    let val = v.trim()
    if (!val.startsWith('#')) val = `#${val.replace('#','')}`
    val = val.slice(0, 7)
    setHex(val)
  }
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-cocoa">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={hex} onChange={(e) => setHex(e.target.value)} className="input w-24 h-10 p-0 border rounded" />
        <input type="text" value={hex} onChange={(e) => onHexChange(e.target.value)} placeholder="#RRGGBB" className="input w-full border rounded p-2 font-mono" pattern="^#([A-Fa-f0-9]{6})$" />
      </div>
      <input type="hidden" name={name} value={hex} />
    </div>
  )
}

const ORDER_STATUSES = [
  'Order received',
  'Order processing',
  'Order in transit',
  'Order delivered',
  'Cancelled'
]

type AdminDashboardProps = {
  settings: any
  categories: any[]
  products: any[]
  slides: any[]
  orders: any[]
  messages?: any[]
  notifications?: any[]
  deliverySettings: any
  initialTab?: string
}

export default function AdminDashboard({ settings, categories, products, slides, orders, messages = [], notifications = [], deliverySettings, initialTab }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState(initialTab || 'analytics')

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab)
  }, [initialTab])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tab)
    window.history.pushState({}, '', url)
  }

  const [localOrders, setLocalOrders] = useState(orders)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [editingSlide, setEditingSlide] = useState<any>(null)
  const [localMessages, setLocalMessages] = useState(messages)
  const [localNotifications, setLocalNotifications] = useState(notifications)

  // Order Filters State
  const [orderSearch, setOrderSearch] = useState('')
  const [orderStatus, setOrderStatus] = useState('')
  const [orderDateFrom, setOrderDateFrom] = useState('')
  const [orderDateTo, setOrderDateTo] = useState('')

  // Filter Logic
  const filteredOrders = localOrders.filter(o => {
    const matchSearch = !orderSearch || 
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) || 
      o.email.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.id.toString().includes(orderSearch) ||
      o.trackingCode?.toLowerCase().includes(orderSearch.toLowerCase())
    
    const matchStatus = !orderStatus || o.status === orderStatus
    
    const d = new Date(o.createdAt)
    const f = orderDateFrom ? new Date(orderDateFrom) : null
    const t = orderDateTo ? new Date(orderDateTo) : null
    if (t) t.setHours(23, 59, 59, 999)

    const matchDate = (!f || d >= f) && (!t || d <= t)

    return matchSearch && matchStatus && matchDate
  })

  const exportOrdersCSV = () => {
    const lines = [
      `Site,${settings?.businessName || 'TheHive Cakes'}`,
      `Report,Order Report`,
      `Generated,${new Date().toLocaleString()}`,
      '',
      'ID,Date,Customer,Email,Phone,Status,Total,Tracking Code'
    ]
    
    filteredOrders.forEach(o => {
      lines.push(`${o.id},"${new Date(o.createdAt).toLocaleDateString()}","${o.customerName}","${o.email}","${o.phone}","${o.status}",${o.totalAmountNgn},"${o.trackingCode || ''}"`)
    })

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders_export_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportOrdersPDF = () => {
    const doc = new jsPDF()
    
    doc.setFontSize(22)
    doc.setTextColor(40)
    doc.text(settings?.businessName || 'TheHive Cakes', 14, 20)
    
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Order Report | Generated: ${new Date().toLocaleString()}`, 14, 28)

    autoTable(doc, {
      startY: 35,
      head: [['ID', 'Date', 'Customer', 'Status', 'Total', 'Tracking']],
      body: filteredOrders.map(o => [
        `#${o.id}`,
        new Date(o.createdAt).toLocaleDateString(),
        `${o.customerName}\n${o.phone}`,
        o.status,
        formatNgn(o.totalAmountNgn),
        o.trackingCode || '-'
      ]),
      theme: 'grid',
      headStyles: { fillColor: [210, 105, 30] },
      styles: { fontSize: 8, cellPadding: 3 },
    })

    doc.save(`orders_export_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  useEffect(() => {
    let alive = true
    const run = async () => {
      try {
        const res = await fetch('/api/admin/sync', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (!alive) return
        if (data.orders) setLocalOrders(data.orders)
        if (data.messages) setLocalMessages(data.messages)
        if (data.notifications) setLocalNotifications(data.notifications)
      } catch (e) {
        const msg = (e as Error)?.message || ''
        if (msg.includes('Failed to fetch')) return
      }
    }
    run()
    const interval = setInterval(run, 15000)
    return () => { alive = false; clearInterval(interval) }
  }, [])

  const deleteOrder = async (id: number) => {
    if (!confirm('Are you sure you want to delete this order? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/admin/order?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setLocalOrders(prev => prev.filter(o => o.id !== id))
    } catch (error) {
      alert('Failed to delete order')
    }
  }

  const deleteMessage = async (id: number) => {
    if (!confirm('Are you sure you want to delete this message?')) return
    try {
      const res = await fetch(`/api/contact?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setLocalMessages(prev => prev.filter(m => m.id !== id))
    } catch (error) {
      alert('Failed to delete message')
    }
  }

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    setLocalOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    
    try {
      const res = await fetch('/api/admin/order', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus })
      })
      if (!res.ok) throw new Error('Failed to update')
    } catch (err) {
      console.error(err)
      alert('Failed to update status')
    }
  }

  const deleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      const res = await fetch(`/api/admin/product?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        window.location.reload()
      } else {
        alert('Failed to delete product')
      }
    } catch (err) {
      console.error(err)
      alert('Error deleting product')
    }
  }

  const deleteCategory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category? Ensure it has no products first.')) return
    try {
      const res = await fetch(`/api/admin/category?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        window.location.reload()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete category')
      }
    } catch (err) {
      console.error(err)
      alert('Error deleting category')
    }
  }

  const saveCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/admin/category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData as any))
      })
      const data = await res.json()
      if (data.success) {
        window.location.reload()
      } else {
        alert(data.error || 'Failed to save category')
      }
    } catch (err) {
      console.error(err)
      alert('Error saving category')
    }
  }

  const deleteSlide = async (id: number) => {
    if (!confirm('Are you sure you want to delete this slide?')) return
    try {
      const res = await fetch(`/api/admin/slide?id=${id}`, { method: 'DELETE' })
      if (res.ok) window.location.reload()
      else alert('Failed to delete slide')
    } catch (err) {
      console.error(err)
      alert('Error deleting slide')
    }
  }

  const saveSlide = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/admin/slide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData as any))
      })
      if (res.ok) window.location.reload()
      else alert('Failed to save slide')
    } catch (err) {
      console.error(err)
      alert('Error saving slide')
    }
  }

  const saveDelivery = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/admin/delivery-settings', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData as any))
      })
      if (res.ok) window.location.reload()
      else alert('Failed to save delivery settings')
    } catch (err) {
      console.error(err)
      alert('Error saving delivery settings')
    }
  }

  

  const markNotificationRead = async (id: number) => {
    try {
      const res = await fetch(`/api/notifications?id=${id}`, { method: 'PUT' })
      if (res.ok) setLocalNotifications(prev => prev.map((n: any) => n.id === id ? { ...n, read: true } : n))
    } catch (e) {
      console.error(e)
    }
  }

  const markAllNotificationsRead = async () => {
    try {
      const res = await fetch('/api/notifications', { method: 'PUT' })
      if (res.ok) setLocalNotifications(prev => prev.map((n: any) => ({ ...n, read: true })))
    } catch (e) {
      console.error(e)
    }
  }

  const deleteNotification = async (id: number) => {
    try {
      const res = await fetch(`/api/notifications?id=${id}`, { method: 'DELETE' })
      if (res.ok) setLocalNotifications(prev => prev.filter((n: any) => n.id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  const clearAllNotifications = async () => {
    if (!confirm('Clear all notifications?')) return
    try {
      const res = await fetch('/api/notifications', { method: 'DELETE' })
      if (res.ok) setLocalNotifications([])
    } catch (e) {
      console.error(e)
    }
  }

  const exportProductsCSV = () => {
    const lines = [
      `Site,${settings?.businessName || 'TheHive Cakes'}`,
      `Report,Product Catalog`,
      `Generated,${new Date().toLocaleString()}`,
      '',
      'ID,Category,Name,Price,Description'
    ]
    
    // Sort by category first
    const sorted = [...products].sort((a, b) => {
      const cA = categories.find(c => c.id === a.categoryId)?.name || ''
      const cB = categories.find(c => c.id === b.categoryId)?.name || ''
      return cA.localeCompare(cB) || a.name.localeCompare(b.name)
    })

    sorted.forEach(p => {
      const cat = categories.find(c => c.id === p.categoryId)?.name || 'Uncategorized'
      lines.push(`${p.id},"${cat}","${p.name}",${p.priceNgn},"${(p.description || '').replace(/"/g, '""')}"`)
    })

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `products_catalog_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportProductsPDF = () => {
    const doc = new jsPDF()
    
    // Header
    doc.setFontSize(22)
    doc.setTextColor(210, 105, 30) // Chocolate
    doc.text(settings?.businessName || 'TheHive Cakes', 14, 20)
    
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Product Catalog | Generated: ${new Date().toLocaleString()}`, 14, 28)

    // Group by Category
    const grouped: Record<string, any[]> = {}
    products.forEach(p => {
      const cat = categories.find(c => c.id === p.categoryId)?.name || 'Uncategorized'
      if (!grouped[cat]) grouped[cat] = []
      grouped[cat].push(p)
    })

    let startY = 35

    Object.keys(grouped).sort().forEach(catName => {
      // Category Header
      doc.setFontSize(14)
      doc.setTextColor(0)
      doc.setFillColor(255, 248, 220) // Cornsilk/Cream
      doc.rect(14, startY, 182, 8, 'F')
      doc.text(catName, 16, startY + 6)
      
      startY += 10

      autoTable(doc, {
        startY,
        head: [['Product Name', 'Price (NGN)', 'Description']],
        body: grouped[catName].map(p => [
          p.name,
          formatNgn(p.priceNgn),
          p.description
        ]),
        theme: 'striped',
        headStyles: { fillColor: [210, 105, 30] },
        styles: { fontSize: 9, cellPadding: 3 },
        margin: { top: 10 },
      })

      // Update startY for next table (autotable attaches to doc object to track position)
      startY = (doc as any).lastAutoTable.finalY + 10
      
      // Page break check if needed (autotable handles most, but manual spacing helps)
      if (startY > 250) {
        doc.addPage()
        startY = 20
      }
    })

    doc.save(`products_catalog_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const tabs = [
    { id: 'analytics', label: 'Analytics' },
    { id: 'orders', label: 'Orders' },
    { id: 'products', label: 'Products' },
    { id: 'categories', label: 'Categories' },
    { id: 'slides', label: 'Hero Slides' },
    { id: 'messages', label: 'Messages' },
    { id: 'notify', label: 'Notifications' },
    { id: 'delivery', label: 'Delivery Settings' },
    { id: 'settings', label: 'Site Settings' },
  ]

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="md:w-64 shrink-0">
        <div className="card p-4 sticky top-24">
          <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
            {tabs.map(tab => {
              let count = 0
              if (tab.id === 'notify') count = localNotifications.filter((n: any) => !n.read).length
              if (tab.id === 'messages') count = localMessages.filter(m => !m.read).length
              if (tab.id === 'orders') count = localOrders.filter(o => o.status === 'pending').length

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`text-left px-4 py-3 rounded-lg transition-colors whitespace-nowrap flex justify-between items-center ${activeTab === tab.id ? 'bg-primary text-black font-bold' : 'hover:bg-cream text-cocoa'}`}
                >
                  <span className="flex items-center gap-2">
                    {tab.id === 'notify' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    )}
                    {tab.label}
                  </span>
                  {count > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{count}</span>}
                </button>
              )
            })}
          </nav>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        {activeTab === 'analytics' && (
          <div className="card p-6">
            <h2 className="text-xl font-bold text-cocoa mb-4">Analytics</h2>
            <AnalyticsPanel orders={localOrders} siteName={settings?.businessName} logoUrl={settings?.logoUrl} />
          </div>
        )}
        {activeTab === 'orders' && (
          <div className="card p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
               <h2 className="text-xl font-bold text-cocoa">Orders ({filteredOrders.length})</h2>
               <div className="flex gap-2">
                 <button onClick={exportOrdersCSV} className="btn btn-outline text-xs py-1 px-3 h-auto min-h-0">Export CSV</button>
                 <button onClick={exportOrdersPDF} className="btn btn-primary text-xs py-1 px-3 h-auto min-h-0">Export PDF</button>
               </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-cream/20 rounded-lg">
               <div>
                 <label className="text-xs font-bold text-cocoa mb-1 block">Search</label>
                 <input 
                   placeholder="Name, Email, ID..." 
                   className="input w-full border rounded p-2 text-sm"
                   value={orderSearch}
                   onChange={e => setOrderSearch(e.target.value)}
                 />
               </div>
               <div>
                 <label className="text-xs font-bold text-cocoa mb-1 block">Status</label>
                 <select 
                    className="input w-full border rounded p-2 text-sm"
                    value={orderStatus}
                    onChange={e => setOrderStatus(e.target.value)}
                 >
                   <option value="">All Statuses</option>
                   {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
               </div>
               <div>
                 <label className="text-xs font-bold text-cocoa mb-1 block">From Date</label>
                 <input 
                   type="date"
                   className="input w-full border rounded p-2 text-sm"
                   value={orderDateFrom}
                   onChange={e => setOrderDateFrom(e.target.value)}
                 />
               </div>
               <div>
                 <label className="text-xs font-bold text-cocoa mb-1 block">To Date</label>
                 <input 
                   type="date"
                   className="input w-full border rounded p-2 text-sm"
                   value={orderDateTo}
                   onChange={e => setOrderDateTo(e.target.value)}
                 />
               </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-cream">
                    <th className="py-2 px-2">ID</th>
                    <th className="py-2 px-2">Customer</th>
                    <th className="py-2 px-2">Tracking Code</th>
                    <th className="py-2 px-2">Amount</th>
                    <th className="py-2 px-2">Status</th>
                    <th className="py-2 px-2">Date</th>
                    <th className="py-2 px-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="border-b border-cream/50 hover:bg-cream/20 group">
                      <td className="py-3 px-2">#{o.id}</td>
                      <td className="py-3 px-2">
                        <div className="font-semibold">{o.customerName}</div>
                        <div className="text-xs text-cocoa/60">{o.email}</div>
                      </td>
                      <td className="py-3 px-2 font-mono text-xs">{o.trackingCode}</td>
                      <td className="py-3 px-2">{formatNgn(o.totalAmountNgn)}</td>
                      <td className="py-3 px-2">
                        <select
                          value={ORDER_STATUSES.includes(o.status) ? o.status : 'Order received'} 
                          onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                          className={`px-2 py-1 rounded text-xs border cursor-pointer outline-none ${
                            o.status === 'Order delivered' ? 'bg-green-100 text-green-700 border-green-200' : 
                            o.status === 'Cancelled' ? 'bg-red-100 text-red-700 border-red-200' : 
                            'bg-yellow-100 text-yellow-700 border-yellow-200'
                          }`}
                        >
                          {ORDER_STATUSES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-2">
                        <div className="font-medium">{new Date(o.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs text-cocoa/60">{new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td className="py-3 px-2">
                        <button 
                          onClick={() => deleteOrder(o.id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete Order"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                     <tr>
                       <td colSpan={7} className="text-center py-8 text-cocoa/50">No orders found matching your filters.</td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-end gap-2">
              <button onClick={exportProductsCSV} className="btn btn-outline text-xs py-1 px-3 h-auto min-h-0">Export CSV</button>
              <button onClick={exportProductsPDF} className="btn btn-primary text-xs py-1 px-3 h-auto min-h-0">Export PDF</button>
            </div>

            <form
              key={editingProduct?.id || 'new-product'}
              className="card p-6"
              onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                try {
                  const res = await fetch('/api/admin/product', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(Object.fromEntries(formData as any))
                  })
                  if (res.ok) window.location.reload()
                  else {
                    const data = await res.json().catch(() => null)
                    alert((data && data.error) || 'Failed to save product')
                  }
                } catch (err) {
                  console.error(err)
                  alert('Error saving product')
                }
              }}
            >
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold text-cocoa">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                 {editingProduct && (
                   <button type="button" onClick={() => setEditingProduct(null)} className="text-sm text-red-500 hover:underline">Cancel Edit</button>
                 )}
              </div>
              
              {editingProduct && <input type="hidden" name="id" value={editingProduct.id} />}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-cocoa">Product Name</label>
                  <input name="name" defaultValue={editingProduct?.name} required placeholder="e.g. Chocolate Cake" className="input w-full border rounded p-2" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-cocoa">Category</label>
                  <select name="categoryId" defaultValue={editingProduct?.categoryId} className="input w-full border rounded p-2">
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-cocoa">Price (₦)</label>
                  <input name="priceNgn" type="number" defaultValue={editingProduct?.priceNgn} required placeholder="e.g. 5000" className="input w-full border rounded p-2" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-cocoa">Image URL</label>
                  <ImageUploader name="imageUrl" defaultValue={editingProduct?.imageUrl} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-cocoa">Description</label>
                  <textarea name="description" defaultValue={editingProduct?.description} required placeholder="Product details..." className="input w-full border rounded p-2 h-24" />
                </div>
              </div>
              <button className="btn btn-primary mt-4">{editingProduct ? 'Update Product' : 'Add Product'}</button>
            </form>

            <div className="card p-6">
              <h2 className="text-xl font-bold text-cocoa mb-4">Existing Products ({products.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(p => (
                  <div key={p.id} className="border rounded p-3 flex gap-3 items-center group relative">
                    <img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded object-cover bg-cream" />
                    <div className="overflow-hidden flex-1">
                      <p className="font-bold truncate">{p.name}</p>
                      <p className="text-sm text-cocoa/70">{formatNgn(p.priceNgn)}</p>
                    </div>
                    <div className="flex gap-1 absolute right-2 top-2">
                      <button 
                        onClick={() => { setEditingProduct(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="bg-white shadow p-1 rounded text-xs font-bold text-caramel border border-caramel hover:bg-caramel hover:text-white"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteProduct(p.id)}
                        className="bg-white shadow p-1 rounded text-xs font-bold text-red-500 border border-red-500 hover:bg-red-500 hover:text-white"
                      >
                        Del
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-6">
            <form key={editingCategory?.id || 'new-category'} className="card p-6" onSubmit={saveCategory}>
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold text-cocoa">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
                 {editingCategory && (
                   <button type="button" onClick={() => setEditingCategory(null)} className="text-sm text-red-500 hover:underline">Cancel Edit</button>
                 )}
              </div>
              
              {editingCategory && <input type="hidden" name="id" value={editingCategory.id} />}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-cocoa">Category Name</label>
                  <input name="name" defaultValue={editingCategory?.name} required placeholder="e.g. Wedding Cakes" className="input w-full border rounded p-2" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-cocoa">Slug (URL friendly)</label>
                  <input name="slug" defaultValue={editingCategory?.slug} required placeholder="e.g. wedding-cakes" className="input w-full border rounded p-2" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-cocoa">Category Image (Required)</label>
                  <ImageUploader name="imageUrl" defaultValue={editingCategory?.imageUrl} required />
                </div>
              </div>
              <button className="btn btn-primary mt-4">{editingCategory ? 'Update Category' : 'Add Category'}</button>
            </form>

            <div className="card p-6">
              <h2 className="text-xl font-bold text-cocoa mb-4">Existing Categories ({categories.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(c => (
                  <div key={c.id} className="border rounded p-3 flex gap-3 items-center group relative">
                    <img src={c.imageUrl} alt={c.name} className="w-12 h-12 rounded object-cover bg-cream" />
                    <div className="overflow-hidden flex-1">
                      <p className="font-bold truncate">{c.name}</p>
                      <p className="text-sm text-cocoa/70">/{c.slug}</p>
                    </div>
                    <div className="flex gap-1 absolute right-2 top-2">
                      <button 
                        onClick={() => { setEditingCategory(c); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="bg-white shadow p-1 rounded text-xs font-bold text-caramel border border-caramel hover:bg-caramel hover:text-white"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteCategory(c.id)}
                        className="bg-white shadow p-1 rounded text-xs font-bold text-red-500 border border-red-500 hover:bg-red-500 hover:text-white"
                      >
                        Del
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'slides' && (
          <div className="space-y-6">
            <form key={editingSlide?.id || 'new-slide'} className="card p-6" onSubmit={saveSlide}>
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold text-cocoa">{editingSlide ? 'Edit Slide' : 'Add Hero Slide'}</h2>
                 {editingSlide && (
                   <button type="button" onClick={() => setEditingSlide(null)} className="text-sm text-red-500 hover:underline">Cancel Edit</button>
                 )}
              </div>
              
              {editingSlide && <input type="hidden" name="id" value={editingSlide.id} />}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-cocoa">Headline</label>
                  <input name="headline" defaultValue={editingSlide?.headline} required placeholder="e.g. Delicious Cakes" className="input w-full border rounded p-2" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-cocoa">Subtext</label>
                  <input name="subtext" defaultValue={editingSlide?.subtext} required placeholder="e.g. For all occasions" className="input w-full border rounded p-2" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-cocoa">CTA Text</label>
                  <input name="ctaText" defaultValue={editingSlide?.ctaText} placeholder="e.g. Shop Now" className="input w-full border rounded p-2" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-cocoa">CTA Link</label>
                  <input name="ctaLink" defaultValue={editingSlide?.ctaLink} placeholder="e.g. /shop" className="input w-full border rounded p-2" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-cocoa">Slide Image</label>
                  <ImageUploader name="imageUrl" defaultValue={editingSlide?.imageUrl} required />
                </div>
              </div>
              <button className="btn btn-primary mt-4">{editingSlide ? 'Update Slide' : 'Add Slide'}</button>
            </form>

            <div className="card p-6">
              <h2 className="text-xl font-bold text-cocoa mb-4">Active Slides ({slides.length})</h2>
              <div className="grid grid-cols-1 gap-4">
                {slides.map(s => (
                  <div key={s.id} className="border rounded p-3 flex gap-4 items-center group relative">
                    <img src={s.imageUrl} alt={s.headline} className="w-24 h-16 rounded object-cover bg-cream" />
                    <div className="flex-1">
                      <p className="font-bold">{s.headline}</p>
                      <p className="text-sm text-cocoa/70">{s.subtext}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { setEditingSlide(s); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="btn btn-outline text-xs h-8 min-h-0"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteSlide(s.id)}
                        className="btn btn-outline text-red-500 border-red-500 hover:bg-red-500 hover:text-white text-xs h-8 min-h-0"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'delivery' && (
          <div className="card p-6">
            <h2 className="text-xl font-bold text-cocoa mb-4">Delivery Settings</h2>
            <form onSubmit={saveDelivery} className="space-y-4 max-w-lg">
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isActive" defaultChecked={deliverySettings?.isActive} className="checkbox checkbox-primary" />
                  <span className="text-sm font-semibold text-cocoa">Enable Delivery Option</span>
                </label>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-cocoa">Delivery Fee Calculation Method</label>
                <select name="method" defaultValue={deliverySettings?.method} className="input w-full border rounded p-2">
                  <option value="flat">Flat Rate</option>
                  <option value="percentage">Percentage of Order</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-cocoa">Rate (NGN or %)</label>
                <input type="number" name="rate" defaultValue={deliverySettings?.rate} className="input w-full border rounded p-2" />
                <p className="text-xs text-cocoa/60">If Flat: Amount in NGN. If Percentage: Percent value (e.g. 10)</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-cocoa">Free Delivery Threshold (Optional)</label>
                <input type="number" name="freeThreshold" defaultValue={deliverySettings?.freeThreshold || ''} placeholder="e.g. 50000" className="input w-full border rounded p-2" />
                <p className="text-xs text-cocoa/60">Orders above this amount get free delivery. Leave empty to disable.</p>
              </div>

              <button className="btn btn-primary mt-4">Save Delivery Settings</button>
            </form>
          </div>
        )}

        {activeTab === 'settings' && (
          <form onSubmit={async (e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            try {
              const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.fromEntries(formData as any))
              })
              if (res.ok) window.location.reload()
              else alert('Failed to save settings')
            } catch (err) {
              console.error(err)
              alert('Error saving settings')
            }
          }} className="card p-6">
            <h2 className="text-xl font-bold text-cocoa mb-4">Site Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-cocoa">Business Name</label>
                <input name="businessName" defaultValue={settings?.businessName} required className="input w-full border rounded p-2" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-cocoa">Tagline</label>
                <input name="tagline" defaultValue={settings?.tagline} className="input w-full border rounded p-2" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-cocoa">WhatsApp Number</label>
                <input name="whatsappNumber" defaultValue={settings?.whatsappNumber} required className="input w-full border rounded p-2" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-cocoa">Location/Address</label>
                <input name="location" defaultValue={settings?.location} required className="input w-full border rounded p-2" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-cocoa">Years of Experience</label>
                <input name="yearsExperience" type="number" defaultValue={settings?.yearsExperience} required className="input w-full border rounded p-2" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-cocoa">Site Logo</label>
                <ImageUploader name="logoUrl" defaultValue={settings?.logoUrl} />
              </div>
              <div className="space-y-2">
                <ColorField label="Primary Color" name="primaryColor" defaultValue={settings?.primaryColor || '#6B3E2E'} />
              </div>
              <div className="space-y-2">
                <ColorField label="Accent Color" name="accentColor" defaultValue={settings?.accentColor || '#EFA86E'} />
              </div>
              <div className="space-y-2">
                <ColorField label="Cream Color" name="creamColor" defaultValue={settings?.creamColor || '#F5E9DA'} />
              </div>
              <div className="space-y-2">
                <ColorField label="Peach Color" name="peachColor" defaultValue={settings?.peachColor || '#F8D4C2'} />
              </div>
              <div className="space-y-2">
                <ColorField label="Blush Color" name="blushColor" defaultValue={settings?.blushColor || '#F4B6C2'} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-cocoa">Instagram Handle</label>
                <input name="instagram" defaultValue={settings?.instagram ?? ''} placeholder="@handle" className="input w-full border rounded p-2" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-cocoa">TikTok Handle</label>
                <input name="tiktok" defaultValue={settings?.tiktok ?? ''} placeholder="@handle" className="input w-full border rounded p-2" />
              </div>
            </div>
          <button className="btn btn-primary mt-6">Save Changes</button>
        </form>
        )}

        {activeTab === 'messages' && (
          <div className="card p-6">
            <h2 className="text-xl font-bold text-cocoa mb-4">Contact Messages ({localMessages.length})</h2>
            <div className="space-y-3">
              {localMessages.map(m => (
                <div key={m.id} className="p-4 border rounded relative group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-cocoa">{m.name} <span className="text-xs text-cocoa/60">({m.email}{m.phone ? `, ${m.phone}` : ''})</span></p>
                      <p className="text-sm text-cocoa/80 mt-1">{m.message}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs px-2 py-1 rounded ${m.read ? 'bg-cream text-cocoa/60' : 'bg-caramel/10 text-caramel'}`}>{m.read ? 'Read' : 'New'}</span>
                      <button type="button" onClick={() => deleteMessage(m.id)} className="text-xs text-red-500 hover:underline opacity-0 group-hover:opacity-100 transition-opacity">Delete</button>
                    </div>
                  </div>
                  <p className="text-[10px] text-cocoa/50 mt-2">{new Date(m.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notify' && (
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-cocoa">Notifications ({localNotifications.length})</h2>
              <div className="flex gap-2">
                <button onClick={markAllNotificationsRead} className="text-xs text-primary hover:underline">Mark all read</button>
                <button onClick={clearAllNotifications} className="text-xs text-red-500 hover:underline">Clear all</button>
              </div>
            </div>
            <div className="space-y-3">
              {localNotifications.map((n: any) => (
                <div key={n.id} className="p-4 border rounded flex gap-3 items-start group relative">
                  <div className={`w-2 h-2 rounded-full mt-1 ${n.read ? 'bg-cream' : 'bg-caramel'}`} />
                  <div className="flex-1">
                    <p className="font-semibold text-cocoa">{n.title}</p>
                    <p className="text-sm text-cocoa/80">{n.body}</p>
                    <p className="text-[10px] text-cocoa/50 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-4 bg-white pl-2">
                    {!n.read && <button onClick={() => markNotificationRead(n.id)} className="text-xs text-primary hover:underline">Mark read</button>}
                    <button onClick={() => deleteNotification(n.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                  </div>
                </div>
              ))}
              {localNotifications.length === 0 && <p className="text-center text-cocoa/50 py-8">No notifications</p>}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function AnalyticsPanel({ orders, siteName, logoUrl }: { orders: any[]; siteName?: string; logoUrl?: string }) {
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')

  const filtered = orders.filter(o => {
    const d = new Date(o.createdAt)
    const f = from ? new Date(from) : null
    const t = to ? new Date(to) : null
    return (!f || d >= f) && (!t || d <= t)
  })

  const totalSales = filtered.reduce((s, o) => s + Number(o.totalAmountNgn || 0), 0)
  const totalOrders = filtered.length
  const avgOrder = totalOrders ? Math.round(totalSales / totalOrders) : 0

  const productTotals: Record<string, number> = {}
  for (const o of filtered) {
    for (const it of (o.items || [])) {
      const name = it.product?.name || `#${it.productId}`
      productTotals[name] = (productTotals[name] || 0) + (it.unitPriceNgn * it.quantity)
    }
  }
  const topProducts = Object.entries(productTotals).sort((a, b) => b[1] - a[1]).slice(0, 5)

  function exportCSV() {
    const lines = [
      `Site,${siteName ?? ''}`,
      `Generated,${new Date().toLocaleString()}`,
      '',
      'Metric,Value',
      `Total Sales,${totalSales}`,
      `Total Orders,${totalOrders}`,
      `Average Order Value,${avgOrder}`,
      '',
      'Top Products,Amount'
    ]
    for (const [name, amt] of topProducts) lines.push(`${name},${amt}`)
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'analytics.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportPDF() {
    const doc = new jsPDF()
    
    // Add Logo if available (simple text fallback handled by layout)
    // Note: Loading external images in jsPDF often requires them to be base64 or same-origin.
    // We will focus on a clean layout.
    
    doc.setFontSize(20)
    doc.setTextColor(40)
    doc.text(siteName || 'Analytics Report', 14, 22)
    
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30)

    autoTable(doc, {
      startY: 40,
      head: [['Metric', 'Value']],
      body: [
        ['Total Sales', formatNgn(totalSales)],
        ['Total Orders', totalOrders.toString()],
        ['Average Order Value', formatNgn(avgOrder)],
      ],
      theme: 'grid',
      headStyles: { fillColor: [66, 66, 66] }
    })

    if (topProducts.length > 0) {
      doc.text('Top Products', 14, (doc as any).lastAutoTable.finalY + 10)
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 15,
        head: [['Product', 'Amount']],
        body: topProducts.map(([name, amt]) => [name, formatNgn(Number(amt))]),
        theme: 'striped',
        headStyles: { fillColor: [100, 100, 100] }
      })
    }

    doc.save('analytics.pdf')
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-sm text-cocoa/60">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input w-full border rounded p-2" />
        </div>
        <div>
          <label className="text-sm text-cocoa/60">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input w-full border rounded p-2" />
        </div>
        <div className="ml-auto flex gap-2">
          <button type="button" onClick={exportCSV} className="btn btn-outline">Export CSV</button>
          <button type="button" onClick={exportPDF} className="btn btn-primary">Export PDF</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="p-4 rounded border bg-cream/30">
          <p className="text-sm text-cocoa/60">Total Sales</p>
          <p className="text-2xl font-bold text-caramel">{formatNgn(totalSales)}</p>
        </div>
        <div className="p-4 rounded border bg-cream/30">
          <p className="text-sm text-cocoa/60">Total Orders</p>
          <p className="text-2xl font-bold text-caramel">{totalOrders}</p>
        </div>
        <div className="p-4 rounded border bg-cream/30">
          <p className="text-sm text-cocoa/60">Avg Order Value</p>
          <p className="text-2xl font-bold text-caramel">{formatNgn(avgOrder)}</p>
        </div>
      </div>
      {topProducts.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold text-cocoa mb-2">Top Products</h3>
          <div className="space-y-2">
            {topProducts.map(([name, amt]) => (
              <div key={name} className="flex justify-between text-sm">
                <span>{name}</span>
                <span className="font-mono">{formatNgn(amt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
