// src/app/api/document/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { chFetch } from "@/lib/chFetch";

export async function GET(req: NextRequest) {
  const metaPath = req.nextUrl.searchParams.get("metaPath");
  if (!metaPath) {
    return new NextResponse("Missing metaPath", { status: 400 });
  }

  let docMeta: any;
  try {
    if (metaPath.startsWith("http")) {
      // Full URL to the document-metadata service
      const metaRes = await fetch(metaPath, {
        headers: {
          Authorization: `Basic ${Buffer.from(
            process.env.CH_API_KEY + ":"
          ).toString("base64")}`,
        },
      });
      if (!metaRes.ok) {
        throw new Error(`meta URL fetch failed: ${metaRes.status}`);
      }
      docMeta = await metaRes.json();
    } else {
      // Relative path on the main CH API
      docMeta = await chFetch(metaPath);
    }
  } catch (err: any) {
    return new NextResponse(`Metadata fetch failed: ${err.message}`, {
      status: 502,
    });
  }

  // Now fetch the PDF itself
  const pdfUrl = docMeta.links.document;
  const pdfRes = await fetch(pdfUrl, {
    headers: {
      Authorization: `Basic ${Buffer.from(
        process.env.CH_API_KEY + ":"
      ).toString("base64")}`,
    },
  });
  if (!pdfRes.ok) {
    return new NextResponse("Unable to download PDF", {
      status: pdfRes.status,
    });
  }

  const arrayBuffer = await pdfRes.arrayBuffer();
  const filename = `${docMeta.transaction_id}.pdf`;

  return new NextResponse(Buffer.from(arrayBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
