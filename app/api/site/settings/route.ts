import { NextResponse } from 'next/server'
import { prisma } from '@lib/db'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const s = await prisma.siteSetting.findFirst()
  return NextResponse.json(s ?? {})
}
