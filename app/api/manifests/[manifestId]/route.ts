import { NextResponse } from "next/server";
import { appendActivityLog, findManifest, listManifestItems, googleErrorMessage, updateManifestStatus } from "@/lib/google/data";
import { ManifestStatus } from "@/types/domain";

export const runtime = "nodejs";

type Context = { params: Promise<{ manifestId: string }> };

const VALID_STATUSES: ManifestStatus[] = ["DRAFT", "READY", "IN_DELIVERY", "HANDED_OVER", "COMPLETED", "CANCELLED"];

export async function GET(_request: Request, context: Context) {
  try {
    const { manifestId } = await context.params;
    const manifest = await findManifest(manifestId);
    if (!manifest) return NextResponse.json({ ok: false, error: "Manifest tidak ditemukan." }, { status: 404 });
    const items = await listManifestItems(manifestId);
    return NextResponse.json({ ok: true, manifest, items });
  } catch (error) {
    return NextResponse.json({ ok: false, error: googleErrorMessage(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    const { manifestId } = await context.params;
    const body = await request.json();
    const status = String(body.status ?? "").trim().toUpperCase() as ManifestStatus;
    const manifest = await findManifest(manifestId);

    if (!manifest) return NextResponse.json({ ok: false, error: "Manifest tidak ditemukan." }, { status: 404 });
    if (!VALID_STATUSES.includes(status)) return NextResponse.json({ ok: false, error: "Status manifest tidak valid." }, { status: 400 });
    if (manifest.status === "COMPLETED" && status !== "COMPLETED") {
      return NextResponse.json({ ok: false, error: "Manifest yang sudah COMPLETED tidak dapat diubah." }, { status: 409 });
    }
    if (manifest.status === "CANCELLED" && status !== "CANCELLED") {
      return NextResponse.json({ ok: false, error: "Manifest yang sudah CANCELLED tidak dapat dibuka kembali." }, { status: 409 });
    }

    const items = await listManifestItems(manifestId);
    if (status === "READY" && items.length === 0) {
      return NextResponse.json({ ok: false, error: "Manifest harus memiliki minimal 1 AWB sebelum READY." }, { status: 409 });
    }

    const fields = {
      handed_over_at: body.handedOverAt ? String(body.handedOverAt) : undefined,
      received_by: body.receivedBy ? String(body.receivedBy).trim() : undefined,
      received_phone: body.receivedPhone ? String(body.receivedPhone).trim() : undefined,
      notes: body.notes !== undefined ? String(body.notes).trim() : undefined,
    };

    const updated = await updateManifestStatus(manifestId, status, fields);

    await appendActivityLog({
      log_id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      user_id: String(body.userId ?? "COURIER").trim() || "COURIER",
      action: "MANIFEST_STATUS_CHANGED",
      manifest_id: manifestId,
      old_value: manifest.status,
      new_value: status,
      description: `Status manifest ${manifest.manifest_number} berubah dari ${manifest.status} menjadi ${status}.`,
      device: String(body.device ?? "WEB").trim() || "WEB",
    });

    return NextResponse.json({ ok: true, manifest: updated, items });
  } catch (error) {
    return NextResponse.json({ ok: false, error: googleErrorMessage(error) }, { status: 500 });
  }
}
