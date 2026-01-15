"use client"

import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
	prompt: () => Promise<void>
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export default function InstallPromptBanner() {
	const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
	const [visible, setVisible] = useState(false)

	useEffect(() => {
		if (typeof window === 'undefined') return
		if (window.matchMedia('(display-mode: standalone)').matches) return
		if (localStorage.getItem('pwa-install-banner') === 'done') return

		const handleBeforeInstall = (e: Event) => {
			e.preventDefault()
			setInstallEvent(e as BeforeInstallPromptEvent)
			setVisible(true)
		}

		const handleInstalled = () => {
			localStorage.setItem('pwa-install-banner', 'done')
			setVisible(false)
			setInstallEvent(null)
		}

		window.addEventListener('beforeinstallprompt', handleBeforeInstall)
		window.addEventListener('appinstalled', handleInstalled)

		return () => {
			window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
			window.removeEventListener('appinstalled', handleInstalled)
		}
	}, [])

	if (!visible || !installEvent) return null

	return (
		<div className="container pb-4">
			<div className="mx-auto max-w-md rounded-full border border-caramel/40 bg-white/95 backdrop-blur px-4 py-3 flex items-center gap-3 shadow-sm">
				<div className="flex-1 text-left">
					<p className="text-xs font-semibold text-cocoa">Add TheHive to your home screen</p>
					<p className="text-[11px] text-cocoa/70">Quick access to your cakes, menu, and orders.</p>
				</div>
				<button
					type="button"
					onClick={async () => {
						try {
							await installEvent.prompt()
							await installEvent.userChoice
						} finally {
							localStorage.setItem('pwa-install-banner', 'done')
							setVisible(false)
							setInstallEvent(null)
						}
					}}
					className="inline-flex items-center rounded-full border border-caramel text-[11px] font-medium text-caramel px-3 py-1 hover:bg-caramel/5 transition-colors"
				>
					Install app
				</button>
				<button
					type="button"
					onClick={() => {
						localStorage.setItem('pwa-install-banner', 'done')
						setVisible(false)
						setInstallEvent(null)
					}}
					className="text-cocoa/50 hover:text-cocoa text-xs px-1"
					aria-label="Dismiss install banner"
				>
					×
				</button>
			</div>
		</div>
	)
}

