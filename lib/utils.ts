export function formatNgn(amountNgn: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amountNgn)
}

export function whatsappIntl(numberNg: string) {
  const cleaned = numberNg.replace(/\D/g, '')
  if (cleaned.startsWith('0')) return `234${cleaned.slice(1)}`
  if (cleaned.startsWith('234')) return cleaned
  return cleaned
}

export function isValidPhoneNumber(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return false
  if (!/^[+\d][\d\s().-]*$/.test(trimmed)) return false
  const digits = trimmed.replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 15
}

export function buildWhatsappMessage(params: {
  businessNumber: string
  customerName: string
  orderId: number
  total: number
  items: { name: string; qty: number; price: number }[]
}) {
  const lines = [
    `Order Confirmation — kakesnbake_by_Deejah`,
    `Customer: ${params.customerName}`,
    `Order ID: ${params.orderId}`,
    `Items:`,
    ...params.items.map((i) => `• ${i.name} x${i.qty} — ₦${i.price * i.qty}`),
    `Total Paid: ₦${params.total}`
  ]
  const text = encodeURIComponent(lines.join('\n'))
  const intl = whatsappIntl(params.businessNumber)
  return `https://wa.me/${intl}?text=${text}`
}
