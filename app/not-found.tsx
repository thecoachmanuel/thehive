import Link from 'next/link'
import Header from '@components/Header'
import Footer from '@components/Footer'
import { prisma } from '@lib/db'

export default async function NotFound() {
  const settings = await prisma.siteSetting.findFirst()

  return (
    <div className="flex flex-col min-h-screen">
      <Header name={settings?.businessName} logoUrl={settings?.logoUrl ?? undefined} />
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-cream/30">
        <h1 className="text-9xl font-display font-bold text-caramel/20">404</h1>
        <h2 className="text-3xl font-bold text-cocoa mt-4">Page Not Found</h2>
        <p className="text-cocoa/70 mt-2 max-w-md">
          Oops! The page you are looking for might have been removed or doesn&apos;t exist.
        </p>
        <Link href="/" className="btn btn-primary mt-8">
          Back to Home
        </Link>
      </div>
      <Footer />
    </div>
  )
}
