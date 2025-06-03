// src/app/api/officer/[id]/appointments/route.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { chFetch } from '@/lib/chFetch'

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const data = await chFetch(`/officers/${id}/appointments`)
  return NextResponse.json(data)
}
