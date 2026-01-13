import Header from '@components/Header'
import Footer from '@components/Footer'
import TrackOrderClient from '@components/TrackOrderClient'
import { prisma } from '@lib/db'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default async function TrackOrder() {
  const settings = await prisma.siteSetting.findFirst()
  return (
    <div>
      <Header name={settings?.businessName} logoUrl={settings?.logoUrl ?? undefined} />
      <TrackOrderClient />
      <Footer />
    </div>
  )
}
