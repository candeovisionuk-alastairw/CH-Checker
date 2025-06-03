// src/app/api/company/[number]/filings/route.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { chFetch } from '@/lib/chFetch'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ number: string }> }
): Promise<NextResponse> {
  const { number } = await context.params
  const data = await chFetch(`/company/${number}/filing-history`)
  return NextResponse.json(data)
}
