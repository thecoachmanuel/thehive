/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import Header from '@components/Header'
import Footer from '@components/Footer'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [site, setSite] = useState<{ businessName?: string; logoUrl?: string } | null>(null)

  useEffect(() => {
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
    return () => {
      active = false
    }
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData as any)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        router.push('/account')
        router.refresh()
      } else {
        const json = await res.json()
        setError(json.error || 'Login failed')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Header name={site?.businessName} logoUrl={site?.logoUrl ?? undefined} />
      <div className="container py-12 min-h-[60vh] flex items-center justify-center">
        <div className="card max-w-md w-full p-8">
          <h1 className="text-2xl font-display font-bold text-cocoa text-center mb-6">Welcome Back</h1>
          
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-cocoa mb-1">Email Address</label>
              <input 
                name="email" 
                type="email" 
                required 
                className="input w-full border rounded p-2"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-cocoa mb-1">Password</label>
              <input 
                name="password" 
                type="password" 
                required 
                className="input w-full border rounded p-2"
                placeholder="••••••••"
              />
            </div>
            
            <button 
              disabled={loading}
              className="btn btn-primary w-full py-3"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-cocoa/70">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-caramel font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
