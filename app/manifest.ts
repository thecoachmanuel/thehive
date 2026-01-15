import type { MetadataRoute } from 'next'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
	let logoUrl: string | undefined
	let businessName = 'TheHive Cakes'

	try {
		const { prisma } = await import('@lib/db')
		const settings = await prisma.siteSetting.findFirst()
		if (settings?.logoUrl && settings.logoUrl.trim()) {
			logoUrl = settings.logoUrl
		}
		if (settings?.businessName && settings.businessName.trim()) {
			businessName = settings.businessName
		}
	} catch {}

	const icons: MetadataRoute.Manifest['icons'] = []
	if (logoUrl) {
		icons.push({
			src: logoUrl,
			sizes: '512x512',
			type: 'image/png',
			purpose: 'maskable'
		})
	}

	return {
		name: businessName,
		short_name: businessName.length > 12 ? 'TheHive' : businessName,
		start_url: '/',
		display: 'standalone',
		orientation: 'portrait',
		background_color: '#F5E9DA',
		theme_color: '#6B3E2E',
		icons
	}
}
