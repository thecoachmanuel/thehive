import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@components/CartProvider'
import { AuthProvider } from '@components/AuthProvider'
import { cookies } from 'next/headers'
import FloatingWhatsApp from '@components/FloatingWhatsApp'
import { prisma } from '@lib/db'
import { isAdmin as isAdminSession } from '@lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const fallbackName = 'TheHive Cakes'
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    const settings = await prisma.siteSetting.findFirst()
    const siteName = settings?.businessName || fallbackName
    return {
      title: `${siteName} — Satisfying your cravings`,
      description: 'Quality cakes, pastries, Chapman, and mocktails in Lagos. Secure online ordering with Paystack.',
      keywords: ['cakes', 'pastries', 'Chapman', 'mocktails', 'Lagos', 'Paystack'],
      openGraph: {
        title: siteName,
        description: 'Satisfying your cravings with every bite and sip.',
        url: baseUrl,
        type: 'website'
      },
      metadataBase: new URL(baseUrl)
    }
  } catch {
    return {
      title: `${fallbackName} — Satisfying your cravings`,
      description: 'Quality cakes, pastries, Chapman, and mocktails in Lagos. Secure online ordering with Paystack.',
      keywords: ['cakes', 'pastries', 'Chapman', 'mocktails', 'Lagos', 'Paystack']
    }
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = cookies().get('user_session')
  const isLoggedIn = !!session?.value

  let isAdmin = false
  try {
    isAdmin = isAdminSession()
  } catch {
    isAdmin = false
  }

  if (isLoggedIn && session?.value) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(session.value) },
        select: { role: true }
      })
      if (user?.role === 'ADMIN') {
        isAdmin = true
      }
    } catch {
      isAdmin = isAdmin
    }
  }

  let settings: unknown = null
  try {
    settings = await prisma.siteSetting.findFirst()
  } catch {
    settings = null
  }

  const s = (settings ?? {}) as { primaryColor?: string | null; accentColor?: string | null; creamColor?: string | null; peachColor?: string | null; blushColor?: string | null }

  function hexToTriplet(hex?: string | null): string | undefined {
    if (!hex) return undefined
    const cleaned = hex.replace('#', '')
    if (cleaned.length !== 6) return undefined
    const r = parseInt(cleaned.slice(0,2), 16)
    const g = parseInt(cleaned.slice(2,4), 16)
    const b = parseInt(cleaned.slice(4,6), 16)
    return `${r} ${g} ${b}`
  }

  const primary = hexToTriplet(s.primaryColor) || '107 62 46'
  const accent = hexToTriplet(s.accentColor) || '239 168 110'
  const cream = hexToTriplet(s.creamColor)
  const peach = hexToTriplet(s.peachColor)
  const blush = hexToTriplet(s.blushColor)

  const cssVars: Record<string, string> = {
    '--color-cocoa': primary,
    '--color-caramel': accent,
    '--color-primary': accent,
    ...(cream ? { '--color-cream': cream } : {}),
    ...(peach ? { '--color-peach': peach } : {}),
    ...(blush ? { '--color-blush': blush } : {})
  }

  return (
    <html lang="en">
      <body className="font-body" style={cssVars as React.CSSProperties}>
        <AuthProvider isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
          <CartProvider>
            {children}
            <FloatingWhatsApp />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
