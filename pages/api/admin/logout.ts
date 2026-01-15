import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    res.status(200).json({ ok: true })
    return
  }

	if (req.method === 'OPTIONS') {
		res.setHeader('Allow', ['GET', 'HEAD', 'POST'])
		res.status(204).end()
		return
	}

	if (req.method === 'POST') {
		const appUrl =
			process.env.NEXT_PUBLIC_BASE_URL ||
			process.env.NEXT_PUBLIC_APP_URL ||
			'http://localhost:3000'

    const baseCookie = 'HttpOnly; Path=/; Max-Age=0' + (process.env.NODE_ENV === 'production' ? '; Secure' : '')

    res.setHeader('Set-Cookie', [
      `admin_session=; ${baseCookie}`,
      `user_session=; ${baseCookie}`
    ])

    res.writeHead(302, { Location: new URL('/admin/login', appUrl).toString() })
    res.end()
    return
  }

	res.setHeader('Allow', ['GET', 'HEAD', 'POST'])
	res.status(405).json({ error: 'Method Not Allowed' })
}
