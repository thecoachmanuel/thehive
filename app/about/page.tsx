import Header from '@components/Header'
import Footer from '@components/Footer'
import { prisma } from '@lib/db'
import Image from 'next/image'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default async function About() {
  let settings: { businessName?: string | null; logoUrl?: string | null; yearsExperience?: number | null; tagline?: string | null } | null = null
  try {
    settings = await prisma.siteSetting.findFirst()
  } catch {
    settings = null
  }

  const businessName = settings?.businessName || 'TheHive Cakes'
  const logoUrl = settings?.logoUrl || undefined
  const yearsExperience = settings?.yearsExperience ?? 4
  const tagline = settings?.tagline || 'Satisfying your cravings with every bite and sip.'

  return (
    <div>
      <Header name={businessName} logoUrl={logoUrl} />
      <section className="container py-8 md:py-12">
        <div className="relative rounded-2xl overflow-hidden h-48 md:h-64 flex flex-col items-center justify-center text-center mb-8">
          <Image
            src="https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg"
            alt="About Banner"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 text-white p-4">
            <h1 className="text-3xl md:text-5xl font-display font-bold">About Us</h1>
            <p className="mt-2 text-white/90 text-lg">Our story of baking happiness.</p>
          </div>
        </div>
        <p className="text-cocoa/80 max-w-3xl leading-relaxed mx-auto">
          At {businessName}, we&apos;ve spent the past {yearsExperience} years
          delighting Lagos with our delicious cakes, pastries, Chapman, and mocktails. Our passion is to satisfy your
          cravings with every bite and sip. We believe in quality, creativity, and making every order special just for you.
          Whether it&apos;s a celebration or a simple treat, we&apos;re here to bring joy and flavor to your day. Thanks for being
          part of our journey!
        </p>
        <div className="mt-8 p-6 rounded-2xl bg-cream mx-auto max-w-3xl">
          <p className="font-medium text-cocoa text-center">“{tagline}”</p>
        </div>
      </section>
      <Footer />
    </div>
  )
}
