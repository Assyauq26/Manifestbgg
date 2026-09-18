import { NextRequest, NextResponse } from "next/server";
import { normalizeAwb, validateAwbFormat } from "@/lib/manifest";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const awb = normalizeAwb(String(body.awb ?? ""));

  if (!awb) return NextResponse.json({ success: false, code: "EMPTY_AWB", message: "AWB kosong." }, { status: 400 });
  if (!validateAwbFormat(awb)) {
    return NextResponse.json({ success: false, code: "INVALID_AWB", message: "Format AWB tidak valid.", awb }, { status: 422 });
  }

  return NextResponse.json({
    success: true,
    code: "VALID",
    awb,
    status: "SCANNED"
  });
}
