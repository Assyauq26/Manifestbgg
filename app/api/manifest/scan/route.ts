import { NextRequest, NextResponse } from "next/server";
import { appendManifestItem, findManifest, googleErrorMessage, listManifestItems, updateManifestTotal } from "@/lib/google/data";
import { normalizeAwb, validateAwbFormat } from "@/lib/manifest";
import { ManifestItem } from "@/types/domain";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const manifestId = String(body.manifestId ?? "").trim();
    const awb = normalizeAwb(String(body.awb ?? ""));

    if (!manifestId) return NextResponse.json({ success: false, code: "MISSING_MANIFEST", message: "Manifest belum dipilih." }, { status: 400 });
    if (!awb) return NextResponse.json({ success: false, code: "EMPTY_AWB", message: "AWB kosong." }, { status: 400 });
    if (!validateAwbFormat(awb)) return NextResponse.json({ success: false, code: "INVALID_AWB", message: "Format AWB tidak valid.", awb }, { status: 422 });

    const manifest = await findManifest(manifestId);
    if (!manifest) return NextResponse.json({ success: false, code: "MANIFEST_NOT_FOUND", message: "Manifest tidak ditemukan." }, { status: 404 });
    if (manifest.status === "COMPLETED" || manifest.status === "CANCELLED") {
      return NextResponse.json({ success: false, code: "MANIFEST_CLOSED", message: "Manifest sudah ditutup." }, { status: 409 });
    }

    const items = await listManifestItems(manifestId);
    const duplicate = items.find((item) => item.awb === awb);
    if (duplicate) {
      return NextResponse.json({ success: false, code: "DUPLICATE_AWB", message: "AWB sudah ada di manifest ini.", awb, item: duplicate }, { status: 409 });
    }

    const item: ManifestItem = {
      item_id: crypto.randomUUID(),
      manifest_id: manifestId,
      sequence: items.length + 1,
      awb,
      status: "SCANNED",
      scanned_at: new Date().toISOString(),
      scanned_by: "COURIER",
      created_at: new Date().toISOString(),
    };

    await appendManifestItem(item);
    await updateManifestTotal(manifestId, item.sequence);

    return NextResponse.json({ success: true, code: "SCANNED", awb, item, totalAwb: item.sequence });
  } catch (error) {
    return NextResponse.json({ success: false, code: "SERVER_ERROR", message: googleErrorMessage(error) }, { status: 500 });
  }
}
