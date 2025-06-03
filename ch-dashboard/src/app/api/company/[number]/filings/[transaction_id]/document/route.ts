// src/app/api/company/[number]/filings/[transaction_id]/document/route.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { chFetch } from "@/lib/chFetch"

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ number: string; transaction_id: string }> }
) {
  // 1) Await and unpack the dynamic params
  const { number, transaction_id } = await context.params

  // 2) Fetch the specific filing metadata
  //    This gives us the `links.document_metadata` URL
  const filingMeta = await chFetch(
    `/company/${number}/filing-history/${transaction_id}`
  )

  // 3) Fetch the metadata object to discover the true document URL
  //    (Some endpoints return a full URL in links.document)
  const metaPath = new URL(
    filingMeta.links.document_metadata,
    "https://api.company-information.service.gov.uk"
  ).pathname
  const docMeta = await chFetch(metaPath)

  // 4) Finally fetch the PDF bytes from the `links.document` URL
  const pdfUrl = docMeta.links.document
  const pdfRes = await fetch(pdfUrl, {
    headers: {
      // Basic auth your API key + empty password
      Authorization: `Basic ${Buffer.from(
        process.env.CH_API_KEY + ":"
      ).toString("base64")}`,
    },
  })
  if (!pdfRes.ok) {
    return NextResponse.json(
      { error: "Unable to download PDF", status: pdfRes.status },
      { status: pdfRes.status }
    )
  }
  const arrayBuffer = await pdfRes.arrayBuffer()

  // 5) Stream it back as a PDF attachment
  return new NextResponse(Buffer.from(arrayBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      // Let the browser download it with a sensible default name.
      "Content-Disposition": `attachment; filename="${transaction_id}.pdf"`,
    },
  })
}
