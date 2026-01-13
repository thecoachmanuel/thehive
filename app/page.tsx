import Header from '@components/Header'
import Footer from '@components/Footer'
import HeroSlider from '@components/HeroSlider'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@lib/db'

export default async function Home() {
  const settings = await prisma.siteSetting.findFirst()
  const slides = await prisma.slide.findMany({ where: { active: true } })
  const sliderData = slides.length
    ? slides.map((s) => ({ id: String(s.id), imageUrl: s.imageUrl, headline: s.headline, subtext: s.subtext, ctaText: s.ctaText ?? undefined, ctaLink: s.ctaLink ?? undefined }))
    : undefined
  const categories = await prisma.category.findMany()
  const visibleCategories = categories.filter(c => c.imageUrl)

  return (
    <div>
      <Header name={settings?.businessName} logoUrl={settings?.logoUrl ?? undefined} />
      <HeroSlider slides={sliderData} siteName={settings?.businessName ?? undefined} />
      <section className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {visibleCategories.map((c) => (
            <Link key={c.id} href={`/shop?category=${c.slug}`} className="card overflow-hidden group">
              <div className="relative h-48">
                <Image src={c.imageUrl!} alt={c.name} fill className="object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-cocoa">{c.name}</h3>
                <p className="text-sm text-cocoa/70">Explore delicious {c.name.toLowerCase()} made with love.</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="bg-cream text-center">
        <div className="container py-12 md:py-16 flex flex-col items-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-cocoa">Trusted by Lagos for 4 years</h2>
          <p className="mt-3 text-cocoa/80 max-w-2xl mx-auto">
            We bring warmth, quality, and joyful experiences to every bite and sip. Personalized orders crafted to
            satisfy your cravings.
          </p>
          <div className="mt-6">
            <Link href="/shop" className="btn btn-primary">Shop Now</Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
