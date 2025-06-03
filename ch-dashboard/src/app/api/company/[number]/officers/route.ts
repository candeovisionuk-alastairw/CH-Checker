// src/app/api/company/[number]/officers/route.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { chFetch } from '@/lib/chFetch'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ number: string }> }
): Promise<NextResponse> {
  const { number } = await context.params
  const data = await chFetch(`/company/${number}/officers`)
  return NextResponse.json(data)
}
