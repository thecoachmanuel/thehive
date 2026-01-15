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

  const cssVars: Record<string, string> = {
    '--color-cocoa': '107 62 46',
    '--color-caramel': '239 168 110',
    '--color-primary': '239 168 110'
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
