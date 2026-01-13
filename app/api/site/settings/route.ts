import { NextResponse } from 'next/server'
import { prisma } from '@lib/db'

export async function GET() {
  const s = await prisma.siteSetting.findFirst()
  return NextResponse.json(s ?? {})
}
