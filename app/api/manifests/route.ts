import { NextRequest, NextResponse } from "next/server";
import { appendManifest, googleErrorMessage, listManifests, nextManifestSequence } from "@/lib/google/data";
import { formatManifestNumber, sellerCodeFromName } from "@/lib/manifest";
import { Manifest } from "@/types/domain";

export const runtime = "nodejs";

export async function GET() {
  try {
    const manifests = await listManifests();
    return NextResponse.json({ ok: true, manifests });
  } catch (error) {
    return NextResponse.json({ ok: false, error: googleErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sellerName = String(body.sellerName ?? "").trim();
    const date = String(body.date ?? new Date().toISOString().slice(0, 10));
    const shift = String(body.shift ?? "PAGI").trim().toUpperCase();
    const dropPoint = String(body.dropPoint ?? "BGG16").trim().toUpperCase();
    const sprinterName = String(body.sprinterName ?? "").trim();

    if (!sellerName) return NextResponse.json({ ok: false, error: "Seller wajib diisi." }, { status: 400 });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ ok: false, error: "Tanggal tidak valid." }, { status: 400 });
    if (!sprinterName) return NextResponse.json({ ok: false, error: "Nama sprinter wajib diisi." }, { status: 400 });

    const sellerCode = sellerCodeFromName(sellerName);
    const sequence = await nextManifestSequence(date, sellerCode);
    const now = new Date().toISOString();
    const manifestId = crypto.randomUUID();
    const manifest: Manifest = {
      manifest_id: manifestId,
      manifest_number: formatManifestNumber(sellerCode, date, sequence),
      manifest_date: date,
      shift,
      drop_point: dropPoint,
      sprinter_id: sprinterName.toUpperCase(),
      seller_id: sellerName.toUpperCase(),
      seller_code: sellerCode,
      pic_name: "",
      pic_phone: "",
      total_awb: 0,
      status: "DRAFT",
      created_by: "COURIER",
      created_at: now,
      updated_at: now,
    };

    await appendManifest(manifest);
    return NextResponse.json({ ok: true, manifest }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: googleErrorMessage(error) }, { status: 500 });
  }
}
