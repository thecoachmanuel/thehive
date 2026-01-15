import { cookies } from 'next/headers'
import crypto from 'crypto'

const COOKIE_NAME = 'admin_session'

function sign(payload: string) {
  const secret = process.env.ADMIN_SECRET || 'change-me'
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(payload)
  return `${payload}.${hmac.digest('hex')}`
}

function verify(token: string) {
  const [payload, signature] = token.split('.')
  const secret = process.env.ADMIN_SECRET || 'change-me'
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(payload)
  return signature === hmac.digest('hex')
}

export async function setAdminSession() {
	const payload = `${Date.now()}`
	const token = sign(payload)
	return token
}

export function isAdmin() {
  const token = cookies().get(COOKIE_NAME)?.value
  if (!token) return false
  return verify(token)
}

export function clearAdmin() {
  cookies().delete(COOKIE_NAME)
}
