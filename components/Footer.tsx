"use client"
import { InstagramIcon, TikTokIcon, WhatsAppIcon } from './SocialIcons'
import { whatsappIntl } from '@lib/utils'
import { useEffect, useState } from 'react'

type SiteSettings = {
	businessName?: string | null
	logoUrl?: string | null
	instagram?: string | null
	tiktok?: string | null
	whatsappNumber?: string | null
	location?: string | null
}

type BeforeInstallPromptEvent = Event & {
	prompt: () => Promise<void>
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export default function Footer() {
	const [settings, setSettings] = useState<SiteSettings | null>(null)
	const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
	const [canInstall, setCanInstall] = useState(false)
	const [installed, setInstalled] = useState(false)

	useEffect(() => {
		let active = true
		;(async () => {
			try {
				const res = await fetch('/api/site/settings')
				if (res.ok) {
					const json = await res.json()
					if (active) setSettings(json)
				}
			} catch {}
		})()
		return () => {
			active = false
		}
	}, [])

	useEffect(() => {
		const handleBeforeInstall = (e: Event) => {
			e.preventDefault()
			setInstallEvent(e as BeforeInstallPromptEvent)
			setCanInstall(true)
		}

		const handleInstalled = () => {
			setInstalled(true)
			setCanInstall(false)
			setInstallEvent(null)
		}

		window.addEventListener('beforeinstallprompt', handleBeforeInstall)
		window.addEventListener('appinstalled', handleInstalled)

		return () => {
			window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
			window.removeEventListener('appinstalled', handleInstalled)
		}
	}, [])

  const ig = settings?.instagram ? String(settings.instagram).replace(/^@/, '') : null
  const tk = settings?.tiktok ? String(settings.tiktok).replace(/^@/, '') : null
  const wa = settings?.whatsappNumber ? whatsappIntl(String(settings.whatsappNumber)) : null

  const igUrl = ig ? `https://instagram.com/${ig}` : null
  const tkUrl = tk ? `https://tiktok.com/@${tk}` : null
  const waUrl = wa ? `https://wa.me/${wa}` : null

	const businessName = settings?.businessName ?? 'TheHive Cakes'
	const location = settings?.location ?? 'Lagos, Nigeria'

	return (
		<footer className="mt-12 border-t border-cream">
			<div className="container py-8 text-sm text-cocoa/80 flex flex-col items-center justify-center gap-6 text-center">
				<div className="flex items-center gap-6">
					{igUrl && (
						<a href={igUrl} target="_blank" rel="noreferrer" className="text-cocoa hover:text-caramel transition-colors" aria-label="Instagram">
							<InstagramIcon className="w-6 h-6" />
						</a>
          )}
          {tkUrl && (
            <a href={tkUrl} target="_blank" rel="noreferrer" className="text-cocoa hover:text-caramel transition-colors" aria-label="TikTok">
              <TikTokIcon className="w-6 h-6" />
            </a>
          )}
					{waUrl && (
						<a href={waUrl} target="_blank" rel="noreferrer" className="text-cocoa hover:text-caramel transition-colors" aria-label="WhatsApp">
							<WhatsAppIcon className="w-6 h-6" />
						</a>
					)}
				</div>
				<div className="flex gap-4 items-center flex-wrap justify-center">
					<a href="/track" className="hover:text-caramel underline">Track Order</a>
					{canInstall && !installed && installEvent && (
						<button
							type="button"
							onClick={async () => {
								try {
									await installEvent.prompt()
									const choice = await installEvent.userChoice
									if (choice.outcome === 'accepted') {
										setInstalled(true)
									}
								} finally {
									setCanInstall(false)
									setInstallEvent(null)
								}
							}}
							className="text-xs md:text-sm text-caramel hover:text-cocoa underline-offset-2 hover:underline transition-colors"
						>
							Install app
						</button>
					)}
				</div>
				<p>© {new Date().getFullYear()} {businessName} · {location}</p>
			</div>
		</footer>
	)
}
