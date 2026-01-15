import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@components/CartProvider'
import { AuthProvider } from '@components/AuthProvider'
import { cookies } from 'next/headers'
import FloatingWhatsApp from '@components/FloatingWhatsApp'
import { isAdmin as isAdminSession } from '@lib/auth'
import CartReminder from '@components/CartReminder'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function hexToRgbTriplet(hex: string | null | undefined, fallback: string): string {
  if (!hex) return fallback
  const cleaned = hex.trim().replace('#', '')
  if (cleaned.length !== 6) return fallback
  const r = Number.parseInt(cleaned.slice(0, 2), 16)
  const g = Number.parseInt(cleaned.slice(2, 4), 16)
  const b = Number.parseInt(cleaned.slice(4, 6), 16)
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return fallback
  return `${r} ${g} ${b}`
}

export async function generateMetadata(): Promise<Metadata> {
	const siteName = 'TheHive Cakes'
	const baseUrl =
		process.env.NEXT_PUBLIC_BASE_URL ||
		process.env.NEXT_PUBLIC_APP_URL ||
		'http://localhost:3000'

  return {
    title: `${siteName} — Satisfying your cravings`,
    description:
      'Quality cakes, pastries, Chapman, and mocktails in Lagos. Secure online ordering with Paystack.',
    keywords: ['cakes', 'pastries', 'Chapman', 'mocktails', 'Lagos', 'Paystack'],
    openGraph: {
      title: siteName,
      description: 'Satisfying your cravings with every bite and sip.',
      url: baseUrl,
      type: 'website'
    },
    metadataBase: new URL(baseUrl)
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

  let settings: { primaryColor?: string | null; accentColor?: string | null; creamColor?: string | null; peachColor?: string | null; blushColor?: string | null; buttonTextColor?: string | null } | null = null
  try {
    const { prisma } = await import('@lib/db')
    settings = await prisma.siteSetting.findFirst()
  } catch {}

	const cssVars: Record<string, string> = {
		'--color-cocoa': hexToRgbTriplet(settings?.primaryColor, '107 62 46'),
		'--color-caramel': hexToRgbTriplet(settings?.accentColor ?? settings?.primaryColor, '239 168 110'),
		'--color-primary': hexToRgbTriplet(settings?.primaryColor ?? settings?.accentColor, '239 168 110'),
		'--color-cream': hexToRgbTriplet(settings?.creamColor, '245 233 218'),
		'--color-peach': hexToRgbTriplet(settings?.peachColor, '248 212 194'),
		'--color-blush': hexToRgbTriplet(settings?.blushColor, '244 182 194'),
		'--color-button-text': hexToRgbTriplet(settings?.buttonTextColor, '255 255 255')
	}

  return (
    <html lang="en">
      <body className="font-body" style={cssVars as React.CSSProperties}>
        <AuthProvider isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
          <CartProvider>
            {children}
            <FloatingWhatsApp />
            <CartReminder />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
