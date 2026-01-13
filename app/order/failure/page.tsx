import Header from '@components/Header'
import Footer from '@components/Footer'
import Image from 'next/image'
import Link from 'next/link'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default function Failure() {
  return (
    <div>
      <Header />
      <section className="container py-8 md:py-12">
        <div className="relative rounded-2xl overflow-hidden h-48 md:h-64 flex flex-col items-center justify-center text-center mb-8">
          <Image
            src="https://images.pexels.com/photos/134064/pexels-photo-134064.jpeg"
            alt="Failure Banner"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 text-white p-4">
            <h1 className="text-3xl md:text-5xl font-display font-bold">Payment Failed</h1>
            <p className="mt-2 text-white/90 text-lg">Something went wrong with your transaction.</p>
          </div>
        </div>
        <div className="card p-6 text-center max-w-2xl mx-auto">
          <p className="text-lg text-cocoa/80">Your payment could not be completed. Please try again or contact us on WhatsApp for assistance.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <a href="https://wa.me/2348166017556" target="_blank" className="btn btn-secondary inline-block">WhatsApp Support</a>
            <Link href="/cart" className="btn btn-primary inline-block">Try Again</Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
