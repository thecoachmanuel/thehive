import axios from 'axios'

const BASE = 'https://api.paystack.co'

export async function initializePayment(amountNaira: number, email: string, metadata: Record<string, unknown>) {
  const key = process.env.PAYSTACK_SECRET_KEY
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  if (!key) throw new Error('PAYSTACK_SECRET_KEY not set')
  const res = await axios.post(
    `${BASE}/transaction/initialize`,
    { amount: amountNaira * 100, email, currency: 'NGN', metadata, callback_url: `${baseUrl}/order/success` },
    { headers: { Authorization: `Bearer ${key}` } }
  )
  return res.data
}

export async function verifyPayment(reference: string) {
  const key = process.env.PAYSTACK_SECRET_KEY
  if (!key) throw new Error('PAYSTACK_SECRET_KEY not set')
  const res = await axios.get(`${BASE}/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${key}` }
  })
  return res.data
}
