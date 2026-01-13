import Header from '@components/Header'
import Footer from '@components/Footer'
import { prisma } from '@lib/db'
import Image from 'next/image'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { InstagramIcon, TikTokIcon, WhatsAppIcon } from '@components/SocialIcons'

export default async function Contact() {
  const settings = await prisma.siteSetting.findFirst()
  const wa = settings?.whatsappNumber ?? '08166017556'
  const ig = settings?.instagram ?? 'Kakesnbake_by_Deejah'
  const tk = settings?.tiktok ?? 'Kakesnbake_by_Deejah'
  return (
    <div>
      <Header name={settings?.businessName} logoUrl={settings?.logoUrl ?? undefined} />
      <section className="container py-8 md:py-12">
        <div className="relative rounded-2xl overflow-hidden h-48 md:h-64 flex flex-col items-center justify-center text-center mb-8">
          <Image
            src="https://images.pexels.com/photos/102871/pexels-photo-102871.jpeg"
            alt="Contact Banner"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 text-white p-4">
            <h1 className="text-3xl md:text-5xl font-display font-bold">Contact</h1>
            <p className="mt-2 text-white/90 text-lg">We&apos;d love to hear from you.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          <form className="card p-6 lg:col-span-2" action="/api/contact" method="POST">
            <h2 className="text-xl font-bold text-cocoa mb-4">Send Us a Message</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-cocoa/70">Name</label>
                <input name="name" placeholder="Your full name" required className="input w-full border rounded p-2" />
              </div>
              <div>
                <label className="text-sm text-cocoa/70">Email</label>
                <input name="email" type="email" placeholder="you@example.com" required className="input w-full border rounded p-2" />
              </div>
              <div>
                <label className="text-sm text-cocoa/70">Phone (Optional)</label>
                <input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="08012345678" pattern="[+0-9][0-9\s().-]{9,}" className="input w-full border rounded p-2" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-cocoa/70">Message</label>
                <textarea name="message" placeholder="Tell us how we can help..." required className="input w-full border rounded p-2 h-32" />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button className="btn btn-primary">Send Message</button>
            </div>
          </form>
          <div className="card p-6">
            <h2 className="text-xl font-bold text-cocoa mb-4">Contact Information</h2>
            <p className="text-cocoa">Lagos, Nigeria</p>
            <p className="text-cocoa/70 text-sm mt-1">Open daily, 8:00 AM – 8:00 PM</p>
            <div className="flex items-center gap-4 mt-4">
              <a href={`https://wa.me/234${wa.replace(/^0/, '')}`} target="_blank" className="text-cocoa hover:text-caramel" aria-label="WhatsApp">
                <WhatsAppIcon className="w-6 h-6" />
              </a>
              <a href={`https://instagram.com/${ig}`} target="_blank" className="text-cocoa hover:text-caramel" aria-label="Instagram">
                <InstagramIcon className="w-6 h-6" />
              </a>
              <a href={`https://tiktok.com/@${tk}`} target="_blank" className="text-cocoa hover:text-caramel" aria-label="TikTok">
                <TikTokIcon className="w-6 h-6" />
              </a>
            </div>
            <iframe
              className="mt-6 w-full h-48 rounded-2xl"
              loading="lazy"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63517.40406023295!2d3.333!3d6.580!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8d1c3918b18b%3A0x8c5b5d1dd3b8!2sLagos%2C%20Nigeria!5e0!3m2!1sen!2sng!4v1700000000000"
            />
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
