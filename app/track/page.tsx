import Header from '@components/Header'
import Footer from '@components/Footer'
import TrackOrderClient from '@components/TrackOrderClient'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default function TrackOrder() {
	return (
		<div>
			<Header />
			<TrackOrderClient />
			<Footer />
		</div>
	)
}
