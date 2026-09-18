import { NextResponse } from "next/server";
import { findManifest, listManifestItems, googleErrorMessage } from "@/lib/google/data";

export const runtime = "nodejs";

type Context = { params: Promise<{ manifestId: string }> };

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
