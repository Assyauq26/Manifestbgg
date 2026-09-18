import { NextRequest, NextResponse } from "next/server";
import { formatManifestNumber, sellerCodeFromName } from "@/lib/manifest";
export async function POST(request: NextRequest) {
  const body = await request.json();
  const sellerCode = String(body.sellerCode || sellerCodeFromName(String(body.sellerName || "")));
  const date = String(body.date || new Date().toISOString().slice(0, 10));
  const sequence = Number(body.sequence || 1);
  if (!Number.isInteger(sequence) || sequence < 1) {
    return NextResponse.json({ error: "Invalid sequence" }, { status: 400 });
  }
  return NextResponse.json({ manifestNumber: formatManifestNumber(sellerCode, date, sequence) });
}
