import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    res.status(200).json({ ok: true })
    return
  }

  if (req.method === 'POST') {
    const cookieParts = [
      'user_session=',
      'HttpOnly',
      'Path=/',
      'Max-Age=0',
      process.env.NODE_ENV === 'production' ? 'Secure' : '',
      'SameSite=Lax'
    ].filter(Boolean)

    res.setHeader('Set-Cookie', cookieParts.join('; '))

    const location = '/'
    res.status(302).setHeader('Location', location)
    res.end()
    return
  }

  res.setHeader('Allow', ['GET', 'HEAD', 'POST'])
  res.status(405).json({ error: 'Method Not Allowed' })
}

